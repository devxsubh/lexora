import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '~/config/config';
import { withGeminiRetry } from '~/utils/geminiRetry';
import Contract, { type IBlock } from '~/models/contractModel';
import AiChatSession from '~/models/aiChatSessionModel';
import AiMessage from '~/models/aiMessageModel';
import Activity from '~/models/activityModel';
import { NotFoundError, ValidationError } from '~/utils/domainErrors';
import { v4 as uuidv4 } from 'uuid';
import { buildContractTreeIndex, collectNodesForPrompt, formatSourceLines } from '~/services/pageIndex/contractTree';

function getGeminiModel() {
	if (!config.GEMINI_API_KEY) return null;
	const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
	return genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
}

async function generateWithOllama(prompt: string): Promise<{ response: { text: () => string } }> {
	const baseUrl = (config.OLLAMA_BASE_URL || '').trim();
	const model = (config.OLLAMA_MODEL || '').trim();
	if (!baseUrl || !model) {
		throw new ValidationError('AI features require GEMINI_API_KEY or OLLAMA_MODEL to be configured');
	}

	const res = await fetch(`${baseUrl}/api/generate`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ model, prompt, stream: false })
	});
	if (!res.ok) {
		throw new ValidationError(`Ollama request failed (${res.status})`);
	}

	const data = (await res.json()) as { response?: string };
	return { response: { text: () => data.response ?? '' } };
}

type StreamChunk = { text: () => string };

async function* generateStreamWithOllama(prompt: string): AsyncGenerator<StreamChunk> {
	const baseUrl = (config.OLLAMA_BASE_URL || '').trim();
	const model = (config.OLLAMA_MODEL || '').trim();
	if (!baseUrl || !model) {
		throw new ValidationError('AI features require GEMINI_API_KEY or OLLAMA_MODEL to be configured');
	}

	const res = await fetch(`${baseUrl}/api/generate`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ model, prompt, stream: true })
	});
	if (!res.ok || !res.body) {
		throw new ValidationError(`Ollama streaming request failed (${res.status})`);
	}

	const reader = res.body.getReader();
	const decoder = new TextDecoder('utf-8');
	let buffer = '';

	while (true) {
		const { done, value } = await reader.read();
		if (done) break;

		buffer += decoder.decode(value, { stream: true });
		const parts = buffer.split('\n');
		buffer = parts.pop() || '';

		for (const part of parts) {
			const trimmed = part.trim();
			if (!trimmed) continue;
			try {
				const json = JSON.parse(trimmed) as { response?: string; done?: boolean };
				if (typeof json.response === 'string' && json.response.length > 0) {
					yield { text: () => json.response as string };
				}
				if (json.done) return;
			} catch {
				// Ignore partial JSON fragments.
			}
		}
	}
}

async function generateWithRetry(prompt: string) {
	const geminiModel = getGeminiModel();
	if (geminiModel) {
		return withGeminiRetry(() => geminiModel.generateContent(prompt));
	}

	return generateWithOllama(prompt);
}

async function generateStreamWithRetry(prompt: string) {
	const geminiModel = getGeminiModel();
	if (geminiModel) {
		return withGeminiRetry(() => geminiModel.generateContentStream(prompt));
	}

	return { stream: generateStreamWithOllama(prompt) };
}

/** Minimal Gemini call for connectivity checks (uses quota). */
export async function geminiPing() {
	const prompt = 'hi';
	const result = await generateWithRetry(prompt);
	return { prompt, reply: result.response.text() };
}

function blocksToText(blocks: Record<string, unknown>[]): string {
	if (!blocks || !Array.isArray(blocks)) return '';

	return blocks
		.map((block) => {
			const contentArr = block.content as Array<{ type: string; text?: string }> | undefined;
			const text =
				contentArr
					?.filter((c) => c.type === 'text' && c.text)
					.map((c) => c.text)
					.join('') ?? '';

			const children = block.children as Record<string, unknown>[] | undefined;
			const childText = children ? blocksToText(children) : '';

			const prefix =
				block.type === 'heading'
					? '\n## '
					: block.type === 'bulletListItem'
					? '• '
					: block.type === 'numberedListItem'
					? '- '
					: '';

			return `${prefix}${text}${childText ? '\n' + childText : ''}`;
		})
		.filter(Boolean)
		.join('\n');
}

function textToBlocks(text: string): Record<string, unknown>[] {
	return text
		.split('\n')
		.filter(Boolean)
		.map((line) => {
			const trimmed = line.trim();
			if (trimmed.startsWith('# ')) {
				return {
					id: uuidv4(),
					type: 'heading',
					props: { level: 1 },
					content: [{ type: 'text', text: trimmed.replace(/^#\s+/, ''), styles: {} }]
				};
			}
			if (trimmed.startsWith('## ')) {
				return {
					id: uuidv4(),
					type: 'heading',
					props: { level: 2 },
					content: [{ type: 'text', text: trimmed.replace(/^##\s+/, ''), styles: {} }]
				};
			}
			if (trimmed.startsWith('### ')) {
				return {
					id: uuidv4(),
					type: 'heading',
					props: { level: 3 },
					content: [{ type: 'text', text: trimmed.replace(/^###\s+/, ''), styles: {} }]
				};
			}
			if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
				return {
					id: uuidv4(),
					type: 'bulletListItem',
					props: {},
					content: [{ type: 'text', text: trimmed.replace(/^[•\-*]\s+/, ''), styles: {} }]
				};
			}
			return {
				id: uuidv4(),
				type: 'paragraph',
				props: {},
				content: [{ type: 'text', text: trimmed, styles: {} }]
			};
		});
}

type StreamEvent =
	| { type: 'chunk'; text: string }
	| { type: 'done'; contractId: string; title: string; content: Record<string, unknown>[] }
	| { type: 'error'; message: string };

export async function sendChatMessage(contractId: string, userId: string, message: string) {
	const contract = await Contract.findOne({ _id: contractId, userId });
	if (!contract) throw new NotFoundError('Contract not found');

	let session = await AiChatSession.findOne({ contractId, userId });
	if (!session) {
		session = await AiChatSession.create({ contractId, userId });
	}

	await AiMessage.create({
		sessionId: session._id,
		role: 'user',
		content: message
	});

	const history = await AiMessage.find({ sessionId: session._id }).sort({ createdAt: 1 }).limit(20);

	const contractText = blocksToText(contract.content as unknown as Record<string, unknown>[]);

	const prompt = `You are a legal contract assistant for the document titled "${contract.title}".

Contract content:
${contractText}

Chat history:
${history.map((m) => `${m.role}: ${m.content}`).join('\n')}

User: ${message}

Provide a helpful, accurate response. If the user asks to modify the contract, describe what changes should be made. Be concise and professional.`;

	const result = await generateWithRetry(prompt);
	const responseText = result.response.text();

	const assistantMsg = await AiMessage.create({
		sessionId: session._id,
		role: 'assistant',
		content: responseText
	});

	return {
		id: assistantMsg.id,
		role: 'assistant' as const,
		content: responseText,
		timestamp: assistantMsg.createdAt?.toISOString()
	};
}

function tryParseJsonResponse<T>(text: string): T | null {
	const cleaned = text
		.replace(/```json\n?/g, '')
		.replace(/```\n?/g, '')
		.trim();
	try {
		return JSON.parse(cleaned) as T;
	} catch {
		return null;
	}
}

type GroundedCitation = {
	startLine: number;
	endLine: number;
	quote: string;
};

function isEditRequest(message: string): boolean {
	const m = message.toLowerCase();
	// Heuristic: if the user asks to change content, we keep the current "editedContract" behavior.
	return /(modify|edit|rewrite|change|insert|remove|replace|amend|update|propose)\b/i.test(m);
}

function buildContractTextForEdits(contractBlocks: IBlock[]): string {
	// Uses the existing blocksToText formatting so the editor prompt stays consistent.
	return blocksToText(contractBlocks as unknown as Record<string, unknown>[]);
}

export async function sendChatMessageWithEdits(contractId: string, userId: string, message: string) {
	const contract = await Contract.findOne({ _id: contractId, userId });
	if (!contract) throw new NotFoundError('Contract not found');

	let session = await AiChatSession.findOne({ contractId, userId });
	if (!session) {
		session = await AiChatSession.create({ contractId, userId });
	}

	await AiMessage.create({
		sessionId: session._id,
		role: 'user',
		content: message
	});

	const history = await AiMessage.find({ sessionId: session._id }).sort({ createdAt: 1 }).limit(20);

	const contractBlocks = (contract.content ?? []) as unknown as IBlock[];
	const contractTextForEdits = buildContractTextForEdits(contractBlocks);

	const needsEdit = isEditRequest(message);

	// Build a tree index for line-level citations (verifiable, grounded retrieval).
	const treeIndex = buildContractTreeIndex(contractBlocks);

	// Pick a compact, hierarchical subset of nodes to show the model (tree-search without vectors).
	const candidateNodes = collectNodesForPrompt(treeIndex, needsEdit ? 60 : 45, 5);
	const selectionPrompt = `You are a reasoning-based document retriever.

You will be given a hierarchical tree index of a contract, derived from its headings.
Each node has:
- nodeId (unique)
- title
- level (heading depth)
- summary (short)
- startLine/endLine (1-based, inclusive)

Given the user question, select up to ${needsEdit ? 8 : 6} nodeIds that most likely contain the answer.

Rules:
- Only select nodeIds that exist in the provided list.
- Prefer more specific (deeper) nodes when relevant.
- If nothing fits, return an empty array.

Return ONLY valid JSON:
{
  "selectedNodeIds": string[],
  "notes": string
}

User question:
${message}

Tree nodes:
${candidateNodes
	.map((n) => {
		const parent = n.parentId ? ` (parent: ${n.parentId})` : '';
		return `- ${n.nodeId}${parent}
  title: ${n.title}
  level: ${n.level}
  summary: ${n.summary}
  lines: ${n.startLine}-${n.endLine}`;
	})
	.join('\n')}
`;

	const selectionResult = await generateWithRetry(selectionPrompt);
	const selectionText = selectionResult.response.text();
	const selected = tryParseJsonResponse<{ selectedNodeIds: string[] }>(selectionText)?.selectedNodeIds ?? [];

	const fallbackSelected =
		selected.length > 0
			? selected
			: candidateNodes
					.filter((n) => n.nodeId !== 'root')
					.slice(0, needsEdit ? 6 : 4)
					.map((n) => n.nodeId);

	const selectedNodes = fallbackSelected
		.map((id) => treeIndex.nodesById[id])
		.filter(Boolean)
		.slice(0, needsEdit ? 8 : 6);

	const effectiveSelectedNodes = selectedNodes.length > 0 ? selectedNodes : [treeIndex.root];

	const maxLinesPerNode = needsEdit ? 18 : 14;
	const sourcesForPrompt = effectiveSelectedNodes
		.map((n) => {
			const sourceLines = formatSourceLines(treeIndex, n, maxLinesPerNode);
			return `Source:
nodeId: ${n.nodeId}
title: ${n.title}
lines: ${n.startLine}-${n.endLine}
content:
${sourceLines}`;
		})
		.join('\n\n');

	const chatHistoryText = history.map((m) => `${m.role}: ${m.content}`).join('\n');

	const editContractContext = needsEdit ? `\n\nFull contract content (for edits only):\n${contractTextForEdits}` : '';

	const prompt = `You are a legal contract assistant for the document titled "${contract.title}".

You MUST ground your reply in the provided sources. Do not use unstated knowledge.
If the answer is not present in the sources, say so explicitly.

Sources are taken from the contract and are labeled with 1-based line numbers so they are auditable.

Chat history (for context only):
${chatHistoryText}

User:
${message}

${sourcesForPrompt ? `Sources:\n${sourcesForPrompt}\n\n` : ''}
${editContractContext}

Respond ONLY in valid JSON with this exact shape:
{
  "reply": "string",
  "editedContract": "string | null",
  "citations": Array<{
    "startLine": number,
    "endLine": number,
    "quote": string
  }>
}

Rules:
- "reply" is your conversational answer to the user.
- "citations" must be non-empty and must refer to the sources above.
- Each citation's "quote" must be an exact substring from the provided sources' line text.
- Set "editedContract" to a full updated contract in plain text with markdown-style headings (#, ##, ###) ONLY when the user explicitly asks to modify the contract content; otherwise set it to null.
- Do not include code fences or extra keys.`;

	const result = await generateWithRetry(prompt);
	const responseText = result.response.text();

	const parsed = tryParseJsonResponse<{ reply: string; editedContract: string | null; citations?: GroundedCitation[] }>(
		responseText
	);
	const reply = parsed?.reply || responseText;
	const citations = parsed?.citations || [];

	let contractUpdated = false;
	let updatedContent: Record<string, unknown>[] | undefined;
	if (parsed?.editedContract && typeof parsed.editedContract === 'string' && parsed.editedContract.trim()) {
		const newBlocks = textToBlocks(parsed.editedContract);
		contract.content = newBlocks as unknown as typeof contract.content;
		await contract.save();
		contractUpdated = true;
		updatedContent = newBlocks;
	}

	// Validate citations against the selected source ranges and ensure quote grounding.
	const allLines = treeIndex.lines;
	const validatedCitations = citations.filter((c) => {
		if (!c || typeof c.startLine !== 'number' || typeof c.endLine !== 'number' || !c.quote) return false;
		if (c.startLine < 1 || c.endLine < c.startLine) return false;
		if (c.endLine > allLines.length) return false;
		const rangeText = allLines.slice(c.startLine - 1, c.endLine).join('\n');
		const quoted = rangeText.includes(c.quote);
		if (!quoted) return false;

		// Ensure the cited line range falls within one of the selected source nodes.
		return effectiveSelectedNodes.some((n) => c.startLine >= n.startLine && c.endLine <= n.endLine);
	});

	const finalCitations =
		validatedCitations.length > 0
			? validatedCitations
			: effectiveSelectedNodes.length > 0
			? (() => {
					const first = effectiveSelectedNodes[0];
					const quote = allLines.slice(first.startLine - 1, first.startLine).join('\n');
					if (!quote) return [];
					return [{ startLine: first.startLine, endLine: first.startLine, quote }];
			  })()
			: [];

	const assistantMsg = await AiMessage.create({
		sessionId: session._id,
		role: 'assistant',
		content: reply
	});

	return {
		id: assistantMsg.id,
		role: 'assistant' as const,
		content: reply,
		timestamp: assistantMsg.createdAt?.toISOString(),
		contractUpdated,
		updatedContent,
		// Returned to frontend for traceable/verify-able answers.
		citations: finalCitations
	};
}

export async function* generateContractStream(userId: string, promptText: string): AsyncGenerator<StreamEvent> {
	try {
		const aiPrompt = `Generate a complete legal contract based on the following request. Format it with clear sections, headings, and standard legal language.

Request: ${promptText}

Structure the contract with:
1. Title
2. Parties
3. Recitals/Background
4. Definitions (if needed)
5. Main terms and conditions
6. Obligations of each party
7. Term and termination
8. Confidentiality (if applicable)
9. Limitation of liability
10. General provisions (governing law, notices, entire agreement, amendments)
11. Signature blocks

Return the contract as plain text with markdown-style headings (# for title, ## for sections, ### for subsections). Use bullet points where appropriate.`;

		const streamResult = await generateStreamWithRetry(aiPrompt);
		let fullText = '';

		for await (const chunk of streamResult.stream) {
			const text = chunk.text();
			if (text) {
				fullText += text;
				yield { type: 'chunk', text };
			}
		}

		const blocks = textToBlocks(fullText);
		const titleMatch = fullText.match(/^#\s+(.+)/m);
		const title = titleMatch ? titleMatch[1].trim() : 'AI Generated Contract';

		const contract = await Contract.create({
			title,
			content: blocks,
			status: 'draft',
			userId,
			lexiId: `lexi-${uuidv4().slice(0, 8)}`
		});

		await Activity.create({
			userId,
			contractId: contract._id,
			text: `Generated contract "${contract.title}" from AI prompt`,
			type: 'create'
		});

		yield { type: 'done', contractId: contract.id, title: contract.title, content: blocks };
	} catch (e) {
		const message = e instanceof Error ? e.message : 'Failed to generate contract';
		yield { type: 'error', message };
	}
}

export async function reviewContract(contractId: string, userId: string) {
	const contract = await Contract.findOne({ _id: contractId, userId });
	if (!contract) throw new NotFoundError('Contract not found');

	const contractText = blocksToText(contract.content as unknown as Record<string, unknown>[]);

	const prompt = `You are a legal contract reviewer. Analyze the following contract and identify issues.

Contract: "${contract.title}"
Content:
${contractText}

Return a JSON array of issues. Each issue must have:
- "id": a unique string
- "type": one of "risk", "missing", "inconsistency", "suggestion"
- "severity": one of "low", "medium", "high"
- "title": short issue title
- "description": detailed description
- "suggestion": remediation text

Only return the JSON array, no other text. If the contract is empty or has very little content, return issues about missing standard clauses.`;

	const result = await generateWithRetry(prompt);
	const responseText = result.response.text();

	let issues;
	try {
		const cleaned = responseText
			.replace(/```json\n?/g, '')
			.replace(/```\n?/g, '')
			.trim();
		issues = JSON.parse(cleaned);
	} catch {
		issues = [
			{
				id: uuidv4(),
				type: 'suggestion',
				severity: 'medium',
				title: 'Review Generated',
				description: responseText,
				suggestion: 'Review the AI feedback above.'
			}
		];
	}

	await Activity.create({
		userId,
		contractId: contract._id,
		text: `AI review completed for "${contract.title}" - ${issues.length} issue(s) found`,
		type: 'ai-review'
	});

	return issues;
}

export async function rewriteSelection(contractId: string, selection: string, tone: string) {
	const prompt = `Rewrite the following legal contract text in a ${tone} tone. Preserve the legal meaning but adjust the style.

Original text:
${selection}

Return only the rewritten text, no explanations.`;

	const result = await generateWithRetry(prompt);
	return { rewrittenText: result.response.text() };
}

export async function explainClause(contractId: string, clauseText: string) {
	const prompt = `Explain the following legal clause in plain, simple language that a non-lawyer can understand. Be concise.

Clause:
${clauseText}

Provide the explanation in clear, accessible language.`;

	const result = await generateWithRetry(prompt);
	return { explanation: result.response.text() };
}

export async function summarizeContract(contractId: string, content?: Record<string, unknown>[]) {
	let contractText = '';
	if (content && content.length > 0) {
		contractText = blocksToText(content);
	} else {
		const contract = await Contract.findById(contractId);
		if (!contract) throw new NotFoundError('Contract not found');
		contractText = blocksToText(contract.content as unknown as Record<string, unknown>[]);
	}

	const prompt = `Summarize the following legal contract concisely. Include key parties, obligations, terms, and any notable conditions.

Contract content:
${contractText}

Provide a clear, structured summary.`;

	const result = await generateWithRetry(prompt);
	return { summary: result.response.text() };
}

export async function generateClauseFromPrompt(contractId: string, prompt: string) {
	const aiPrompt = `Generate a professional legal clause based on the following request. The clause should be ready to insert into a legal contract.

Request: ${prompt}

Return only the clause text, properly formatted for a legal document.`;

	const result = await generateWithRetry(aiPrompt);
	return { clause: result.response.text() };
}

export async function suggestClauses(contractId: string, content?: Record<string, unknown>[]) {
	let contractText = '';
	if (content && content.length > 0) {
		contractText = blocksToText(content);
	} else {
		const contract = await Contract.findById(contractId);
		if (!contract) throw new NotFoundError('Contract not found');
		contractText = blocksToText(contract.content as unknown as Record<string, unknown>[]);
	}

	const prompt = `Analyze the following contract and suggest missing clauses that should be added for completeness and legal protection.

Contract content:
${contractText}

Return a JSON array of suggested clauses. Each item must have:
- "id": a unique string
- "title": clause title
- "description": brief description of what the clause covers
- "reason": why this clause should be added
- "content": the full clause text ready for insertion

Only return the JSON array, no other text.`;

	const result = await generateWithRetry(prompt);
	const responseText = result.response.text();

	let suggestions;
	try {
		const cleaned = responseText
			.replace(/```json\n?/g, '')
			.replace(/```\n?/g, '')
			.trim();
		suggestions = JSON.parse(cleaned);
	} catch {
		suggestions = [];
	}

	return { suggestions };
}

export async function generateContract(userId: string, promptText: string) {
	const aiPrompt = `Generate a complete legal contract based on the following request. Format it with clear sections, headings, and standard legal language.

Request: ${promptText}

Structure the contract with:
1. Title
2. Parties
3. Recitals/Background
4. Definitions (if needed)
5. Main terms and conditions
6. Obligations of each party
7. Term and termination
8. Confidentiality (if applicable)
9. Limitation of liability
10. General provisions (governing law, notices, entire agreement, amendments)
11. Signature blocks

Return the contract as plain text with markdown-style headings (# for title, ## for sections, ### for subsections). Use bullet points where appropriate.`;

	const result = await generateWithRetry(aiPrompt);
	const responseText = result.response.text();
	const blocks = textToBlocks(responseText);

	const titleMatch = responseText.match(/^#\s+(.+)/m);
	const title = titleMatch ? titleMatch[1].trim() : 'AI Generated Contract';

	const contract = await Contract.create({
		title,
		content: blocks,
		status: 'draft',
		userId,
		lexiId: `lexi-${uuidv4().slice(0, 8)}`
	});

	await Activity.create({
		userId,
		contractId: contract._id,
		text: `Generated contract "${contract.title}" from AI prompt`,
		type: 'create'
	});

	return contract;
}

export default {
	sendChatMessage,
	sendChatMessageWithEdits,
	reviewContract,
	rewriteSelection,
	explainClause,
	summarizeContract,
	generateClauseFromPrompt,
	suggestClauses,
	generateContract,
	generateContractStream,
	geminiPing
};

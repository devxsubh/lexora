import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '~/config/config';
import { withGeminiRetry } from '~/utils/geminiRetry';
import Contract from '~/models/contractModel';
import AiChatSession from '~/models/aiChatSessionModel';
import AiMessage, { IAiMessageDocument } from '~/models/aiMessageModel';
import Activity from '~/models/activityModel';
import { NotFoundError, ValidationError } from '~/utils/domainErrors';
import { v4 as uuidv4 } from 'uuid';

function getModel() {
	if (!config.GEMINI_API_KEY) {
		throw new ValidationError('AI features require GEMINI_API_KEY to be configured');
	}
	const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
	return genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
}

async function generateWithRetry(prompt: string) {
	const model = getModel();
	return withGeminiRetry(() => model.generateContent(prompt));
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
			const text = contentArr
				?.filter((c) => c.type === 'text' && c.text)
				.map((c) => c.text)
				.join('') ?? '';

			const children = block.children as Record<string, unknown>[] | undefined;
			const childText = children ? blocksToText(children) : '';

			const prefix = block.type === 'heading' ? '\n## ' :
				block.type === 'bulletListItem' ? '• ' :
				block.type === 'numberedListItem' ? '- ' : '';

			return `${prefix}${text}${childText ? '\n' + childText : ''}`;
		})
		.filter(Boolean)
		.join('\n');
}

function textToBlocks(text: string): Record<string, unknown>[] {
	return text.split('\n').filter(Boolean).map((line) => {
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

	const history = await AiMessage.find({ sessionId: session._id })
		.sort({ createdAt: 1 })
		.limit(20);

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
		const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
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
		const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
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
	reviewContract,
	rewriteSelection,
	explainClause,
	summarizeContract,
	generateClauseFromPrompt,
	suggestClauses,
	generateContract,
	geminiPing
};

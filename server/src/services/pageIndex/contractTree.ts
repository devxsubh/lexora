import type { IBlock } from '~/models/contractModel';

export type ContractTreeNode = {
	nodeId: string;
	parentId?: string;
	title: string;
	level: number;
	startLine: number; // 1-based inclusive
	endLine: number; // 1-based inclusive
	summary: string;
	children: ContractTreeNode[];
};

export type ContractTreeIndex = {
	root: ContractTreeNode;
	nodesById: Record<string, ContractTreeNode>;
	nodesInOrder: ContractTreeNode[];
	lines: string[]; // 1-based line numbers are derived from index+1
};

function getBlockText(block: IBlock): string {
	const parts = Array.isArray(block.content) ? block.content : [];
	return parts
		.map((p) => (p && p.type === 'text' && typeof p.text === 'string' ? p.text : ''))
		.join('')
		.trim();
}

function blockToLines(block: IBlock): string[] {
	const rawText = getBlockText(block);
	if (!rawText) return [];

	const type = block.type;
	const level = typeof block.props?.level === 'number' ? block.props.level : 1;

	if (type === 'heading') {
		// Keep heading text but normalize into markdown-like structure for stable line citations.
		const hashes = '#'.repeat(Math.max(1, Math.min(6, level)));
		return rawText ? [`${hashes} ${rawText}`] : [];
	}

	if (type === 'bulletListItem') return [`• ${rawText}`];
	if (type === 'numberedListItem') return [`- ${rawText}`];

	// Default to paragraph-like text.
	return rawText
		.split('\n')
		.map((l) => l.trimEnd())
		.filter(Boolean);
}

function summarizeLines(lines: string[], startLine: number, endLine: number): string {
	if (startLine > endLine) return '';
	const slice = lines.slice(startLine - 1, Math.min(endLine, startLine - 1 + 6));
	const joined = slice.join('\n').replace(/\s+/g, ' ').trim();
	return joined.length > 300 ? `${joined.slice(0, 300)}…` : joined;
}

/**
 * Builds a TOC-style hierarchical tree from heading blocks and records exact line ranges
 * for verifiable, line-level citations.
 */
export function buildContractTreeIndex(blocks: IBlock[]): ContractTreeIndex {
	const safeBlocks = Array.isArray(blocks) ? blocks : [];

	const lines: string[] = [];
	const nodesById: Record<string, ContractTreeNode> = {};
	const nodesInOrder: ContractTreeNode[] = [];

	const root: ContractTreeNode = {
		nodeId: 'root',
		title: 'Document',
		level: 0,
		startLine: 1,
		endLine: 0,
		summary: 'Entire document',
		children: []
	};
	nodesById[root.nodeId] = root;

	const stack: ContractTreeNode[] = [root];
	let nodeCounter = 0;

	for (const block of safeBlocks) {
		const blockLines = blockToLines(block);
		if (blockLines.length === 0) continue;

		if (block.type === 'heading') {
			const level = typeof block.props?.level === 'number' ? block.props.level : 1;
			const title = getBlockText(block) || 'Section';

			while (stack.length > 1 && stack[stack.length - 1].level >= level) {
				stack.pop();
			}

			const parent = stack[stack.length - 1];
			const nodeId = `n-${nodeCounter++}`;
			const startLine = lines.length + 1;

			const node: ContractTreeNode = {
				nodeId,
				parentId: parent.nodeId,
				title,
				level,
				startLine,
				endLine: startLine,
				summary: '',
				children: []
			};

			parent.children.push(node);
			stack.push(node);
			nodesById[nodeId] = node;
			nodesInOrder.push(node);

			for (const l of blockLines) {
				lines.push(l);
				node.endLine = lines.length;
				node.summary = summarizeLines(lines, node.startLine, node.endLine);
			}
			continue;
		}

		// Non-heading blocks attach to the current (top-most) node.
		const current = stack[stack.length - 1];
		for (const l of blockLines) {
			lines.push(l);
			current.endLine = lines.length;
			current.summary = summarizeLines(lines, current.startLine, current.endLine);
		}
	}

	// If we never appended any content lines, keep root.endLine at 0.
	if (lines.length > 0) {
		root.endLine = lines.length;
		root.summary = summarizeLines(lines, root.startLine, root.endLine);
	}

	// Ensure every node has a summary even if it contained only a heading line.
	for (const node of nodesInOrder) {
		node.summary = summarizeLines(lines, node.startLine, node.endLine);
	}

	return { root, nodesById, nodesInOrder, lines };
}

export function collectNodesForPrompt(index: ContractTreeIndex, maxNodes: number, maxDepth: number): ContractTreeNode[] {
	const out: ContractTreeNode[] = [];
	const visited = new Set<string>();

	// BFS from root so that the model sees higher-level structure before deep nodes.
	const queue: Array<{ node: ContractTreeNode; depth: number }> = [{ node: index.root, depth: 0 }];
	while (queue.length > 0 && out.length < maxNodes) {
		const { node, depth } = queue.shift()!;
		if (visited.has(node.nodeId)) continue;
		visited.add(node.nodeId);

		out.push(node);

		if (depth >= maxDepth) continue;
		for (const child of node.children) {
			queue.push({ node: child, depth: depth + 1 });
		}
	}

	return out;
}

export function formatSourceLines(index: ContractTreeIndex, node: ContractTreeNode, maxLinesPerNode: number): string {
	const start = node.startLine;
	const end = node.endLine;
	if (end < start) return '';

	const clampedEnd = Math.min(end, start - 1 + maxLinesPerNode);
	const relevant = index.lines.slice(start - 1, clampedEnd);
	return relevant.map((text, i) => `[${start + i}] ${text}`).join('\n');
}

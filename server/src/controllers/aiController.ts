import { Request, Response } from 'express';
import aiService from '~/services/aiService';

export const geminiPing = async (_req: Request, res: Response): Promise<Response> => {
	const data = await aiService.geminiPing();
	return res.json({ success: true, data });
};

export const sendChatMessage = async (req: Request, res: Response): Promise<Response> => {
	const userId = req.user!.id;
	const result = await aiService.sendChatMessage(req.params.contractId, userId, req.body.message);
	return res.json({ success: true, data: result });
};

export const reviewContract = async (req: Request, res: Response): Promise<Response> => {
	const userId = req.user!.id;
	const issues = await aiService.reviewContract(req.params.contractId, userId);
	return res.json({ success: true, data: issues });
};

export const rewriteSelection = async (req: Request, res: Response): Promise<Response> => {
	const result = await aiService.rewriteSelection(req.body.contractId, req.body.selection, req.body.tone);
	return res.json({ success: true, data: result });
};

export const explainClause = async (req: Request, res: Response): Promise<Response> => {
	const result = await aiService.explainClause(req.body.contractId, req.body.clauseText);
	return res.json({ success: true, data: result });
};

export const summarizeContract = async (req: Request, res: Response): Promise<Response> => {
	const result = await aiService.summarizeContract(req.body.contractId, req.body.content);
	return res.json({ success: true, data: result });
};

export const generateClause = async (req: Request, res: Response): Promise<Response> => {
	const result = await aiService.generateClauseFromPrompt(req.body.contractId, req.body.prompt);
	return res.json({ success: true, data: result });
};

export const suggestClauses = async (req: Request, res: Response): Promise<Response> => {
	const result = await aiService.suggestClauses(req.body.contractId, req.body.content);
	return res.json({ success: true, data: result });
};

export default {
	geminiPing,
	sendChatMessage,
	reviewContract,
	rewriteSelection,
	explainClause,
	summarizeContract,
	generateClause,
	suggestClauses
};

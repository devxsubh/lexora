import { Request, Response } from 'express';
import _ from 'lodash';
import clauseService from '~/services/clauseService';

export const listClauses = async (req: Request, res: Response): Promise<Response> => {
	const options = _.pick(req.query, ['page', 'limit', 'sortBy', 'sortDirection']);
	const category = req.query.category as string | undefined;
	const q = req.query.q as string | undefined;
	const result = await clauseService.listClauses(options as import('~/services/clauseService').ListClausesOptions, category, q);
	return res.json({ success: true, data: result.clauses });
};

export const getClause = async (req: Request, res: Response): Promise<Response> => {
	const clause = await clauseService.getClause(req.params.id);
	return res.json({ success: true, data: clause });
};

export const createClause = async (req: Request, res: Response): Promise<Response> => {
	const clause = await clauseService.createClause(req.body);
	return res.status(201).json({ success: true, data: clause });
};

export const updateClause = async (req: Request, res: Response): Promise<Response> => {
	const clause = await clauseService.updateClause(req.params.id, req.body);
	return res.json({ success: true, data: clause });
};

export const deleteClause = async (req: Request, res: Response): Promise<Response> => {
	await clauseService.deleteClause(req.params.id);
	return res.json({ success: true, data: null });
};

export default { listClauses, getClause, createClause, updateClause, deleteClause };

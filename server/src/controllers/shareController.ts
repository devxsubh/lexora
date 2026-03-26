import { Request, Response } from 'express';
import shareService from '~/services/shareService';

export const listShares = async (req: Request, res: Response): Promise<Response> => {
	const userId = req.user!.id;
	const result = await shareService.listShares(req.params.id, userId);
	return res.json({ success: true, data: result });
};

export const addShare = async (req: Request, res: Response): Promise<Response> => {
	const userId = req.user!.id;
	const share = await shareService.addShare(req.params.id, userId, req.body.email, req.body.role);
	return res.status(201).json({ success: true, data: share });
};

export const updateShareRole = async (req: Request, res: Response): Promise<Response> => {
	const userId = req.user!.id;
	const share = await shareService.updateShareRole(req.params.id, userId, req.params.shareId, req.body.role);
	return res.json({ success: true, data: share });
};

export const deleteShare = async (req: Request, res: Response): Promise<Response> => {
	const userId = req.user!.id;
	await shareService.deleteShare(req.params.id, userId, req.params.shareId);
	return res.json({ success: true, data: null });
};

export const updateGeneralAccess = async (req: Request, res: Response): Promise<Response> => {
	const userId = req.user!.id;
	const result = await shareService.updateContractGeneralAccess(req.params.id, userId, req.body.generalAccess);
	return res.json({ success: true, data: result });
};

export default { listShares, addShare, updateShareRole, deleteShare, updateGeneralAccess };

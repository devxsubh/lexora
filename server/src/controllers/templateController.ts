import { Request, Response } from 'express';
import templateService from '~/services/templateService';

export const listTemplates = async (req: Request, res: Response): Promise<Response> => {
	const category = req.query.category as string | undefined;
	const templates = await templateService.listTemplates(category);
	return res.json({ success: true, data: templates });
};

export const createFromTemplate = async (req: Request, res: Response): Promise<Response> => {
	const userId = req.user!.id;
	const contract = await templateService.createContractFromTemplate(userId, req.body.templateId, req.body.title);
	return res.status(201).json({ success: true, data: contract });
};

export default { listTemplates, createFromTemplate };

import { Request, Response } from 'express';
import dashboardService from '~/services/dashboardService';

export const getMetrics = async (req: Request, res: Response): Promise<Response> => {
	const userId = req.user!.id;
	const metrics = await dashboardService.getMetrics(userId);
	return res.json({ success: true, data: metrics });
};

export const getDashboardContracts = async (req: Request, res: Response): Promise<Response> => {
	const userId = req.user!.id;
	const options = {
		page: req.query.page ? Number(req.query.page) : undefined,
		limit: req.query.limit ? Number(req.query.limit) : undefined,
		sortBy: req.query.sortBy as string | undefined,
		sortOrder: req.query.sortOrder as string | undefined
	};
	const result = await dashboardService.getDashboardContracts(userId, options);
	return res.json({ success: true, data: result });
};

export const getRecentActivity = async (req: Request, res: Response): Promise<Response> => {
	const userId = req.user!.id;
	const limit = req.query.limit ? Number(req.query.limit) : 10;
	const activities = await dashboardService.getRecentActivity(userId, limit);
	return res.json({ success: true, data: activities });
};

export const getAiInsights = async (req: Request, res: Response): Promise<Response> => {
	const userId = req.user!.id;
	const insights = await dashboardService.getAiInsights(userId);
	return res.json({ success: true, data: insights });
};

export const getMetricItems = async (req: Request, res: Response): Promise<Response> => {
	const userId = req.user!.id;
	const items = await dashboardService.getMetricItems(userId, req.params.metricId);
	return res.json({ success: true, data: items });
};

export default { getMetrics, getDashboardContracts, getRecentActivity, getAiInsights, getMetricItems };

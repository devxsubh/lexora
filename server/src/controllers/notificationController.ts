import { Request, Response } from 'express';
import notificationService, { GetNotificationsOptions } from '~/services/notificationService';

export const getNotifications = async (req: Request, res: Response): Promise<Response> => {
	const userId = req.user!.id;
	const options: GetNotificationsOptions = {
		limit: req.query.limit as number | undefined,
		page: req.query.page as number | undefined,
		unreadOnly: req.query.unreadOnly === 'true'
	};
	const result = await notificationService.getNotifications(userId, options);
	return res.json({
		success: true,
		data: result.results,
		pagination: {
			total: result.totalResults
		},
		unreadCount: result.unreadCount
	});
};

export const markAsRead = async (req: Request, res: Response): Promise<Response> => {
	const notification = await notificationService.markAsRead(req.params.notificationId, req.user!.id);
	return res.json({
		success: true,
		data: notification
	});
};

export const markAllAsRead = async (req: Request, res: Response): Promise<Response> => {
	const { count } = await notificationService.markAllAsRead(req.user!.id);
	return res.json({
		success: true,
		data: { markedCount: count }
	});
};

export default { getNotifications, markAsRead, markAllAsRead };

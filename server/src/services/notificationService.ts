import type { Types } from 'mongoose';
import Notification, { INotification, NotificationType } from '~/models/notificationModel';

export interface GetNotificationsOptions {
	limit?: number;
	page?: number;
	unreadOnly?: boolean;
}

export interface GetNotificationsResult {
	results: (INotification & { id?: string })[];
	totalResults: number;
	unreadCount: number;
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export async function createNotification(
	userId: Types.ObjectId | string,
	data: {
		type?: NotificationType;
		title: string;
		message: string;
		metadata?: Record<string, unknown>;
	}
): Promise<INotification & { id?: string }> {
	const doc = await Notification.createNotification({
		user: userId as Types.ObjectId,
		type: data.type ?? 'info',
		title: data.title,
		message: data.message,
		metadata: data.metadata
	});
	return (doc.toJSON ? doc.toJSON() : doc) as INotification & { id?: string };
}

export async function getNotifications(userId: string, options: GetNotificationsOptions = {}): Promise<GetNotificationsResult> {
	const limit = Math.min(options.limit && options.limit > 0 ? options.limit : DEFAULT_LIMIT, MAX_LIMIT);
	const page = options.page && options.page > 0 ? options.page : 1;
	const skip = (page - 1) * limit;

	const query: Record<string, unknown> = { user: userId };
	if (options.unreadOnly) {
		query.read = false;
	}

	const [totalResults, results, unreadCount] = await Promise.all([
		Notification.countDocuments(query),
		Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
		Notification.countDocuments({ user: userId, read: false })
	]);

	return {
		results: results as (INotification & { id?: string })[],
		totalResults,
		unreadCount
	};
}

export async function markAsRead(notificationId: string, userId: string): Promise<INotification & { id?: string }> {
	const doc = await Notification.markAsRead(notificationId, userId);
	return (doc.toJSON ? doc.toJSON() : doc) as INotification & { id?: string };
}

export async function markAllAsRead(userId: string): Promise<{ count: number }> {
	const count = await Notification.markAllAsRead(userId);
	return { count };
}

export default {
	createNotification,
	getNotifications,
	markAsRead,
	markAllAsRead
};

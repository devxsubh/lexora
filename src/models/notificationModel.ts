import mongoose, { Types } from 'mongoose';
import { NotFoundError } from '~/utils/domainErrors';
import toJSON from './plugins/toJSONPlugin';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface INotification {
	user: Types.ObjectId;
	type: NotificationType;
	title: string;
	message: string;
	read: boolean;
	metadata?: Record<string, unknown>;
	createdAt?: Date;
	updatedAt?: Date;
}

interface INotificationModel extends mongoose.Model<INotification> {
	createNotification(body: {
		user: Types.ObjectId;
		type: NotificationType;
		title: string;
		message: string;
		metadata?: Record<string, unknown>;
	}): Promise<mongoose.HydratedDocument<INotification>>;
	markAsRead(
		notificationId: Types.ObjectId | string,
		userId: Types.ObjectId | string
	): Promise<mongoose.HydratedDocument<INotification>>;
	markAllAsRead(userId: Types.ObjectId | string): Promise<number>;
}

const notificationSchema = new mongoose.Schema<INotification>(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'users',
			required: true,
			index: true
		},
		type: {
			type: String,
			enum: ['info', 'success', 'warning', 'error'],
			default: 'info'
		},
		title: {
			type: String,
			required: true,
			maxlength: 200
		},
		message: {
			type: String,
			required: true,
			maxlength: 1000
		},
		read: {
			type: Boolean,
			default: false
		},
		metadata: {
			type: mongoose.Schema.Types.Mixed
		}
	},
	{
		timestamps: true
	}
);

notificationSchema.index({ user: 1, createdAt: -1 });

notificationSchema.plugin(toJSON);

class NotificationClass {
	static async createNotification(
		this: INotificationModel,
		body: {
			user: Types.ObjectId;
			type: NotificationType;
			title: string;
			message: string;
			metadata?: Record<string, unknown>;
		}
	): Promise<mongoose.HydratedDocument<INotification>> {
		return this.create(body);
	}

	static async markAsRead(
		this: INotificationModel,
		notificationId: Types.ObjectId | string,
		userId: Types.ObjectId | string
	): Promise<mongoose.HydratedDocument<INotification>> {
		const doc = await this.findOne({ _id: notificationId, user: userId });
		if (!doc) {
			throw new NotFoundError('Notification not found');
		}
		doc.read = true;
		await doc.save();
		return doc;
	}

	static async markAllAsRead(this: INotificationModel, userId: Types.ObjectId | string): Promise<number> {
		const result = await this.updateMany({ user: userId, read: false }, { read: true });
		return result.modifiedCount;
	}
}

notificationSchema.loadClass(NotificationClass);

const Notification = mongoose.model<INotification, INotificationModel>('notifications', notificationSchema);

export default Notification;

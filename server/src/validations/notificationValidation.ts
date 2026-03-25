import Joi from 'joi';
import { mongoId } from './customValidation';

export const getNotifications = {
	query: Joi.object().keys({
		limit: Joi.number().integer().min(1).max(100),
		page: Joi.number().integer().min(1),
		unreadOnly: Joi.boolean()
	})
};

export const markAsRead = {
	params: Joi.object().keys({
		notificationId: Joi.string().custom(mongoId).required()
	})
};

export default { getNotifications, markAsRead };

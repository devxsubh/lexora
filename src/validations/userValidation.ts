import Joi from 'joi';
import { mongoId } from './customValidation';

export const createUser = {
	body: Joi.object().keys({
		name: Joi.string().trim().min(2).max(200).required(),
		email: Joi.string().email().max(255).required(),
		password: Joi.string().trim().min(6).max(128).required(),
		roles: Joi.array().items(Joi.string().custom(mongoId)).min(1).max(6).unique().required(),
		avatar: Joi.string().max(500)
	})
};

const ALLOWED_USER_SORT_FIELDS = ['createdAt', 'updatedAt', 'name', 'email'];

export const getUsers = {
	query: Joi.object().keys({
		q: Joi.string().max(100).allow(''),
		sortBy: Joi.string().valid(...ALLOWED_USER_SORT_FIELDS),
		sortDirection: Joi.string().valid('asc', 'desc'),
		limit: Joi.number().integer().min(1).max(100),
		page: Joi.number().integer().min(1)
	})
};

export const getUser = {
	params: Joi.object().keys({
		userId: Joi.string().custom(mongoId)
	})
};

export const updateUser = {
	params: Joi.object().keys({
		userId: Joi.string().custom(mongoId).required()
	}),
	body: Joi.object().keys({
		name: Joi.string().trim().min(2).max(200),
		email: Joi.string().email().max(255),
		password: Joi.string().trim().min(6).max(128),
		roles: Joi.array().items(Joi.string().custom(mongoId)).min(1).max(6).unique(),
		avatar: Joi.string().max(500)
	})
};

export const deleteUser = {
	params: Joi.object().keys({
		userId: Joi.string().custom(mongoId)
	})
};

export default { createUser, getUsers, getUser, updateUser, deleteUser };

import Joi from 'joi';
import { mongoId } from './customValidation';

export const createRole = {
	body: Joi.object().keys({
		name: Joi.string().trim().min(2).max(100).required(),
		description: Joi.string().trim().min(0).max(500).allow(''),
		permissions: Joi.array().items(Joi.string().custom(mongoId)).unique()
	})
};

export const updateRole = {
	params: Joi.object().keys({
		roleId: Joi.string().custom(mongoId).required()
	}),
	body: Joi.object().keys({
		name: Joi.string().trim().min(2).max(100),
		description: Joi.string().trim().min(0).max(500).allow(''),
		permissions: Joi.array().items(Joi.string().custom(mongoId)).unique()
	})
};

export const deleteRole = {
	params: Joi.object().keys({
		roleId: Joi.string().custom(mongoId)
	})
};

const ALLOWED_ROLE_SORT_FIELDS = ['createdAt', 'updatedAt', 'name', 'description'];

export const getRoles = {
	query: Joi.object().keys({
		q: Joi.string().max(100).allow(''),
		sortBy: Joi.string().valid(...ALLOWED_ROLE_SORT_FIELDS),
		sortDirection: Joi.string().valid('asc', 'desc'),
		limit: Joi.number().integer().min(1).max(100),
		page: Joi.number().integer().min(1)
	})
};

export const getRole = {
	params: Joi.object().keys({
		roleId: Joi.string().custom(mongoId)
	})
};

export default { createRole, getRole, updateRole, getRoles, deleteRole };

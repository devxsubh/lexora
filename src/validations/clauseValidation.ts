import Joi from 'joi';
import { mongoId } from './customValidation';

const ALLOWED_SORT_FIELDS = ['title', 'category', 'usageCount', 'createdAt', 'updatedAt'];

export const listClauses = {
	query: Joi.object().keys({
		page: Joi.number().integer().min(1),
		limit: Joi.number().integer().min(1).max(100),
		sortBy: Joi.string().valid(...ALLOWED_SORT_FIELDS),
		sortDirection: Joi.string().valid('asc', 'desc'),
		category: Joi.string().max(100),
		q: Joi.string().max(200).allow('')
	})
};

export const getClause = {
	params: Joi.object().keys({
		id: Joi.string().custom(mongoId).required()
	})
};

export const createClause = {
	body: Joi.object().keys({
		title: Joi.string().max(300).required(),
		content: Joi.string().required(),
		category: Joi.string().max(100).required(),
		tags: Joi.array().items(Joi.string().max(50)).max(20).default([])
	})
};

export const updateClause = {
	params: Joi.object().keys({
		id: Joi.string().custom(mongoId).required()
	}),
	body: Joi.object().keys({
		title: Joi.string().max(300),
		content: Joi.string(),
		category: Joi.string().max(100),
		tags: Joi.array().items(Joi.string().max(50)).max(20)
	})
};

export const deleteClause = {
	params: Joi.object().keys({
		id: Joi.string().custom(mongoId).required()
	})
};

export default { listClauses, getClause, createClause, updateClause, deleteClause };

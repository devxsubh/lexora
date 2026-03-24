import Joi from 'joi';
import { mongoId } from './customValidation';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const blockSchema = Joi.object()
	.keys({
		id: Joi.string().allow(''),
		type: Joi.string().required(),
		props: Joi.object().unknown(true),
		content: Joi.array().items(Joi.object().unknown(true)),
		children: Joi.array().items(Joi.link('#block'))
	})
	.id('block');

const ALLOWED_SORT_FIELDS = ['createdAt', 'updatedAt', 'title', 'status', 'contractType', 'aiRiskScore'];

export const listContracts = {
	query: Joi.object().keys({
		page: Joi.number().integer().min(1),
		limit: Joi.number().integer().min(1).max(100),
		sortBy: Joi.string().valid(...ALLOWED_SORT_FIELDS),
		sortOrder: Joi.string().valid('asc', 'desc')
	})
};

export const getContract = {
	params: Joi.object().keys({
		id: Joi.string().custom(mongoId).required()
	})
};

export const createContract = {
	body: Joi.object().keys({
		title: Joi.string().max(500).default('Untitled Agreement'),
		content: Joi.array().items(Joi.object().unknown(true)).default([]),
		status: Joi.string().valid('draft', 'reviewing', 'finalized').default('draft'),
		metadata: Joi.object().unknown(true),
		party: Joi.string().max(200),
		contractType: Joi.string().max(100),
		effectiveDate: Joi.date().iso(),
		summary: Joi.string().max(2000)
	})
};

export const updateContract = {
	params: Joi.object().keys({
		id: Joi.string().custom(mongoId).required()
	}),
	body: Joi.object().keys({
		title: Joi.string().max(500),
		content: Joi.array().items(Joi.object().unknown(true)),
		status: Joi.string().valid('draft', 'reviewing', 'finalized'),
		metadata: Joi.object().unknown(true),
		party: Joi.string().max(200),
		contractType: Joi.string().max(100),
		effectiveDate: Joi.date().iso(),
		summary: Joi.string().max(2000)
	})
};

export const autosaveContract = {
	params: Joi.object().keys({
		id: Joi.string().custom(mongoId).required()
	}),
	body: Joi.object().keys({
		content: Joi.array().items(Joi.object().unknown(true)).required(),
		lastModified: Joi.date().iso()
	})
};

export const deleteContract = {
	params: Joi.object().keys({
		id: Joi.string().custom(mongoId).required()
	})
};

export const generateContract = {
	body: Joi.object().keys({
		prompt: Joi.string().min(5).max(2000).required()
	})
};

export const downloadContract = {
	params: Joi.object().keys({
		id: Joi.string().custom(mongoId).required()
	}),
	query: Joi.object().keys({
		format: Joi.string().valid('pdf', 'docx', 'md', 'html').default('pdf')
	})
};

export const favoriteContract = {
	params: Joi.object().keys({
		id: Joi.string().custom(mongoId).required()
	})
};

export default {
	listContracts,
	getContract,
	createContract,
	updateContract,
	autosaveContract,
	deleteContract,
	generateContract,
	downloadContract,
	favoriteContract
};

import Joi from 'joi';
import { mongoId } from './customValidation';

export const sendChatMessage = {
	params: Joi.object().keys({
		contractId: Joi.string().custom(mongoId).required()
	}),
	body: Joi.object().keys({
		message: Joi.string().min(1).max(5000).required()
	})
};

export const reviewContract = {
	params: Joi.object().keys({
		contractId: Joi.string().custom(mongoId).required()
	})
};

export const rewriteSelection = {
	body: Joi.object().keys({
		contractId: Joi.string().custom(mongoId).required(),
		selection: Joi.string().min(1).max(10000).required(),
		tone: Joi.string().valid('formal', 'friendly', 'concise').required()
	})
};

export const explainClause = {
	body: Joi.object().keys({
		contractId: Joi.string().custom(mongoId).required(),
		clauseText: Joi.string().min(1).max(10000).required()
	})
};

export const summarizeContract = {
	body: Joi.object().keys({
		contractId: Joi.string().custom(mongoId).required(),
		content: Joi.array().items(Joi.object().unknown(true))
	})
};

export const generateClause = {
	body: Joi.object().keys({
		contractId: Joi.string().custom(mongoId).required(),
		prompt: Joi.string().min(1).max(2000).required()
	})
};

export const suggestClauses = {
	body: Joi.object().keys({
		contractId: Joi.string().custom(mongoId).required(),
		content: Joi.array().items(Joi.object().unknown(true))
	})
};

export default {
	sendChatMessage,
	reviewContract,
	rewriteSelection,
	explainClause,
	summarizeContract,
	generateClause,
	suggestClauses
};

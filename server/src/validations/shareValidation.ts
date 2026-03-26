import Joi from 'joi';
import { mongoId } from './customValidation';

const SHARE_ROLES = ['viewer', 'editor'] as const;
const GENERAL_ACCESS = ['restricted', 'anyone-with-link'] as const;

export const listShares = {
	params: Joi.object().keys({
		id: Joi.string().custom(mongoId).required()
	})
};

export const addShare = {
	params: Joi.object().keys({
		id: Joi.string().custom(mongoId).required()
	}),
	body: Joi.object().keys({
		email: Joi.string().email().max(320).required(),
		role: Joi.string()
			.valid(...SHARE_ROLES)
			.default('viewer')
	})
};

export const updateShare = {
	params: Joi.object().keys({
		id: Joi.string().custom(mongoId).required(),
		shareId: Joi.string().custom(mongoId).required()
	}),
	body: Joi.object().keys({
		role: Joi.string()
			.valid(...SHARE_ROLES)
			.required()
	})
};

export const deleteShare = {
	params: Joi.object().keys({
		id: Joi.string().custom(mongoId).required(),
		shareId: Joi.string().custom(mongoId).required()
	})
};

export const updateGeneralAccess = {
	params: Joi.object().keys({
		id: Joi.string().custom(mongoId).required()
	}),
	body: Joi.object().keys({
		generalAccess: Joi.string()
			.valid(...GENERAL_ACCESS)
			.required()
	})
};

export default { listShares, addShare, updateShare, deleteShare, updateGeneralAccess };

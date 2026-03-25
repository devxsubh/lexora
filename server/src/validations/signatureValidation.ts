import Joi from 'joi';
import { mongoId } from './customValidation';

export const requestSignatures = {
	params: Joi.object().keys({
		contractId: Joi.string().custom(mongoId).required()
	}),
	body: Joi.object().keys({
		signers: Joi.array()
			.items(
				Joi.object().keys({
					email: Joi.string().email().required(),
					name: Joi.string().max(200).required(),
					roleId: Joi.string().max(100),
					roleName: Joi.string().max(100)
				})
			)
			.min(1)
			.max(20)
			.required(),
		message: Joi.string().max(2000)
	})
};

export const listSignatures = {
	params: Joi.object().keys({
		contractId: Joi.string().custom(mongoId).required()
	})
};

export const signDocument = {
	params: Joi.object().keys({
		contractId: Joi.string().custom(mongoId).required()
	}),
	body: Joi.object().keys({
		signature: Joi.string().required(),
		signerName: Joi.string().max(200).required(),
		requestId: Joi.string().custom(mongoId)
	})
};

export default { requestSignatures, listSignatures, signDocument };

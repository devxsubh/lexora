import Joi from 'joi';

export const listTemplates = {
	query: Joi.object().keys({
		category: Joi.string().max(100)
	})
};

export const createFromTemplate = {
	body: Joi.object().keys({
		templateId: Joi.string().required(),
		title: Joi.string().max(500)
	})
};

export default { listTemplates, createFromTemplate };

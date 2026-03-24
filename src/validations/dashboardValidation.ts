import Joi from 'joi';

export const getActivity = {
	query: Joi.object().keys({
		limit: Joi.number().integer().min(1).max(50).default(10)
	})
};

export const getMetricItems = {
	params: Joi.object().keys({
		metricId: Joi.string().valid('total-contracts', 'pending-signatures', 'expiring-soon', 'ai-risk-flags').required()
	})
};

export const getDashboardContracts = {
	query: Joi.object().keys({
		page: Joi.number().integer().min(1),
		limit: Joi.number().integer().min(1).max(100),
		sortBy: Joi.string(),
		sortOrder: Joi.string().valid('asc', 'desc')
	})
};

export default { getActivity, getMetricItems, getDashboardContracts };

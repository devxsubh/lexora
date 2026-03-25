import Joi from 'joi';

export const signup = {
	body: Joi.object().keys({
		name: Joi.string().trim().min(2).max(200).required(),
		email: Joi.string().email().max(255).required(),
		password: Joi.string().trim().min(6).max(128).required()
	})
};

export const signin = {
	body: Joi.object().keys({
		email: Joi.string().email().max(255).required(),
		password: Joi.string().min(1).max(128).required()
	})
};

export const signout = {
	body: Joi.object().keys({
		refreshToken: Joi.string().required()
	})
};

export const refreshTokens = {
	body: Joi.object().keys({
		refreshToken: Joi.string().required()
	})
};

export const forgotPassword = {
	body: Joi.object().keys({
		email: Joi.string().email().max(255).required()
	})
};

export const resetPassword = {
	query: Joi.object().keys({
		token: Joi.string().required()
	}),
	body: Joi.object().keys({
		password: Joi.string().trim().min(6).max(128).required()
	})
};

export const verifyEmail = {
	query: Joi.object().keys({
		token: Joi.string().required()
	})
};

export const updateMe = {
	body: Joi.object().keys({
		name: Joi.string().trim().min(2).max(200),
		email: Joi.string().email().max(255),
		password: Joi.string().trim().min(6).max(128),
		avatar: Joi.string().max(500)
	})
};

export default {
	signup,
	signin,
	updateMe,
	signout,
	refreshTokens,
	verifyEmail,
	forgotPassword,
	resetPassword
};

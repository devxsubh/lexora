import { Request, Response } from 'express';
import APIError from '~/utils/apiError';
import authService from '~/services/authService';
import config from '~/config/config';
import httpStatus from 'http-status';

export const signup = async (req: Request, res: Response): Promise<Response> => {
	const { user, tokens } = await authService.signup(req.body);
	return res.json({
		success: true,
		data: { user, tokens }
	});
};

export const signin = async (req: Request, res: Response): Promise<Response> => {
	const { user, tokens } = await authService.signin(req.body.email, req.body.password);
	return res.json({
		success: true,
		data: { user, tokens }
	});
};

export const current = async (req: Request, res: Response): Promise<Response> => {
	const data = await authService.getCurrentUser(req.user!.id);
	return res.json({
		success: true,
		data
	});
};

export const getMe = async (req: Request, res: Response): Promise<Response> => {
	const user = await authService.getMe(req.user!.id);
	return res.json({
		success: true,
		data: user
	});
};

export const updateMe = async (req: Request, res: Response): Promise<Response> => {
	const user = await authService.updateMe(req.user!.id, req.body);
	return res.json({
		success: true,
		data: user
	});
};

export const signout = async (req: Request, res: Response): Promise<Response> => {
	await authService.signout(req.body.refreshToken);
	return res.json({
		success: true,
		data: 'Signout success'
	});
};

export const refreshTokens = async (req: Request, res: Response): Promise<Response> => {
	const { tokens } = await authService.refreshTokens(req.body.refreshToken);
	return res.json({
		success: true,
		data: { tokens }
	});
};

export const sendVerificationEmail = async (req: Request, res: Response): Promise<Response> => {
	const email = req.user!.email;
	if (!email) {
		throw new APIError('User email not found', httpStatus.BAD_REQUEST);
	}
	await authService.sendVerificationEmail(req.user!.id, email);
	return res.json({
		success: true,
		data: 'Send verification email success'
	});
};

export const verifyEmail = async (req: Request, res: Response): Promise<Response> => {
	await authService.verifyEmail(req.query.token as string);
	return res.json({
		success: true,
		data: 'Verify email success'
	});
};

export const forgotPassword = async (req: Request, res: Response): Promise<Response> => {
	await authService.forgotPassword(req.body.email);
	return res.json({
		success: true,
		data: 'If an account exists for this email, you will receive a password reset link.'
	});
};

export const resetPassword = async (req: Request, res: Response): Promise<Response> => {
	await authService.resetPassword(req.query.token as string, req.body.password);
	return res.json({
		success: true,
		data: 'Reset password success'
	});
};

export const googleCallback = async (req: Request, res: Response): Promise<void | Response> => {
	if (!req.user) {
		throw new APIError('Google sign-in failed', httpStatus.UNAUTHORIZED);
	}
	const tokens = await authService.getTokensForUser(req.user.id);
	const frontendUrl = config.FRONTEND_URL.replace(/\/$/, '');
	const redirectUrl = `${frontendUrl}/auth/callback#accessToken=${encodeURIComponent(
		tokens.accessToken.token
	)}&refreshToken=${encodeURIComponent(tokens.refreshToken.token)}&expires=${encodeURIComponent(tokens.accessToken.expires)}`;
	return res.redirect(redirectUrl);
};

export default {
	signup,
	signin,
	current,
	getMe,
	updateMe,
	signout,
	refreshTokens,
	sendVerificationEmail,
	verifyEmail,
	forgotPassword,
	resetPassword,
	googleCallback
};

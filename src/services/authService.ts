import type { Types } from 'mongoose';
import User, { IUserDocument } from '~/models/userModel';
import Role from '~/models/roleModel';
import Token from '~/models/tokenModel';
import tokenService from './tokenService';
import emailService from './emailService';
import notificationService from './notificationService';
import config from '~/config/config';
import { ConflictError, InternalError, NotFoundError, UnauthorizedError, ValidationError } from '~/utils/domainErrors';

export interface SignupBody {
	name: string;
	email: string;
	password: string;
}

export interface AuthTokens {
	accessToken: { token: string; expires: string };
	refreshToken: { token: string; expires: string };
}

export interface SignupResult {
	user: IUserDocument;
	tokens: AuthTokens;
}

export async function signup(body: SignupBody): Promise<SignupResult> {
	const role = await Role.getRoleByName('User');
	if (!role) {
		throw new InternalError('Default role not found');
	}
	const user = await User.createUser({ ...body, roles: [role.id] });
	const tokens = await tokenService.generateAuthTokens(user);
	await notificationService.createNotification(user._id, {
		type: 'success',
		title: 'Welcome',
		message: `Welcome, ${body.name}! Your account has been created.`
	});
	return { user, tokens };
}

export async function signin(email: string, password: string): Promise<{ user: IUserDocument; tokens: AuthTokens }> {
	const user = await User.getUserByEmail(email);
	if (!user || !(await user.isPasswordMatch(password))) {
		throw new ValidationError('Incorrect email or password');
	}
	const tokens = await tokenService.generateAuthTokens(user);
	return { user, tokens };
}

export async function getCurrentUser(userId: string): Promise<{ name: string; avatarUrl?: string }> {
	const user = await User.getUserById(userId);
	if (!user) {
		throw new NotFoundError('User not found');
	}
	const u = user as IUserDocument & { avatarUrl?: string };
	return {
		name: u.name,
		avatarUrl: u.avatarUrl
	};
}

export async function getMe(userId: string): Promise<IUserDocument> {
	const user = await User.getUserByIdWithRoles(userId);
	if (!user) {
		throw new NotFoundError('User not found');
	}
	return user;
}

export async function updateMe(
	userId: string,
	body: { name?: string; email?: string; password?: string; avatar?: string }
): Promise<IUserDocument> {
	return User.updateUserById(userId, body);
}

export async function signout(refreshToken: string): Promise<void> {
	await Token.revokeToken(refreshToken, config.TOKEN_TYPES.REFRESH);
}

export async function refreshTokens(refreshToken: string): Promise<{ tokens: AuthTokens }> {
	const rotation = await Token.consumeRefreshTokenForRotation(refreshToken);
	if (rotation.outcome === 'reuse' || rotation.outcome === 'invalid') {
		throw new UnauthorizedError('Invalid refresh token');
	}
	const user = await User.getUserById(rotation.userId);
	if (!user) {
		throw new UnauthorizedError('User not found');
	}
	const tokens = await tokenService.generateAuthTokens(user, {
		refreshFamilyId: rotation.familyId
	});
	return { tokens };
}

export async function sendVerificationEmail(userId: string, email: string): Promise<void> {
	const user = await User.getUserByEmail(email);
	if (!user) {
		throw new NotFoundError('User not found');
	}
	if (user.confirmed) {
		throw new ConflictError('Email verified');
	}
	const verifyEmailToken = await tokenService.generateVerifyEmailToken({
		id: userId,
		_id: user._id as Types.ObjectId
	});
	await emailService.sendVerificationEmail(email, verifyEmailToken);
}

export async function verifyEmail(token: string): Promise<void> {
	const verifyEmailTokenDoc = await tokenService.verifyToken(token, config.TOKEN_TYPES.VERIFY_EMAIL);
	const user = await User.getUserById(verifyEmailTokenDoc.user);
	if (!user) {
		throw new UnauthorizedError('User not found');
	}
	await Token.deleteMany({
		user: user._id,
		type: config.TOKEN_TYPES.VERIFY_EMAIL
	});
	await User.updateUserById(user._id, { confirmed: true });
}

export async function forgotPassword(email: string): Promise<void> {
	const resetPasswordToken = await tokenService.generateResetPasswordToken(email);
	if (resetPasswordToken) {
		await emailService.sendResetPasswordEmail(email, resetPasswordToken);
	}
}

export async function resetPassword(token: string, password: string): Promise<void> {
	const resetPasswordTokenDoc = await tokenService.verifyToken(token, config.TOKEN_TYPES.RESET_PASSWORD);
	const user = await User.getUserById(resetPasswordTokenDoc.user);
	if (!user) {
		throw new UnauthorizedError('User not found');
	}
	await Token.deleteMany({
		user: user._id,
		type: config.TOKEN_TYPES.RESET_PASSWORD
	});
	await User.updateUserById(user._id, { password });
}

export async function getTokensForUser(userId: string): Promise<AuthTokens> {
	const user = await User.getUserById(userId);
	if (!user) {
		throw new NotFoundError('User not found');
	}
	return tokenService.generateAuthTokens(user);
}

export default {
	signup,
	signin,
	getCurrentUser,
	getMe,
	updateMe,
	signout,
	refreshTokens,
	sendVerificationEmail,
	verifyEmail,
	forgotPassword,
	resetPassword,
	getTokensForUser
};

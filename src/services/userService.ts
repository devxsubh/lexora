import type { Types } from 'mongoose';
import User, { IUser, IUserDocument } from '~/models/userModel';
import Role from '~/models/roleModel';
import escapeRegex from '~/utils/escapeRegex';
import { InternalError, ValidationError } from '~/utils/domainErrors';

export interface CreateUserBody {
	name: string;
	email: string;
	password: string;
	roles?: Types.ObjectId[];
}

export interface GetUsersOptions {
	limit?: number;
	page?: number;
	sortBy?: string;
	sortDirection?: string;
}

export interface GetUsersResult {
	results: IUserDocument[];
	totalResults: number;
}

export async function createUser(body: CreateUserBody): Promise<IUserDocument> {
	return User.createUser(body);
}

export async function getUsers(
	options: GetUsersOptions,
	queryFilter?: { $or: { name?: { $regex: string; $options: string }; email?: { $regex: string; $options: string } }[] }
): Promise<GetUsersResult> {
	const result = await User.paginate(options as Record<string, unknown>, 'roles.permissions', queryFilter ?? undefined);
	return {
		results: result.results as IUserDocument[],
		totalResults: result.totalResults
	};
}

export async function getUser(userId: string): Promise<IUserDocument | null> {
	return User.getUserByIdWithRoles(userId);
}

export async function updateUser(userId: string, body: Partial<IUser & { roles?: Types.ObjectId[] }>): Promise<IUserDocument> {
	const superAdminRole = await Role.getRoleByName('Super Administrator');
	if (!superAdminRole) {
		throw new InternalError('Super Administrator role not found');
	}
	if (
		body.roles &&
		!(await User.isRoleIdAlreadyExists(superAdminRole._id as Types.ObjectId, userId)) &&
		!body.roles.some((r) => r.toString() === (superAdminRole._id as Types.ObjectId).toString())
	) {
		throw new ValidationError('Requires at least 1 user as Super Administrator');
	}
	return User.updateUserById(userId, body);
}

export async function deleteUser(userId: string): Promise<void> {
	const superAdminRole = await Role.getRoleByName('Super Administrator');
	if (!superAdminRole) {
		throw new InternalError('Super Administrator role not found');
	}
	if (!(await User.isRoleIdAlreadyExists(superAdminRole._id, userId))) {
		throw new ValidationError('Requires at least 1 user as Super Administrator');
	}
	await User.deleteUserById(userId);
}

export function buildUserListQuery(
	q: string | undefined
): { $or: { name?: { $regex: string; $options: string }; email?: { $regex: string; $options: string } }[] } | undefined {
	if (typeof q !== 'string' || !q.trim()) return undefined;
	const escaped = escapeRegex(q.trim());
	return {
		$or: [{ name: { $regex: escaped, $options: 'i' } }, { email: { $regex: escaped, $options: 'i' } }]
	};
}

export default {
	createUser,
	getUsers,
	getUser,
	updateUser,
	deleteUser,
	buildUserListQuery
};

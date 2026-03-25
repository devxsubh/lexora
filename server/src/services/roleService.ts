import type { HydratedDocument } from 'mongoose';
import Role, { IRole } from '~/models/roleModel';
import User from '~/models/userModel';
import escapeRegex from '~/utils/escapeRegex';
import { ValidationError } from '~/utils/domainErrors';

export interface GetRolesOptions {
	limit?: number;
	page?: number;
	sortBy?: string;
	sortDirection?: string;
}

export interface GetRolesResult {
	results: HydratedDocument<IRole>[];
	totalResults: number;
}

export async function createRole(body: Partial<IRole>): Promise<HydratedDocument<IRole>> {
	return Role.createRole(body);
}

export async function getRole(roleId: string): Promise<HydratedDocument<IRole> | null> {
	return Role.getRoleById(roleId);
}

export async function getRoles(
	options: GetRolesOptions,
	queryFilter?: { $or: { name?: { $regex: string; $options: string }; description?: { $regex: string; $options: string } }[] }
): Promise<GetRolesResult> {
	const result = await Role.paginate(options as Record<string, unknown>, 'permissions', queryFilter ?? undefined);
	return {
		results: result.results as HydratedDocument<IRole>[],
		totalResults: result.totalResults
	};
}

export async function updateRole(roleId: string, body: Partial<IRole>): Promise<HydratedDocument<IRole>> {
	return Role.updateRoleById(roleId, body);
}

export async function deleteRole(roleId: string): Promise<void> {
	if (await User.isRoleIdAlreadyExists(roleId)) {
		throw new ValidationError('A role cannot be deleted if associated with users');
	}
	await Role.deleteRoleById(roleId);
}

export function buildRoleListQuery(
	q: string | undefined
): { $or: { name?: { $regex: string; $options: string }; description?: { $regex: string; $options: string } }[] } | undefined {
	if (typeof q !== 'string' || !q.trim()) return undefined;
	const escaped = escapeRegex(q.trim());
	return {
		$or: [{ name: { $regex: escaped, $options: 'i' } }, { description: { $regex: escaped, $options: 'i' } }]
	};
}

export default {
	createRole,
	getRole,
	getRoles,
	updateRole,
	deleteRole,
	buildRoleListQuery
};

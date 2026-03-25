import { Request, Response } from 'express';
import _ from 'lodash';
import APIError from '~/utils/apiError';
import roleService from '~/services/roleService';
import httpStatus from 'http-status';

export const createRole = async (req: Request, res: Response): Promise<Response> => {
	const role = await roleService.createRole(req.body);
	return res.status(200).json({
		success: true,
		data: role
	});
};

export const getRole = async (req: Request, res: Response): Promise<Response> => {
	const role = await roleService.getRole(req.params.roleId);
	if (!role) {
		throw new APIError('Role not found', httpStatus.NOT_FOUND);
	}
	return res.json({
		success: true,
		data: role
	});
};

export const getRoles = async (req: Request, res: Response): Promise<Response> => {
	const options = _.pick(req.query, ['limit', 'page', 'sortBy', 'sortDirection']);
	const q = typeof req.query.q === 'string' ? req.query.q : undefined;
	const queryFilter = roleService.buildRoleListQuery(q);
	const roles = await roleService.getRoles(options as import('~/services/roleService').GetRolesOptions, queryFilter);
	return res.json({
		success: true,
		data: roles.results,
		pagination: {
			total: roles.totalResults
		}
	});
};

export const updateRole = async (req: Request, res: Response): Promise<Response> => {
	const role = await roleService.updateRole(req.params.roleId, req.body);
	return res.json({
		success: true,
		data: role
	});
};

export const deleteRole = async (req: Request, res: Response): Promise<Response> => {
	await roleService.deleteRole(req.params.roleId);
	return res.json({
		success: true,
		data: {}
	});
};

export default { createRole, getRole, updateRole, getRoles, deleteRole };

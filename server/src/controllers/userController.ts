import { Request, Response } from 'express';
import _ from 'lodash';
import APIError from '~/utils/apiError';
import userService from '~/services/userService';
import httpStatus from 'http-status';

export const createUser = async (req: Request, res: Response): Promise<Response> => {
	const user = await userService.createUser(req.body);
	return res.status(200).json({
		success: true,
		data: user
	});
};

export const getUsers = async (req: Request, res: Response): Promise<Response> => {
	const options = _.pick(req.query, ['limit', 'page', 'sortBy', 'sortDirection']);
	const q = typeof req.query.q === 'string' ? req.query.q : undefined;
	const queryFilter = userService.buildUserListQuery(q);
	const users = await userService.getUsers(options as import('~/services/userService').GetUsersOptions, queryFilter);
	return res.json({
		success: true,
		data: users.results,
		pagination: {
			total: users.totalResults
		}
	});
};

export const getUser = async (req: Request, res: Response): Promise<Response> => {
	const user = await userService.getUser(req.params.userId);
	if (!user) {
		throw new APIError('User not found', httpStatus.NOT_FOUND);
	}
	return res.json({
		success: true,
		data: user
	});
};

export const updateUser = async (req: Request, res: Response): Promise<Response> => {
	const user = await userService.updateUser(req.params.userId, req.body);
	return res.json({
		success: true,
		data: user
	});
};

export const deleteUser = async (req: Request, res: Response): Promise<Response> => {
	await userService.deleteUser(req.params.userId);
	return res.json({
		success: true,
		data: 'Delete user success'
	});
};

export default { createUser, getUsers, getUser, updateUser, deleteUser };

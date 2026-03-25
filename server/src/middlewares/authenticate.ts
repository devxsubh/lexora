import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import httpStatus from 'http-status';
import APIError from '~/utils/apiError';
import Role from '~/models/roleModel';

interface UserWithRoles {
	_id: unknown;
	roles?: unknown[];
}

const verifyCallback =
	(req: Request, resolve: () => void, reject: (err: APIError) => void, requiredRights: string[]) =>
	async (err: Error | null, user: UserWithRoles | false, info: unknown): Promise<void> => {
		if (err || info || !user) {
			return reject(new APIError(httpStatus[httpStatus.UNAUTHORIZED] as string, httpStatus.UNAUTHORIZED));
		}
		req.user = user as unknown as Express.User;
		if (requiredRights.length && (user as UserWithRoles).roles?.length) {
			const roles = await Role.find({
				_id: { $in: (user as UserWithRoles).roles }
			}).populate('permissions');
			const userRights: string[] = [];
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			roles.forEach((i: any) => {
				(i.permissions || []).forEach((j: { controller: string; action: string }) => {
					userRights.push(`${j.controller}:${j.action}`);
				});
			});
			const hasRequiredRights = requiredRights.every((r) => userRights.includes(r));
			if (!hasRequiredRights) {
				return reject(new APIError('Resource access denied', httpStatus.FORBIDDEN));
			}
		} else if (requiredRights.length) {
			return reject(new APIError('Resource access denied', httpStatus.FORBIDDEN));
		}
		return resolve();
	};

const authenticate =
	(...requiredRights: string[]) =>
	async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		return new Promise<void>((resolve, reject) => {
			passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights))(
				req,
				res,
				(err?: Error) => {
					if (err) return next(err);
					resolve();
				}
			);
		})
			.then(() => next())
			.catch((err: Error) => next(err));
	};

export default authenticate;

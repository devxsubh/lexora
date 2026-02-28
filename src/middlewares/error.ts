import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import Joi from 'joi';
import config from '~/config/config';
import logger from '~/config/logger';
import APIError, { ApiErrorItem } from '~/utils/apiError';
import { DomainError } from '~/utils/domainErrors';

interface ErrorWithStatus extends Error {
	status?: number;
	errors?: ApiErrorItem[];
	isOperational?: boolean;
}

export const converter = (err: ErrorWithStatus | Joi.ValidationError, req: Request, res: Response, next: NextFunction): void => {
	if (err instanceof Joi.ValidationError) {
		const errors: ApiErrorItem[] = err.details.map((d) => ({
			message: d.message,
			...(d.path[1] !== undefined && { location: String(d.path[1]) }),
			...(d.path[0] !== undefined && { locationType: String(d.path[0]) })
		}));
		const apiError = new APIError(errors, httpStatus.BAD_REQUEST);
		apiError.stack = err.stack;
		return next(apiError);
	}
	if (err instanceof DomainError) {
		const apiError = new APIError(err.message, err.statusCode);
		apiError.stack = err.stack;
		return next(apiError);
	}
	if (!(err instanceof APIError)) {
		const status = err.status ?? httpStatus.INTERNAL_SERVER_ERROR;
		const message = (err as Error).message ?? ((httpStatus as unknown as Record<number, string>)[status] as string);
		const apiError = new APIError(message, status, false);
		apiError.stack = (err as Error).stack;
		return next(apiError);
	}
	return next(err);
};

export const notFound = (req: Request, res: Response, next: NextFunction): void => {
	return next(new APIError(httpStatus[httpStatus.NOT_FOUND] as string, httpStatus.NOT_FOUND));
};

export const handler = (
	err: ErrorWithStatus | APIError,
	req: Request,
	res: Response,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	next: NextFunction
): void => {
	let status = err.status ?? 500;
	let errors: ApiErrorItem[] =
		err instanceof APIError ? err.errors : err.errors ?? [{ message: (err as Error).message || 'Internal Server Error' }];

	if (config.NODE_ENV === 'production' && !err.isOperational) {
		status = httpStatus.INTERNAL_SERVER_ERROR;
		errors = [{ message: (httpStatus[httpStatus.INTERNAL_SERVER_ERROR] as string) ?? 'Internal Server Error' }];
	}
	logger.error((err as Error).stack ?? '');
	const payload: Record<string, unknown> = {
		status,
		errors,
		...(req.id && { requestId: req.id }),
		...(config.NODE_ENV === 'development' && { stack: (err as Error).stack })
	};
	res.status(status).json(payload);
};

export default { converter, notFound, handler };

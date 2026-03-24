import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import httpStatus from 'http-status';
import * as errorMiddleware from '~/middlewares/error';
import APIError from '~/utils/apiError';
import { NotFoundError } from '~/utils/domainErrors';

jest.mock('~/config/config', () => ({
	__esModule: true,
	default: { NODE_ENV: 'development' }
}));

jest.mock('~/config/logger', () => ({
	__esModule: true,
	default: { error: jest.fn(), warn: jest.fn(), debug: jest.fn() }
}));

describe('error middleware', () => {
	let mockReq: Partial<Request>;
	let mockRes: Partial<Response>;
	let nextFn: NextFunction;

	beforeEach(() => {
		mockReq = {};
		mockRes = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn().mockReturnThis()
		};
		nextFn = jest.fn();
	});

	describe('converter', () => {
		it('converts Joi ValidationError to APIError and calls next', () => {
			const schema = Joi.object({ name: Joi.string().required() });
			const { error } = schema.validate({});
			expect(error).toBeDefined();
			errorMiddleware.converter(error!, mockReq as Request, mockRes as Response, nextFn);
			expect(nextFn).toHaveBeenCalledTimes(1);
			const passed = (nextFn as jest.Mock).mock.calls[0][0];
			expect(passed).toBeInstanceOf(APIError);
			expect(passed.status).toBe(httpStatus.BAD_REQUEST);
		});

		it('converts generic Error to APIError and calls next', () => {
			const err = new Error('Something broke');
			errorMiddleware.converter(
				err as Parameters<typeof errorMiddleware.converter>[0],
				mockReq as Request,
				mockRes as Response,
				nextFn
			);
			expect(nextFn).toHaveBeenCalledTimes(1);
			const passed = (nextFn as jest.Mock).mock.calls[0][0];
			expect(passed).toBeInstanceOf(APIError);
			expect(passed.status).toBe(httpStatus.INTERNAL_SERVER_ERROR);
		});

		it('passes through APIError unchanged', () => {
			const apiErr = new APIError('Bad request', httpStatus.BAD_REQUEST);
			errorMiddleware.converter(
				apiErr as Parameters<typeof errorMiddleware.converter>[0],
				mockReq as Request,
				mockRes as Response,
				nextFn
			);
			expect(nextFn).toHaveBeenCalledWith(apiErr);
		});

		it('converts DomainError to APIError with correct status', () => {
			const domainErr = new NotFoundError('User not found');
			errorMiddleware.converter(
				domainErr as Parameters<typeof errorMiddleware.converter>[0],
				mockReq as Request,
				mockRes as Response,
				nextFn
			);
			expect(nextFn).toHaveBeenCalledTimes(1);
			const passed = (nextFn as jest.Mock).mock.calls[0][0];
			expect(passed).toBeInstanceOf(APIError);
			expect(passed.status).toBe(httpStatus.NOT_FOUND);
			expect(passed.errors[0].message).toBe('User not found');
		});
	});

	describe('notFound', () => {
		it('calls next with APIError 404', () => {
			errorMiddleware.notFound(mockReq as Request, mockRes as Response, nextFn);
			expect(nextFn).toHaveBeenCalledTimes(1);
			const err = (nextFn as jest.Mock).mock.calls[0][0];
			expect(err).toBeInstanceOf(APIError);
			expect(err.status).toBe(httpStatus.NOT_FOUND);
		});
	});

	describe('handler', () => {
		it('sends status and errors in response', () => {
			const err = new APIError('Not found', httpStatus.NOT_FOUND);
			errorMiddleware.handler(
				err as Parameters<typeof errorMiddleware.handler>[0],
				mockReq as Request,
				mockRes as Response,
				nextFn
			);
			expect(mockRes.status).toHaveBeenCalledWith(httpStatus.NOT_FOUND);
			expect(mockRes.json).toHaveBeenCalledWith(
				expect.objectContaining({
					status: httpStatus.NOT_FOUND,
					errors: expect.any(Array)
				})
			);
		});

		it('includes stack in development', () => {
			const err = new APIError('Error', httpStatus.INTERNAL_SERVER_ERROR);
			errorMiddleware.handler(
				err as Parameters<typeof errorMiddleware.handler>[0],
				mockReq as Request,
				mockRes as Response,
				nextFn
			);
			expect(mockRes.json).toHaveBeenCalledWith(
				expect.objectContaining({
					stack: expect.any(String)
				})
			);
		});
	});
});

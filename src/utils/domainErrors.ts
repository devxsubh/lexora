import httpStatus from 'http-status';

/**
 * Base domain error. Not for HTTP layer; use in models/services.
 * Error middleware maps these to APIError with the appropriate status.
 */
export class DomainError extends Error {
	readonly statusCode: number;

	readonly code: string;

	constructor(message: string, statusCode: number, code: string) {
		super(message);
		this.name = this.constructor.name;
		this.statusCode = statusCode;
		this.code = code;
		Error.captureStackTrace(this, this.constructor);
	}
}

export class NotFoundError extends DomainError {
	constructor(message: string = 'Resource not found') {
		super(message, httpStatus.NOT_FOUND, 'NOT_FOUND');
	}
}

export class ConflictError extends DomainError {
	constructor(message: string = 'Conflict') {
		super(message, httpStatus.BAD_REQUEST, 'CONFLICT');
	}
}

export class ValidationError extends DomainError {
	constructor(message: string = 'Validation failed') {
		super(message, httpStatus.BAD_REQUEST, 'VALIDATION_ERROR');
	}
}

export class InternalError extends DomainError {
	constructor(message: string = 'Internal error') {
		super(message, httpStatus.INTERNAL_SERVER_ERROR, 'INTERNAL');
	}
}

export class UnauthorizedError extends DomainError {
	constructor(message: string = 'Unauthorized') {
		super(message, httpStatus.UNAUTHORIZED, 'UNAUTHORIZED');
	}
}

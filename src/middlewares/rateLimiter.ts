import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import config from '~/config/config';
import APIError from '~/utils/apiError';

const rateLimiter = rateLimit({
	windowMs: config.RATE_LIMIT_WINDOW_MS,
	max: config.RATE_LIMIT_MAX,
	handler: (req: Request, res: Response, next: NextFunction) => {
		next(new APIError('Too many requests, please try again later.', httpStatus.TOO_MANY_REQUESTS));
	}
});

export default rateLimiter;

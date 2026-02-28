import { Request, Response, NextFunction } from 'express';

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<void | Response>;

const catchAsync = (fn: AsyncRequestHandler) => (req: Request, res: Response, next: NextFunction) => {
	Promise.resolve(fn(req, res, next)).catch((err: Error) => next(err));
};

export default catchAsync;

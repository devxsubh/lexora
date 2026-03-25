declare module 'express-rate-limit' {
	import { Request, Response, NextFunction } from 'express';
	function rateLimit(options: {
		windowMs?: number;
		max?: number;
		handler?: (req: Request, res: Response, next: NextFunction) => void;
	}): (req: Request, res: Response, next: NextFunction) => void;
	export default rateLimit;
}

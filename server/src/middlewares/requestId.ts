import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

const HEADER_REQUEST_ID = 'x-request-id';

/**
 * Attaches a unique request ID to each request (from header or generated).
 * Use req.id in logs and include in error responses for tracing.
 */
export function requestId(req: Request, res: Response, next: NextFunction): void {
	const incoming = req.headers[HEADER_REQUEST_ID];
	req.id = typeof incoming === 'string' && incoming.trim() ? incoming.trim() : uuidv4();
	res.setHeader(HEADER_REQUEST_ID, req.id);
	next();
}

export default requestId;

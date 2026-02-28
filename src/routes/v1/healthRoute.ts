import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import config from '~/config/config';

const router = Router();

router.get('/', (req: Request, res: Response) => {
	const dbState = mongoose.connection.readyState;
	const dbHealthy = dbState === 1;
	const status = dbHealthy ? 200 : 503;

	if (config.NODE_ENV === 'production') {
		return res.status(status).json({
			status: dbHealthy ? 'ok' : 'degraded',
			timestamp: new Date().toISOString()
		});
	}

	res.status(status).json({
		status: dbHealthy ? 'ok' : 'degraded',
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
		database: {
			state: dbState,
			healthy: dbHealthy
		}
	});
});

export default router;

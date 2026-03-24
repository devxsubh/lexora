import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '~/config/config';
import { withGeminiRetry } from '~/utils/geminiRetry';
import { isEmailConfigured, verifyEmailConnection } from '~/services/emailService';
import { isCloudinaryConfigured, pingCloudinary } from '~/services/cloudinaryService';
import { getShutdownSnapshot, isShuttingDown } from '~/utils/gracefulShutdown';
import queue from '~/services/queueService';

const router = Router();

type CheckResult = { status: string; latencyMs?: number; error?: string };

router.get('/ready', async (_req: Request, res: Response) => {
	if (isShuttingDown()) {
		const snap = getShutdownSnapshot();
		return res.status(503).json({
			success: false,
			data: {
				status: 'not_ready',
				reason: 'shutting_down',
				checks: { shutdown: { status: 'draining' } },
				...(config.NODE_ENV !== 'production' && {
					drain: {
						activeConnections: snap.activeConnections,
						activeBackgroundJobs: snap.activeBackgroundJobs,
						shutdownStartedAt: snap.shutdownStartedAt
					}
				})
			}
		});
	}

	const checks: Record<string, CheckResult> = {};

	const mongoStart = Date.now();
	try {
		if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
			throw new Error(`MongoDB not connected (readyState=${mongoose.connection.readyState})`);
		}
		await mongoose.connection.db.admin().command({ ping: 1 });
		checks.mongodb = { status: 'healthy', latencyMs: Date.now() - mongoStart };
	} catch (err) {
		checks.mongodb = {
			status: 'unhealthy',
			latencyMs: Date.now() - mongoStart,
			error: err instanceof Error ? err.message : 'Unknown error'
		};
	}

	if (!isEmailConfigured) {
		checks.email = { status: 'not_configured' };
	} else {
		const emailStart = Date.now();
		try {
			await verifyEmailConnection();
			checks.email = { status: 'healthy', latencyMs: Date.now() - emailStart };
		} catch (err) {
			checks.email = {
				status: 'unhealthy',
				latencyMs: Date.now() - emailStart,
				error: err instanceof Error ? err.message : 'Unknown error'
			};
		}
	}

	if (!isCloudinaryConfigured()) {
		checks.cloudinary = { status: 'not_configured' };
	} else {
		const cldStart = Date.now();
		try {
			await pingCloudinary();
			checks.cloudinary = { status: 'healthy', latencyMs: Date.now() - cldStart };
		} catch (err) {
			checks.cloudinary = {
				status: 'unhealthy',
				latencyMs: Date.now() - cldStart,
				error: err instanceof Error ? err.message : 'Unknown error'
			};
		}
	}

	const mongoOk = checks.mongodb.status === 'healthy';
	const emailOk = checks.email.status === 'healthy' || checks.email.status === 'not_configured';
	const cloudinaryOk = checks.cloudinary.status === 'healthy' || checks.cloudinary.status === 'not_configured';
	const ready = mongoOk && emailOk && cloudinaryOk;

	return res.status(ready ? 200 : 503).json({
		success: ready,
		data: {
			status: ready ? 'ready' : 'not_ready',
			checks
		}
	});
});

router.get('/', (req: Request, res: Response) => {
	const dbState = mongoose.connection.readyState;
	const dbHealthy = dbState === 1;
	const status = dbHealthy ? 200 : 503;
	const draining = isShuttingDown();

	/** Liveness: process responds; `shutting_down` is true during graceful drain (orchestrator should use /ready for routing). */
	if (config.NODE_ENV === 'production') {
		return res.status(status).json({
			status: dbHealthy ? 'ok' : 'degraded',
			timestamp: new Date().toISOString(),
			shutting_down: draining
		});
	}

	res.status(status).json({
		status: dbHealthy ? 'ok' : 'degraded',
		timestamp: new Date().toISOString(),
		shutting_down: draining,
		uptime: process.uptime(),
		database: {
			state: dbState,
			healthy: dbHealthy
		},
		queue: queue.getStats(),
		...(draining && { shutdown: getShutdownSnapshot() })
	});
});

router.get('/external', async (req: Request, res: Response) => {
	const results: Record<string, { status: string; latencyMs?: number; error?: string }> = {};

	// MongoDB
	const dbStart = Date.now();
	const dbState = mongoose.connection.readyState;
	results.mongodb = {
		status: dbState === 1 ? 'healthy' : 'unhealthy',
		latencyMs: Date.now() - dbStart,
		...(dbState !== 1 && { error: `Connection state: ${dbState}` })
	};

	// Gemini: live generateContent burns free-tier quota if this route is polled often — default is key-only check.
	if (config.GEMINI_API_KEY) {
		if (!config.GEMINI_HEALTH_LIVE_PROBE) {
			results.gemini = { status: 'configured', latencyMs: 0 };
		} else {
			const geminiStart = Date.now();
			try {
				const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
				const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
				await withGeminiRetry(() => model.generateContent('Respond with just the word "ok".'));
				results.gemini = { status: 'healthy', latencyMs: Date.now() - geminiStart };
			} catch (err) {
				results.gemini = {
					status: 'unhealthy',
					latencyMs: Date.now() - geminiStart,
					error: err instanceof Error ? err.message : 'Unknown error'
				};
			}
		}
	} else {
		results.gemini = { status: 'not_configured', error: 'GEMINI_API_KEY is not set' };
	}

	const allHealthy = Object.values(results).every(
		(r) => r.status === 'healthy' || r.status === 'not_configured' || r.status === 'configured'
	);

	res.status(allHealthy ? 200 : 503).json({
		status: allHealthy ? 'ok' : 'degraded',
		timestamp: new Date().toISOString(),
		services: results
	});
});

export default router;

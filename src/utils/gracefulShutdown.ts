import type { Server } from 'http';
import type { Socket } from 'net';
import mongoose from 'mongoose';
import config from '~/config/config';
import logger from '~/config/logger';

let shuttingDown = false;
let shutdownStartedAt: number | null = null;
const trackedSockets = new Set<Socket>();
let activeBackgroundJobs = 0;

type ShutdownHook = () => void | Promise<void>;
const shutdownHooks: ShutdownHook[] = [];

export function isShuttingDown(): boolean {
	return shuttingDown;
}

export function getShutdownSnapshot(): {
	shuttingDown: boolean;
	shutdownStartedAt: number | null;
	activeConnections: number;
	activeBackgroundJobs: number;
} {
	return {
		shuttingDown,
		shutdownStartedAt,
		activeConnections: trackedSockets.size,
		activeBackgroundJobs
	};
}

export function attachConnectionTracking(server: Server): void {
	server.on('connection', (socket) => {
		trackedSockets.add(socket);
		socket.on('close', () => {
			trackedSockets.delete(socket);
		});
	});
}

function destroyTrackedConnections(): void {
	const n = trackedSockets.size;
	if (n > 0) {
		logger.warn(`Force-closing ${n} active connection(s)`);
	}
	for (const socket of trackedSockets) {
		socket.destroy();
	}
}

export function registerShutdownHook(hook: ShutdownHook): void {
	shutdownHooks.push(hook);
}

function markShuttingDown(): void {
	if (shuttingDown) {
		return;
	}
	shuttingDown = true;
	shutdownStartedAt = Date.now();
}

/**
 * Wrap async work that must finish (or be waited on) during shutdown.
 * New jobs are rejected once shutdown has started.
 */
export async function runBackgroundJob<T>(fn: () => Promise<T>): Promise<T> {
	if (shuttingDown) {
		const err = new Error('Server is shutting down');
		(err as NodeJS.ErrnoException).code = 'SHUTTING_DOWN';
		throw err;
	}
	activeBackgroundJobs += 1;
	try {
		return await fn();
	} finally {
		activeBackgroundJobs -= 1;
	}
}

export function getActiveBackgroundJobCount(): number {
	return activeBackgroundJobs;
}

async function waitForBackgroundJobsDeadline(ms: number): Promise<void> {
	const start = Date.now();
	while (activeBackgroundJobs > 0 && Date.now() - start < ms) {
		await new Promise<void>((r) => setTimeout(r, 50));
	}
	if (activeBackgroundJobs > 0) {
		logger.warn(
			`Proceeding with shutdown while ${activeBackgroundJobs} background job(s) still active (drain budget ${ms}ms)`
		);
	}
}

async function runShutdownHooks(): Promise<void> {
	for (const hook of shutdownHooks) {
		try {
			await Promise.resolve(hook());
		} catch (e) {
			logger.error(`Shutdown hook failed: ${e}`);
		}
	}
}

async function closeMongo(): Promise<void> {
	await mongoose.connection.close(false);
	logger.warn('MongoDB connection closed');
}

/**
 * Ordered shutdown: stop accepting HTTP, drain or force-close connections, optional background job drain, hooks, Mongo.
 */
export async function gracefulShutdown(
	server: Server | undefined,
	signal: string,
	exitCode: number
): Promise<void> {
	if (shuttingDown) {
		logger.warn(`${signal} ignored — shutdown already in progress`);
		return;
	}
	markShuttingDown();
	logger.info(`${signal} received — draining (grace ${config.SHUTDOWN_GRACE_MS}ms)`);

	const graceMs = config.SHUTDOWN_GRACE_MS;
	const bgDrainMs = config.SHUTDOWN_BACKGROUND_DRAIN_MS;

	await new Promise<void>((resolve) => {
		if (!server) {
			resolve();
			return;
		}
		const forceTimer = setTimeout(() => {
			logger.warn(`Grace period (${graceMs}ms) elapsed — forcing connection close`);
			destroyTrackedConnections();
		}, graceMs);

		server.close(() => {
			clearTimeout(forceTimer);
			logger.info('HTTP server closed');
			resolve();
		});
	});

	await waitForBackgroundJobsDeadline(bgDrainMs);
	await runShutdownHooks();

	try {
		await closeMongo();
	} catch (e) {
		logger.error(`MongoDB close error: ${e}`);
		process.exit(1);
		return;
	}
	process.exit(exitCode);
}

/** Fast path after fatal errors: tear down sockets and DB without a long grace wait. */
export async function emergencyShutdown(server: Server | undefined, exitCode: number): Promise<void> {
	markShuttingDown();
	destroyTrackedConnections();
	if (server) {
		await new Promise<void>((resolve) => {
			server.close(() => resolve());
		});
	}
	try {
		await closeMongo();
	} catch {
		// ignore
	}
	process.exit(exitCode);
}

import { Request, Response, NextFunction } from 'express';
import client from 'prom-client';
import config from '~/config/config';

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestDuration = new client.Histogram({
	name: 'http_request_duration_seconds',
	help: 'HTTP request latency in seconds',
	labelNames: ['method', 'route', 'status_code'],
	buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
	registers: [register]
});

const httpRequestsTotal = new client.Counter({
	name: 'http_requests_total',
	help: 'Total HTTP requests by method, route template, and status',
	labelNames: ['method', 'route', 'status_code'],
	registers: [register]
});

function routeLabel(req: Request): string {
	if (req.route?.path) {
		return `${req.baseUrl ?? ''}${req.route.path}`;
	}
	return req.path || 'unknown';
}

export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
	const start = process.hrtime.bigint();
	res.on('finish', () => {
		const status = String(res.statusCode);
		const route = routeLabel(req);
		const durationSec = Number(process.hrtime.bigint() - start) / 1e9;
		httpRequestDuration.labels({ method: req.method, route, status_code: status }).observe(durationSec);
		httpRequestsTotal.inc({ method: req.method, route, status_code: status });
	});
	next();
}

export async function metricsHandler(_req: Request, res: Response): Promise<void> {
	res.setHeader('Content-Type', register.contentType);
	res.end(await register.metrics());
}

export function isMetricsEnabled(): boolean {
	return config.METRICS_ENABLED === true;
}

export { register };

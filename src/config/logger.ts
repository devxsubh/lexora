import fs from 'fs';
import path from 'path';
import winston from 'winston';
import config from './config';

/** Writable in containers where the app user cannot create dirs under cwd (e.g. USER node on /app). */
const logDir =
	(process.env.LOG_DIR && process.env.LOG_DIR.trim()) ||
	(process.env.NODE_ENV === 'production' ? '/tmp/logs' : 'logs');

fs.mkdirSync(logDir, { recursive: true });

const logTimezone = config.LOG_TZ || undefined;
const tzFormatter =
	logTimezone &&
	new Intl.DateTimeFormat('en-CA', {
		timeZone: logTimezone,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: false
	});

function timestamp(): string {
	if (tzFormatter) {
		const parts = tzFormatter.formatToParts(new Date());
		const get = (id: string) => parts.find((p) => p.type === id)?.value ?? '';
		return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}:${get('second')}`;
	}
	return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

const levels = {
	error: 0,
	warn: 1,
	info: 2,
	http: 3,
	debug: 4
};

winston.addColors({
	error: 'red',
	warn: 'yellow',
	info: 'green',
	http: 'magenta',
	debug: 'white'
});

const consoleTransport = new winston.transports.Console({
	format: winston.format.combine(winston.format.colorize({ all: true }))
});

const fileTransports: winston.transport[] = [
	new winston.transports.File({
		level: 'error',
		filename: path.join(logDir, 'error.log'),
		maxsize: 10000000,
		maxFiles: 10
	}),
	new winston.transports.File({
		filename: path.join(logDir, 'combined.log'),
		maxsize: 10000000,
		maxFiles: 10
	})
];

const logger = winston.createLogger({
	level: config.NODE_ENV === 'development' ? 'debug' : 'warn',
	levels,
	format: winston.format.combine(
		winston.format.timestamp({ format: () => timestamp() }),
		winston.format.printf((info) => `${[info.timestamp]}: ${info.level}: ${info.message}`)
	),
	transports: [consoleTransport, ...fileTransports]
});

export default logger;

import winston from 'winston';
import config from './config';

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

// Vercel (and other serverless platforms) have a read-only filesystem —
// attempting mkdirSync('logs') crashes the function on cold start.
const fileTransports: winston.transport[] = process.env.VERCEL
	? []
	: [
			new winston.transports.File({
				level: 'error',
				filename: 'logs/error.log',
				maxsize: 10000000,
				maxFiles: 10
			}),
			new winston.transports.File({
				filename: 'logs/combined.log',
				maxsize: 10000000,
				maxFiles: 10
			})
	  ];

const logger = winston.createLogger({
	level: config.NODE_ENV === 'development' ? 'debug' : 'warn',
	levels,
	format: winston.format.combine(
		winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
		winston.format.printf((info) => `${[info.timestamp]}: ${info.level}: ${info.message}`)
	),
	transports: [consoleTransport, ...fileTransports]
});

export default logger;

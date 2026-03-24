import mongoose from 'mongoose';
import config from '~/config/config';
import app from './app';
import initialData from '~/config/initialData';
import logger from '~/config/logger';
import { registerJobHandlers } from '~/config/jobHandlers';
import {
	attachConnectionTracking,
	emergencyShutdown,
	gracefulShutdown
} from '~/utils/gracefulShutdown';

mongoose.set('strictQuery', false);

let server: import('http').Server | undefined;

const db = mongoose.connection;

db.on('connecting', () => {
	logger.info('🚀 Connecting to MongoDB...');
});

db.on('error', (err: Error) => {
	logger.error(`MongoDB connection error: ${err}`);
	mongoose.disconnect();
});

db.on('connected', () => {
	logger.info('🚀 Connected to MongoDB!');
});

db.once('open', () => {
	logger.info('🚀 MongoDB connection opened!');
});

db.on('reconnected', () => {
	logger.info('🚀 MongoDB reconnected!');
});

const connect = async (): Promise<void> => {
	try {
		await mongoose.connect(config.DATABASE_URI, config.DATABASE_OPTIONS);
		logger.info('🚀 Connected to MongoDB end!');
		if (config.SEED_DATABASE) {
			await initialData();
			logger.info('🚀 Initial MongoDB!');
		}
		registerJobHandlers();
		server = app.listen(config.PORT, config.HOST, () => {
			attachConnectionTracking(server!);
			logger.info(`🚀 Host: http://${config.HOST}:${config.PORT}`);
			logger.info('/$$');
			logger.info('| $$');
			logger.info('| $$        /$$$$$$  /$$   /$$  /$$$$$$   /$$$$$$  /$$$$$$ ');
			logger.info('| $$       /$$__  $$|  $$ /$$/ /$$__  $$ /$$__  $$|____  $$');
			logger.info('| $$      | $$$$$$$$ \\  $$$$/ | $$  \\ $$| $$  \\__/ /$$$$$$$');
			logger.info('| $$      | $$_____/  >$$  $$ | $$  | $$| $$      /$$__  $$');
			logger.info('| $$$$$$$$|  $$$$$$$ /$$/\\  $$|  $$$$$$/| $$     |  $$$$$$$');
			logger.info('|________/ \\_______/|__/  \\__/ \\______/ |__/      \\_______/');
		});
	} catch (err) {
		logger.error(`MongoDB connection error: ${err}`);
	}
};

connect();

const unexpectedErrorHandler = (err: Error): void => {
	logger.error(err);
	void emergencyShutdown(server, 1);
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

let shutdownPromise: Promise<void> | null = null;

const onShutdownSignal = (signal: 'SIGTERM' | 'SIGINT'): void => {
	if (shutdownPromise) {
		logger.error(`Second ${signal} — forcing exit`);
		process.exit(1);
		return;
	}
	shutdownPromise = gracefulShutdown(server, signal, 0);
};

process.on('SIGTERM', () => {
	onShutdownSignal('SIGTERM');
});

process.on('SIGINT', () => {
	onShutdownSignal('SIGINT');
});

export default app;

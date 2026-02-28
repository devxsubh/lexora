import mongoose from 'mongoose';
import config from '~/config/config';
import app from './app';
import initialData from '~/config/initialData';
import logger from '~/config/logger';

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
		if (config.SEED_DATABASE && !process.env.VERCEL) {
			await initialData();
			logger.info('🚀 Initial MongoDB!');
		}
		// On Vercel we only export the app; the platform handles the server
		if (!process.env.VERCEL) {
			server = app.listen(config.PORT, config.HOST, () => {
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
		}
	} catch (err) {
		logger.error(`MongoDB connection error: ${err}`);
	}
};

connect();

const exitHandler = (): void => {
	if (server) {
		server.close(() => {
			logger.warn('Server closed');
			mongoose.connection.close(false).then(
				() => {
					logger.warn('MongoDB connection closed');
					process.exit(1);
				},
				() => process.exit(1)
			);
		});
	} else {
		mongoose.connection.close(false).then(
			() => process.exit(1),
			() => process.exit(1)
		);
	}
};

const unexpectedErrorHandler = (err: Error): void => {
	logger.error(err);
	exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
	logger.info('SIGTERM received');
	if (server) {
		server.close(() => {
			mongoose.connection.close(false).then(
				() => logger.info('MongoDB connection closed'),
				() => {}
			);
		});
	}
});

// Export the Express app for Vercel (serverless) – see https://vercel.com/docs/frameworks/backend/express
export default app;

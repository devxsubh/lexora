import mongoose from 'mongoose';
import config from './config';
import logger from './logger';

mongoose.set('strictQuery', false);

const reconnectTimeout = 5000;

const connect = (): void => {
	mongoose.connect(config.DATABASE_URI, config.DATABASE_OPTIONS);
};

const mongooseConnect = (): void => {
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

	db.on('disconnected', () => {
		logger.error(`MongoDB disconnected! Reconnecting in ${reconnectTimeout / 1000}s...`);
		setTimeout(() => connect(), reconnectTimeout);
	});

	connect();
};

export default mongooseConnect;

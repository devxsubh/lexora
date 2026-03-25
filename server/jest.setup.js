const path = require('path');
const crypto = require('crypto');

require('dotenv').config({ path: path.resolve(process.cwd(), '.env.test') });
require('dotenv').config();
// After dotenv: keep Jest on `test` so initialData seeds dev users (super admin) even if `.env` sets NODE_ENV=production
process.env.NODE_ENV = 'test';
// Integration tests sign in with hardcoded dev passwords from initialData; clear this so seeds use `superadmin` / `admin` / etc.
process.env.SEED_DEFAULT_PASSWORD = '';

// Suppress Mongoose 7 deprecation warning for strictQuery default change
require('mongoose').set('strictQuery', false);

// Fallbacks for CI / environments without .env.test (required by config validation)
if (!process.env.DATABASE_URI) {
	process.env.DATABASE_URI = 'mongodb://localhost:27017/lexora-test';
}
if (!process.env.JWT_ACCESS_TOKEN_SECRET_PRIVATE || !process.env.JWT_ACCESS_TOKEN_SECRET_PUBLIC) {
	const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
		modulusLength: 2048,
		privateKeyEncoding: { type: 'pkcs1', format: 'pem' },
		publicKeyEncoding: { type: 'spki', format: 'pem' }
	});
	if (!process.env.JWT_ACCESS_TOKEN_SECRET_PRIVATE) {
		process.env.JWT_ACCESS_TOKEN_SECRET_PRIVATE = Buffer.from(privateKey, 'utf8').toString('base64');
	}
	if (!process.env.JWT_ACCESS_TOKEN_SECRET_PUBLIC) {
		process.env.JWT_ACCESS_TOKEN_SECRET_PUBLIC = Buffer.from(publicKey, 'utf8').toString('base64');
	}
}

// Mock sharp so integration tests run without native binary (optional: remove if sharp is installed)
jest.mock('sharp', () => {
	const mockResize = jest.fn().mockReturnThis();
	const mockToBuffer = jest.fn().mockResolvedValue(Buffer.from('mock'));
	const mockToFile = jest.fn().mockResolvedValue(undefined);
	return jest.fn(() => ({
		resize: mockResize,
		toBuffer: mockToBuffer,
		toFile: mockToFile
	}));
});

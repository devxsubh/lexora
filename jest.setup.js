const path = require('path');
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.test') });
require('dotenv').config();

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

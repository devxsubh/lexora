/** @type {import('jest').Config} */
module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: ['<rootDir>/src'],
	setupFiles: ['<rootDir>/jest.setup.js'],
	testMatch: ['**/__tests__/**/*.test.ts', '**/*.test.ts', '**/*.spec.ts'],
	moduleNameMapper: {
		'^~/(.*)$': '<rootDir>/src/$1'
	},
	collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/index.ts'],
	coverageDirectory: 'coverage',
	verbose: true
};

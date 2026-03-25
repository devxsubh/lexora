import httpStatus from 'http-status';
import * as tokenService from '../tokenService';

jest.mock('~/models/tokenModel', () => ({
	__esModule: true,
	default: {
		findOne: jest.fn(),
		saveToken: jest.fn()
	}
}));

describe('tokenService', () => {
	describe('generateRandomToken', () => {
		it('returns a hex string of default length', async () => {
			const token = await tokenService.generateRandomToken();
			expect(typeof token).toBe('string');
			expect(token).toMatch(/^[a-f0-9]+$/);
			expect(token.length).toBe(132); // 66 bytes = 132 hex chars
		});

		it('returns custom length when specified', async () => {
			const token = await tokenService.generateRandomToken(8);
			expect(token.length).toBe(16);
		});
	});

	describe('verifyToken', () => {
		it('throws APIError 401 when token not found', async () => {
			const Token = (await import('~/models/tokenModel')).default;
			(Token.findOne as jest.Mock).mockResolvedValue(null);
			await expect(tokenService.verifyToken('invalid', 'refresh')).rejects.toMatchObject({
				status: httpStatus.UNAUTHORIZED,
				errors: expect.arrayContaining([expect.objectContaining({ message: 'Token not found' })])
			});
		});

		it('throws APIError 401 when token expired', async () => {
			const Token = (await import('~/models/tokenModel')).default;
			(Token.findOne as jest.Mock).mockResolvedValue({
				token: 'abc',
				type: 'refresh',
				expiresAt: new Date(Date.now() - 10000),
				deleteOne: jest.fn()
			});
			await expect(tokenService.verifyToken('abc', 'refresh')).rejects.toMatchObject({
				status: httpStatus.UNAUTHORIZED,
				errors: expect.arrayContaining([expect.objectContaining({ message: 'Token expires' })])
			});
		});
	});
});

import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';
import moment from 'moment';
import APIError from '~/utils/apiError';

const AUTH_ERROR_MESSAGE = 'Authentication failed';

export const sign = async (
	userId: string,
	expires: moment.Moment,
	secret: Buffer,
	options: jwt.SignOptions & { keyid?: string }
): Promise<string> => {
	try {
		const payload = {
			sub: userId,
			iat: moment().unix(),
			exp: expires.unix()
		};
		const { keyid, ...signOpts } = options;
		const jwtOptions: jwt.SignOptions = { ...signOpts };
		if (keyid) {
			jwtOptions.keyid = keyid;
		}
		return jwt.sign(payload, secret as jwt.Secret, jwtOptions);
	} catch {
		throw new APIError(AUTH_ERROR_MESSAGE, httpStatus.UNAUTHORIZED);
	}
};

export const verify = async (token: string, secret: Buffer, options?: jwt.VerifyOptions): Promise<string | jwt.JwtPayload> => {
	try {
		const verifyOptions: jwt.VerifyOptions = { algorithms: ['RS256'], ...options };
		return jwt.verify(token, secret as jwt.Secret, verifyOptions);
	} catch {
		throw new APIError(AUTH_ERROR_MESSAGE, httpStatus.UNAUTHORIZED);
	}
};

export default { sign, verify };

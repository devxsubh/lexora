import dotenv from 'dotenv';
import Joi from 'joi';
import type { ConnectOptions } from 'mongoose';

dotenv.config();

const envValidate = Joi.object()
	.keys({
		NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
		APP_NAME: Joi.string().allow('').empty('').default('App Name'),
		HOST: Joi.string().allow('').empty('').default('0.0.0.0'),
		PORT: Joi.number().allow('').empty('').default(8080),

		DATABASE_URI: Joi.string().required(),

		JWT_ACCESS_TOKEN_SECRET_PRIVATE: Joi.string().required(),
		JWT_ACCESS_TOKEN_SECRET_PUBLIC: Joi.string().required(),
		/** Included in JWT header as `kid` when set; verify via primary public key */
		JWT_ACCESS_TOKEN_KEY_ID: Joi.string().allow('').empty('').default(''),
		/** JSON object: { "kid": "base64-encoded-PEM-public-key", ... } for previous key pairs */
		JWT_ACCESS_TOKEN_PUBLIC_KEYS_JSON: Joi.string().allow('').empty('').default(''),

		JWT_ACCESS_TOKEN_EXPIRATION_MINUTES: Joi.number().allow('').empty('').default(240),

		REFRESH_TOKEN_EXPIRATION_DAYS: Joi.number().allow('').empty('').default(1),
		VERIFY_EMAIL_TOKEN_EXPIRATION_MINUTES: Joi.number().allow('').empty('').default(60),
		RESET_PASSWORD_TOKEN_EXPIRATION_MINUTES: Joi.number().allow('').empty('').default(30),

		RESEND_API_KEY: Joi.string().allow('').empty(''),
		EMAIL_FROM: Joi.string().allow('').empty(''),

		FRONTEND_URL: Joi.string().allow('').empty('').default('http://localhost:3000'),
		IMAGE_URL: Joi.string().allow('').empty('').default('http://localhost:8080/images'),

		CORS_ORIGIN: Joi.string().allow('').empty('').default('*'),

		RATE_LIMIT_WINDOW_MS: Joi.number()
			.allow('')
			.empty('')
			.default(15 * 60 * 1000),
		RATE_LIMIT_MAX: Joi.number().allow('').empty('').default(100),
		AUTH_RATE_LIMIT_MAX: Joi.number().allow('').empty('').default(20),

		GOOGLE_CLIENT_ID: Joi.string().allow('').empty('').default(''),
		GOOGLE_CLIENT_SECRET: Joi.string().allow('').empty('').default(''),

		CLOUDINARY_CLOUD_NAME: Joi.string().allow('').empty('').default(''),
		CLOUDINARY_API_KEY: Joi.string().allow('').empty('').default(''),
		CLOUDINARY_API_SECRET: Joi.string().allow('').empty('').default(''),

		SEED_DATABASE: Joi.boolean().allow('').empty('').default(false),
		SEED_DEFAULT_PASSWORD: Joi.string().allow('').empty(''),

		LOG_TZ: Joi.string().allow('').empty('').default(''),

		GEMINI_API_KEY: Joi.string().allow('').empty('').default(''),
		/** When false (default), /health/external only checks that GEMINI_API_KEY is set — no API call (saves quota). */
		GEMINI_HEALTH_LIVE_PROBE: Joi.boolean().allow('').empty('').default(false),

		API_V1_DEPRECATION_LINK: Joi.string().allow('').empty('').default(''),
		/** HTTP-date (RFC 7231), e.g. Wed, 11 Nov 2026 23:59:59 GMT — sent as `Sunset` on /api/v1 */
		API_V1_SUNSET: Joi.string().allow('').empty('').default(''),

		METRICS_ENABLED: Joi.boolean().allow('').empty('').default(false),
		SENTRY_DSN: Joi.string().allow('').empty('').default(''),

		/** Max ms to wait for idle HTTP connections after server.close(); then sockets are destroyed */
		SHUTDOWN_GRACE_MS: Joi.number().allow('').empty('').default(10_000),
		/** After HTTP is closed, max ms to wait for runBackgroundJob work to finish */
		SHUTDOWN_BACKGROUND_DRAIN_MS: Joi.number().allow('').empty('').default(15_000)
	})
	.unknown();

const { value: env, error } = envValidate.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
	throw new Error(`Config env error: ${error.message}`);
}

function parseJwtPublicKeysJson(raw: string): Record<string, Buffer> {
	const trimmed = (raw ?? '').trim();
	if (!trimmed) return {};
	let obj: unknown;
	try {
		obj = JSON.parse(trimmed) as unknown;
	} catch {
		throw new Error('Config env error: JWT_ACCESS_TOKEN_PUBLIC_KEYS_JSON must be valid JSON');
	}
	if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
		throw new Error('Config env error: JWT_ACCESS_TOKEN_PUBLIC_KEYS_JSON must be a JSON object');
	}
	const out: Record<string, Buffer> = {};
	for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
		if (typeof v === 'string' && v.length > 0) {
			out[k] = Buffer.from(v, 'base64');
		}
	}
	return out;
}

export interface AppConfig {
	NODE_ENV: string;
	APP_NAME: string;
	HOST: string;
	PORT: number;
	DATABASE_URI: string;
	DATABASE_OPTIONS: ConnectOptions;
	JWT_ACCESS_TOKEN_SECRET_PRIVATE: Buffer;
	JWT_ACCESS_TOKEN_SECRET_PUBLIC: Buffer;
	JWT_ACCESS_TOKEN_KEY_ID: string;
	/** Additional public keys by `kid` for JWT rotation (excludes current primary; see jwtPublicKeys) */
	JWT_LEGACY_PUBLIC_KEYS: Record<string, Buffer>;
	JWT_ACCESS_TOKEN_EXPIRATION_MINUTES: number;
	REFRESH_TOKEN_EXPIRATION_DAYS: number;
	VERIFY_EMAIL_TOKEN_EXPIRATION_MINUTES: number;
	RESET_PASSWORD_TOKEN_EXPIRATION_MINUTES: number;
	RESEND_API_KEY: string;
	EMAIL_FROM: string;
	FRONTEND_URL: string;
	IMAGE_URL: string;
	CORS_ORIGIN: string;
	RATE_LIMIT_WINDOW_MS: number;
	RATE_LIMIT_MAX: number;
	AUTH_RATE_LIMIT_MAX: number;
	GOOGLE_CLIENT_ID: string;
	GOOGLE_CLIENT_SECRET: string;
	CLOUDINARY_CLOUD_NAME: string;
	CLOUDINARY_API_KEY: string;
	CLOUDINARY_API_SECRET: string;
	SEED_DATABASE: boolean;
	SEED_DEFAULT_PASSWORD: string;
	TOKEN_TYPES: {
		REFRESH: string;
		VERIFY_EMAIL: string;
		RESET_PASSWORD: string;
	};
	LOG_TZ: string;
	GEMINI_API_KEY: string;
	GEMINI_HEALTH_LIVE_PROBE: boolean;

	API_V1_DEPRECATION_LINK: string;
	API_V1_SUNSET: string;

	METRICS_ENABLED: boolean;
	SENTRY_DSN: string;
	SHUTDOWN_GRACE_MS: number;
	SHUTDOWN_BACKGROUND_DRAIN_MS: number;
}

const config: AppConfig = {
	NODE_ENV: env.NODE_ENV,
	APP_NAME: env.APP_NAME,
	HOST: env.HOST,
	PORT: env.PORT,

	DATABASE_URI: env.DATABASE_URI,
	DATABASE_OPTIONS: {
		retryWrites: true,
		w: 'majority'
	},

	JWT_ACCESS_TOKEN_SECRET_PRIVATE: Buffer.from(env.JWT_ACCESS_TOKEN_SECRET_PRIVATE, 'base64'),
	JWT_ACCESS_TOKEN_SECRET_PUBLIC: Buffer.from(env.JWT_ACCESS_TOKEN_SECRET_PUBLIC, 'base64'),
	JWT_ACCESS_TOKEN_KEY_ID: (env.JWT_ACCESS_TOKEN_KEY_ID as string) ?? '',
	JWT_LEGACY_PUBLIC_KEYS: parseJwtPublicKeysJson((env.JWT_ACCESS_TOKEN_PUBLIC_KEYS_JSON as string) ?? ''),
	JWT_ACCESS_TOKEN_EXPIRATION_MINUTES: env.JWT_ACCESS_TOKEN_EXPIRATION_MINUTES,

	REFRESH_TOKEN_EXPIRATION_DAYS: env.REFRESH_TOKEN_EXPIRATION_DAYS,
	VERIFY_EMAIL_TOKEN_EXPIRATION_MINUTES: env.VERIFY_EMAIL_TOKEN_EXPIRATION_MINUTES,
	RESET_PASSWORD_TOKEN_EXPIRATION_MINUTES: env.RESET_PASSWORD_TOKEN_EXPIRATION_MINUTES,

	RESEND_API_KEY: env.RESEND_API_KEY,
	EMAIL_FROM: env.EMAIL_FROM,

	FRONTEND_URL: env.FRONTEND_URL,

	IMAGE_URL: env.IMAGE_URL,

	CORS_ORIGIN: env.CORS_ORIGIN,

	RATE_LIMIT_WINDOW_MS: Number(env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
	RATE_LIMIT_MAX: Number(env.RATE_LIMIT_MAX) || 100,
	AUTH_RATE_LIMIT_MAX: Number(env.AUTH_RATE_LIMIT_MAX) || 20,

	GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID ?? '',
	GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET ?? '',

	CLOUDINARY_CLOUD_NAME: env.CLOUDINARY_CLOUD_NAME ?? '',
	CLOUDINARY_API_KEY: env.CLOUDINARY_API_KEY ?? '',
	CLOUDINARY_API_SECRET: env.CLOUDINARY_API_SECRET ?? '',

	SEED_DATABASE: env.SEED_DATABASE === true || env.SEED_DATABASE === 'true',
	SEED_DEFAULT_PASSWORD: (env.SEED_DEFAULT_PASSWORD as string) ?? '',

	TOKEN_TYPES: {
		REFRESH: 'refresh',
		VERIFY_EMAIL: 'verifyEmail',
		RESET_PASSWORD: 'resetPassword'
	},

	LOG_TZ: (env.LOG_TZ as string) ?? '',

	GEMINI_API_KEY: (env.GEMINI_API_KEY as string) ?? '',
	GEMINI_HEALTH_LIVE_PROBE: env.GEMINI_HEALTH_LIVE_PROBE === true || env.GEMINI_HEALTH_LIVE_PROBE === 'true',

	API_V1_DEPRECATION_LINK: (env.API_V1_DEPRECATION_LINK as string) ?? '',
	API_V1_SUNSET: (env.API_V1_SUNSET as string) ?? '',

	METRICS_ENABLED: env.METRICS_ENABLED === true || env.METRICS_ENABLED === 'true',
	SENTRY_DSN: (env.SENTRY_DSN as string) ?? '',

	SHUTDOWN_GRACE_MS: Number(env.SHUTDOWN_GRACE_MS) || 10_000,
	SHUTDOWN_BACKGROUND_DRAIN_MS: Number(env.SHUTDOWN_BACKGROUND_DRAIN_MS) || 15_000
};

export default config;

import dotenv from 'dotenv';
import Joi from 'joi';
import type { ConnectOptions } from 'mongoose';

dotenv.config();

const envValidate = Joi.object()
	.keys({
		NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
		APP_NAME: Joi.string().allow('').empty('').default('App Name'),
		HOST: Joi.string().allow('').empty('').default('0.0.0.0'),
		PORT: Joi.number().allow('').empty('').default(666),

		DATABASE_URI: Joi.string().required(),

		JWT_ACCESS_TOKEN_SECRET_PRIVATE: Joi.string().required(),
		JWT_ACCESS_TOKEN_SECRET_PUBLIC: Joi.string().required(),
		JWT_ACCESS_TOKEN_EXPIRATION_MINUTES: Joi.number().allow('').empty('').default(240),

		REFRESH_TOKEN_EXPIRATION_DAYS: Joi.number().allow('').empty('').default(1),
		VERIFY_EMAIL_TOKEN_EXPIRATION_MINUTES: Joi.number().allow('').empty('').default(60),
		RESET_PASSWORD_TOKEN_EXPIRATION_MINUTES: Joi.number().allow('').empty('').default(30),

		SMTP_HOST: Joi.string().allow('').empty(''),
		SMTP_PORT: Joi.number().allow('').empty(''),
		SMTP_USERNAME: Joi.string().allow('').empty(''),
		SMTP_PASSWORD: Joi.string().allow('').empty(''),
		EMAIL_FROM: Joi.string().allow('').empty(''),

		FRONTEND_URL: Joi.string().allow('').empty('').default('http://localhost:777'),
		IMAGE_URL: Joi.string().allow('').empty('').default('http://localhost:666/images'),

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
		SEED_DEFAULT_PASSWORD: Joi.string().allow('').empty('')
	})
	.unknown();

const { value: env, error } = envValidate.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
	throw new Error(`Config env error: ${error.message}`);
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
	JWT_ACCESS_TOKEN_EXPIRATION_MINUTES: number;
	REFRESH_TOKEN_EXPIRATION_DAYS: number;
	VERIFY_EMAIL_TOKEN_EXPIRATION_MINUTES: number;
	RESET_PASSWORD_TOKEN_EXPIRATION_MINUTES: number;
	SMTP_HOST: string;
	SMTP_PORT: number;
	SMTP_USERNAME: string;
	SMTP_PASSWORD: string;
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
	JWT_ACCESS_TOKEN_EXPIRATION_MINUTES: env.JWT_ACCESS_TOKEN_EXPIRATION_MINUTES,

	REFRESH_TOKEN_EXPIRATION_DAYS: env.REFRESH_TOKEN_EXPIRATION_DAYS,
	VERIFY_EMAIL_TOKEN_EXPIRATION_MINUTES: env.VERIFY_EMAIL_TOKEN_EXPIRATION_MINUTES,
	RESET_PASSWORD_TOKEN_EXPIRATION_MINUTES: env.RESET_PASSWORD_TOKEN_EXPIRATION_MINUTES,

	SMTP_HOST: env.SMTP_HOST,
	SMTP_PORT: env.SMTP_PORT,
	SMTP_USERNAME: env.SMTP_USERNAME,
	SMTP_PASSWORD: env.SMTP_PASSWORD,
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
	}
};

export default config;

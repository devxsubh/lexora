import type { Express } from 'express';
import type Mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';

let app: Express;
let mongoose: typeof Mongoose;
let mongod: MongoMemoryServer;

const hasRequiredEnv = process.env.JWT_ACCESS_TOKEN_SECRET_PRIVATE && process.env.JWT_ACCESS_TOKEN_SECRET_PUBLIC;

beforeAll(async () => {
	if (!hasRequiredEnv) return;
	mongod = await MongoMemoryServer.create();
	process.env.DATABASE_URI = mongod.getUri();
	mongoose = (await import('mongoose')).default;
	if (mongoose.connection.readyState !== 0) {
		await mongoose.disconnect();
	}
	await mongoose.connect(process.env.DATABASE_URI);
	const initialData = (await import('~/config/initialData')).default;
	await initialData();
	app = (await import('~/app')).default;
}, 30000);

afterAll(async () => {
	if (!hasRequiredEnv) return;
	if (mongoose?.connection?.readyState === 1) {
		await mongoose.disconnect();
	}
	if (mongod) {
		await mongod.stop();
	}
});

const describeAuth = hasRequiredEnv ? describe : describe.skip;
describeAuth('Auth API', () => {
	const signupPayload = {
		name: 'Test User',
		email: 'testuser@example.com',
		password: 'password123'
	};

	it('POST /api/v1/auth/signup creates user and returns tokens', async () => {
		const res = await request(app).post('/api/v1/auth/signup').send(signupPayload).expect(200);
		expect(res.body.success).toBe(true);
		expect(res.body.data.user).toBeDefined();
		expect(res.body.data.user.name).toBe(signupPayload.name);
		expect(res.body.data.tokens).toBeDefined();
		expect(res.body.data.tokens.accessToken?.token).toBeDefined();
		expect(res.body.data.tokens.refreshToken?.token).toBeDefined();
	});

	it('POST /api/v1/auth/signin returns tokens for valid credentials', async () => {
		const res = await request(app)
			.post('/api/v1/auth/signin')
			.send({ email: signupPayload.email, password: signupPayload.password })
			.expect(200);
		expect(res.body.success).toBe(true);
		expect(res.body.data.tokens.accessToken?.token).toBeDefined();
	});

	it('POST /api/v1/auth/signin returns 400 for invalid password', async () => {
		await request(app).post('/api/v1/auth/signin').send({ email: signupPayload.email, password: 'wrongpassword' }).expect(400);
	});

	it('GET /api/v1/auth/me returns 401 without token', async () => {
		await request(app).get('/api/v1/auth/me').expect(401);
	});

	it('GET /api/v1/auth/me returns user with valid token', async () => {
		const signinRes = await request(app)
			.post('/api/v1/auth/signin')
			.send({ email: signupPayload.email, password: signupPayload.password });
		const token = signinRes.body.data.tokens.accessToken.token;
		const res = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${token}`).expect(200);
		expect(res.body.success).toBe(true);
		expect(res.body.data.name).toBe(signupPayload.name);
	});

	it('POST /api/v1/auth/refresh-tokens returns new tokens with valid refresh token', async () => {
		const signinRes = await request(app)
			.post('/api/v1/auth/signin')
			.send({ email: signupPayload.email, password: signupPayload.password });
		const refreshToken = signinRes.body.data.tokens.refreshToken.token;
		const res = await request(app).post('/api/v1/auth/refresh-tokens').send({ refreshToken }).expect(200);
		expect(res.body.success).toBe(true);
		expect(res.body.data.tokens.accessToken?.token).toBeDefined();
		expect(res.body.data.tokens.refreshToken?.token).toBeDefined();
	});

	it('POST /api/v1/auth/signout revokes refresh token', async () => {
		const signinRes = await request(app)
			.post('/api/v1/auth/signin')
			.send({ email: signupPayload.email, password: signupPayload.password });
		const refreshToken = signinRes.body.data.tokens.refreshToken.token;
		await request(app).post('/api/v1/auth/signout').send({ refreshToken }).expect(200);
		// Using same refresh token again should fail (401)
		await request(app).post('/api/v1/auth/refresh-tokens').send({ refreshToken }).expect(401);
	});

	it('POST /api/v1/auth/refresh-tokens rejects reuse of rotated refresh token and revokes the family', async () => {
		const signinRes = await request(app)
			.post('/api/v1/auth/signin')
			.send({ email: signupPayload.email, password: signupPayload.password });
		const refreshToken1 = signinRes.body.data.tokens.refreshToken.token;
		const refreshRes = await request(app).post('/api/v1/auth/refresh-tokens').send({ refreshToken: refreshToken1 }).expect(200);
		const refreshToken2 = refreshRes.body.data.tokens.refreshToken.token;
		await request(app).post('/api/v1/auth/refresh-tokens').send({ refreshToken: refreshToken1 }).expect(401);
		await request(app).post('/api/v1/auth/refresh-tokens').send({ refreshToken: refreshToken2 }).expect(401);
	});
});

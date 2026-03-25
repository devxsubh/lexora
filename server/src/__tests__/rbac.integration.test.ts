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

const describeRbac = hasRequiredEnv ? describe : describe.skip;
describeRbac('RBAC', () => {
	it('GET /api/v1/users returns 403 for user without user:read', async () => {
		// Create a user with signup (gets "User" role with no permissions), then try to list users
		const signupRes = await request(app)
			.post('/api/v1/auth/signup')
			.send({ name: 'RBAC User', email: 'rbacuser@example.com', password: 'password123' });
		if (signupRes.status !== 200) {
			throw new Error(`Signup failed: ${signupRes.status} ${JSON.stringify(signupRes.body)}`);
		}
		const token = signupRes.body.data.tokens.accessToken.token;
		await request(app).get('/api/v1/users').set('Authorization', `Bearer ${token}`).expect(403);
	});

	it('GET /api/v1/users returns 200 for user with user:read', async () => {
		// Super Administrator has all permissions including user:read
		const signinRes = await request(app)
			.post('/api/v1/auth/signin')
			.send({ email: 'admjnwapviip@gmail.com', password: 'superadmin' });
		if (signinRes.status !== 200) return;
		const token = signinRes.body.data.tokens.accessToken.token;
		const res = await request(app).get('/api/v1/users').set('Authorization', `Bearer ${token}`).expect(200);
		expect(res.body.success).toBe(true);
		expect(Array.isArray(res.body.data)).toBe(true);
	});
});

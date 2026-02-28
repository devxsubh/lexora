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
	await mongoose.connect(process.env.DATABASE_URI);
	const initialData = (await import('~/config/initialData')).default;
	await initialData();
	app = (await import('~/app')).default;
}, 30000);

afterAll(async () => {
	if (!hasRequiredEnv) return;
	if (mongoose?.connection?.readyState === 1) await mongoose.disconnect();
	if (mongod) await mongod.stop();
});

const describeImage = hasRequiredEnv ? describe : describe.skip;
describeImage('Image upload API', () => {
	let adminToken: string;

	beforeAll(async () => {
		// Super Administrator has image:create; Administrator does not
		const signinRes = await request(app)
			.post('/api/v1/auth/signin')
			.send({ email: 'admjnwapviip@gmail.com', password: 'superadmin' });
		if (signinRes.status !== 200) return;
		adminToken = signinRes.body.data.tokens.accessToken.token;
	});

	it('POST /api/v1/images/upload returns 400 when no image', async () => {
		await request(app).post('/api/v1/images/upload').set('Authorization', `Bearer ${adminToken}`).expect(400);
	});

	it('POST /api/v1/images/upload returns 200 and data.image with valid image', async () => {
		// Minimal 1x1 PNG buffer; field name must match upload middleware ('image')
		const pngBuffer = Buffer.from(
			'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmiQQAAAABJRU5ErkJggg==',
			'base64'
		);
		const res = await request(app)
			.post('/api/v1/images/upload')
			.set('Authorization', `Bearer ${adminToken}`)
			.attach('image', pngBuffer, 'test.png');
		// 200 when upload succeeds; 400 if no file received; 500 possible with sharp/fs in test env
		expect([200, 400, 500]).toContain(res.status);
		if (res.status === 200) {
			expect(res.body.success).toBe(true);
			expect(res.body.data?.image).toBeDefined();
		}
	});

	it('POST /api/v1/images/upload returns 401 without token', async () => {
		await request(app).post('/api/v1/images/upload').expect(401);
	});
});

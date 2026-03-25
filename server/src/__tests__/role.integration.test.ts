import type { Express } from 'express';
import type Mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';

let app: Express;
let mongoose: typeof Mongoose;
let mongod: MongoMemoryServer;
let adminToken: string;

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
	const signinRes = await request(app)
		.post('/api/v1/auth/signin')
		.send({ email: 'admjnwapviip@gmail.com', password: 'superadmin' })
		.expect(200);
	adminToken = signinRes.body.data.tokens.accessToken.token;
}, 30000);

afterAll(async () => {
	if (!hasRequiredEnv) return;
	if (mongoose?.connection?.readyState === 1) await mongoose.disconnect();
	if (mongod) await mongod.stop();
});

const describeRole = hasRequiredEnv ? describe : describe.skip;
describeRole('Role CRUD API', () => {
	let roleId: string;

	it('GET /api/v1/roles returns list', async () => {
		const res = await request(app).get('/api/v1/roles').set('Authorization', `Bearer ${adminToken}`).expect(200);
		expect(res.body.success).toBe(true);
		expect(Array.isArray(res.body.data)).toBe(true);
	});

	it('POST /api/v1/roles creates role', async () => {
		const res = await request(app)
			.post('/api/v1/roles')
			.set('Authorization', `Bearer ${adminToken}`)
			.send({
				name: 'Test Role',
				description: 'For integration tests'
			})
			.expect(200);
		expect(res.body.success).toBe(true);
		expect(res.body.data.name).toBe('Test Role');
		roleId = res.body.data.id ?? res.body.data._id;
	});

	it('GET /api/v1/roles/:roleId returns role', async () => {
		if (!roleId) return;
		const res = await request(app).get(`/api/v1/roles/${roleId}`).set('Authorization', `Bearer ${adminToken}`).expect(200);
		expect(res.body.success).toBe(true);
		expect(res.body.data.name).toBe('Test Role');
	});

	it('PUT /api/v1/roles/:roleId updates role', async () => {
		if (!roleId) return;
		const res = await request(app)
			.put(`/api/v1/roles/${roleId}`)
			.set('Authorization', `Bearer ${adminToken}`)
			.send({ description: 'Updated description' })
			.expect(200);
		expect(res.body.success).toBe(true);
		expect(res.body.data.description).toBe('Updated description');
	});

	it('DELETE /api/v1/roles/:roleId deletes role', async () => {
		if (!roleId) return;
		await request(app).delete(`/api/v1/roles/${roleId}`).set('Authorization', `Bearer ${adminToken}`).expect(200);
	});
});

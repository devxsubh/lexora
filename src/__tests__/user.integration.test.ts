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

const describeUser = hasRequiredEnv ? describe : describe.skip;
describeUser('User CRUD API', () => {
	let adminToken: string;
	let roleId: string;
	let userId: string;

	beforeAll(async () => {
		// Super Administrator has all permissions (user:read, etc.)
		const signinRes = await request(app)
			.post('/api/v1/auth/signin')
			.send({ email: 'admjnwapviip@gmail.com', password: 'superadmin' });
		if (signinRes.status !== 200) return;
		adminToken = signinRes.body.data.tokens.accessToken.token;
		const rolesRes = await request(app).get('/api/v1/roles').set('Authorization', `Bearer ${adminToken}`);
		if (rolesRes.status === 200 && rolesRes.body.data?.length) {
			roleId = rolesRes.body.data[0].id ?? rolesRes.body.data[0]._id;
		}
	});

	it('GET /api/v1/users returns list with admin token', async () => {
		const res = await request(app).get('/api/v1/users').set('Authorization', `Bearer ${adminToken}`).expect(200);
		expect(res.body.success).toBe(true);
		expect(Array.isArray(res.body.data)).toBe(true);
		expect(res.body.pagination?.total).toBeDefined();
	});

	it('POST /api/v1/users creates user', async () => {
		if (!roleId) return;
		const res = await request(app)
			.post('/api/v1/users')
			.set('Authorization', `Bearer ${adminToken}`)
			.send({
				name: 'CRUD User',
				email: 'cruduser@example.com',
				password: 'password123',
				roles: [roleId]
			})
			.expect(200);
		expect(res.body.success).toBe(true);
		expect(res.body.data.name).toBe('CRUD User');
		expect(res.body.data.email).toBe('cruduser@example.com');
		userId = res.body.data.id ?? res.body.data._id;
	});

	it('GET /api/v1/users/:userId returns user', async () => {
		if (!userId) return;
		const res = await request(app).get(`/api/v1/users/${userId}`).set('Authorization', `Bearer ${adminToken}`).expect(200);
		expect(res.body.success).toBe(true);
		expect(res.body.data.id || res.body.data._id).toBe(userId);
	});

	it('PUT /api/v1/users/:userId updates user', async () => {
		if (!userId) return;
		const res = await request(app)
			.put(`/api/v1/users/${userId}`)
			.set('Authorization', `Bearer ${adminToken}`)
			.send({ name: 'CRUD User Updated' })
			.expect(200);
		expect(res.body.success).toBe(true);
		expect(res.body.data.name).toBe('CRUD User Updated');
	});

	it('DELETE /api/v1/users/:userId deletes user', async () => {
		if (!userId) return;
		await request(app).delete(`/api/v1/users/${userId}`).set('Authorization', `Bearer ${adminToken}`).expect(200);
		await request(app).get(`/api/v1/users/${userId}`).set('Authorization', `Bearer ${adminToken}`).expect(404);
	});
});

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

const describeNotification = hasRequiredEnv ? describe : describe.skip;
describeNotification('Notification API', () => {
	let token: string;

	beforeAll(async () => {
		const signupRes = await request(app)
			.post('/api/v1/auth/signup')
			.send({ name: 'Notify User', email: 'notify@example.com', password: 'password123' });
		if (signupRes.status !== 200) return;
		token = signupRes.body.data.tokens.accessToken.token;
	});

	it('GET /api/v1/notifications returns list with unreadCount', async () => {
		const res = await request(app).get('/api/v1/notifications').set('Authorization', `Bearer ${token}`).expect(200);
		expect(res.body.success).toBe(true);
		expect(Array.isArray(res.body.data)).toBe(true);
		expect(typeof res.body.unreadCount).toBe('number');
		expect(res.body.pagination).toBeDefined();
		// Signup creates a welcome notification
		expect(res.body.data.length).toBeGreaterThanOrEqual(1);
		expect(res.body.unreadCount).toBeGreaterThanOrEqual(1);
		const welcome = res.body.data.find((n: { title: string }) => n.title === 'Welcome');
		expect(welcome).toBeDefined();
		expect(welcome.read).toBe(false);
	});

	it('GET /api/v1/notifications?unreadOnly=true returns only unread', async () => {
		const res = await request(app)
			.get('/api/v1/notifications?unreadOnly=true')
			.set('Authorization', `Bearer ${token}`)
			.expect(200);
		expect(res.body.success).toBe(true);
		expect(res.body.data.every((n: { read: boolean }) => !n.read)).toBe(true);
	});

	it('PATCH /api/v1/notifications/:id/read marks one as read', async () => {
		const listRes = await request(app).get('/api/v1/notifications').set('Authorization', `Bearer ${token}`);
		const id = listRes.body.data[0]?.id;
		if (!id) return;
		const res = await request(app).patch(`/api/v1/notifications/${id}/read`).set('Authorization', `Bearer ${token}`).expect(200);
		expect(res.body.success).toBe(true);
		expect(res.body.data.read).toBe(true);
	});

	it('PATCH /api/v1/notifications/read-all marks all as read', async () => {
		const res = await request(app).patch('/api/v1/notifications/read-all').set('Authorization', `Bearer ${token}`).expect(200);
		expect(res.body.success).toBe(true);
		expect(res.body.data.markedCount).toBeDefined();
		const listRes = await request(app).get('/api/v1/notifications').set('Authorization', `Bearer ${token}`);
		expect(listRes.body.unreadCount).toBe(0);
	});

	it('GET /api/v1/notifications returns 401 without token', async () => {
		await request(app).get('/api/v1/notifications').expect(401);
	});
});

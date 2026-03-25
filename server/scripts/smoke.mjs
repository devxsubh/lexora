/**
 * Smoke test: after build, start the server, GET /api/v1/health, exit 0 on success.
 * Usage: npm run build && node scripts/smoke.mjs
 * Requires: NODE_ENV (set in CI). Optional: .env or DATABASE_URI, JWT keys (fallbacks for CI).
 */
import path from 'path';
import http from 'http';
import crypto from 'crypto';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

config();

process.env.NODE_ENV = process.env.NODE_ENV || 'test';
if (!process.env.DATABASE_URI) {
	process.env.DATABASE_URI = 'mongodb://127.0.0.1:27017/lexora-smoke';
}
if (!process.env.JWT_ACCESS_TOKEN_SECRET_PRIVATE || !process.env.JWT_ACCESS_TOKEN_SECRET_PUBLIC) {
	const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
		modulusLength: 2048,
		privateKeyEncoding: { type: 'pkcs1', format: 'pem' },
		publicKeyEncoding: { type: 'spki', format: 'pem' }
	});
	process.env.JWT_ACCESS_TOKEN_SECRET_PRIVATE =
		process.env.JWT_ACCESS_TOKEN_SECRET_PRIVATE || Buffer.from(privateKey, 'utf8').toString('base64');
	process.env.JWT_ACCESS_TOKEN_SECRET_PUBLIC =
		process.env.JWT_ACCESS_TOKEN_SECRET_PUBLIC || Buffer.from(publicKey, 'utf8').toString('base64');
}

const PORT = Number(process.env.PORT) || 8080;
const DIST_INDEX = path.join(__dirname, '..', 'dist', 'index.js');

const child = spawn(process.execPath, [DIST_INDEX], {
	env: process.env,
	stdio: ['ignore', 'pipe', 'pipe']
});

let resolved = false;
function finish(code) {
	if (resolved) return;
	resolved = true;
	child.kill('SIGTERM');
	process.exit(code);
}

child.stderr.pipe(process.stderr);
child.stdout.pipe(process.stdout);

child.on('error', (err) => {
	console.error('Smoke: failed to start server', err);
	finish(1);
});

child.on('exit', (code) => {
	if (!resolved) finish(code !== 0 ? code : 1);
});

// Wait for server to listen then hit health
const timeout = setTimeout(() => {
	finish(1);
}, 15000);

function tryHealth() {
	const req = http.get(`http://127.0.0.1:${PORT}/api/v1/health`, (res) => {
		clearTimeout(timeout);
		finish(res.statusCode === 200 ? 0 : 1);
	});
	req.on('error', () => {
		setTimeout(tryHealth, 500);
	});
}

setTimeout(tryHealth, 3000);

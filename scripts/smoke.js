/**
 * Smoke test: after build, start the server, GET /api/v1/health, exit 0 on success.
 * Usage: npm run build && node scripts/smoke.js
 * Requires: DATABASE_URI, JWT keys in env (e.g. .env).
 */
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

require('dotenv').config();

const PORT = Number(process.env.PORT) || 666;
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

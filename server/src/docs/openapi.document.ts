import { openApiComponents } from '~/docs/openapi.components';
import { openApiPaths } from '~/docs/openapi.paths';

/**
 * Full OpenAPI 3 document for Swagger UI (`/api-docs`).
 * Server URL is `/api/v1` — all paths below are relative to that base.
 */
export function buildOpenApiDocument(): Record<string, unknown> {
	return {
		openapi: '3.0.3',
		info: {
			title: `${process.env.APP_NAME || 'Lexora'} API`,
			version: '1.0.0',
			description: [
				'REST API for Lexora (contracts, AI, signatures, dashboard, auth).',
				'',
				'**API versions:** `/api/v1` is frozen (non-breaking fixes only). New breaking changes ship under `/api/v2` (currently mirrors v1). Optional env `API_V1_DEPRECATION_LINK` / `API_V1_SUNSET` add `Deprecation`, `Link`, and `Sunset` headers on v1 responses.',
				'',
				'**Base URL:** `{server}/api/v1` (or `/api/v2`)',
				'',
				'**Authentication:** Most routes require a JWT access token (RS256). Send `Authorization: Bearer <accessToken>`. Obtain tokens via `/auth/signin`, `/auth/signup`, `/auth/refresh-tokens`, or Google OAuth callback redirect.',
				'',
				'**Authorization:** Admin-style routes use permission strings on the token (e.g. `user:read`, `role:create`). Missing permission returns 403.',
				'',
				'**Errors:** Failed requests return JSON `{ status, errors: [{ message, location?, locationType? }], requestId? }`. Validation errors may include multiple `errors` entries.',
				'',
				'**Success shape:** JSON endpoints return `{ success: true, data: ... }`. List endpoints may include extra metadata such as `pagination`.',
				'',
				'**AI:** Endpoints under `/ai/*` require `GEMINI_API_KEY` on the server or they will error at runtime.',
				'',
				'**Id format:** Path parameters shown as MongoDB ObjectIds are 24-character hex strings.'
			].join('\n')
		},
		servers: [
			{
				url: '/api/v1',
				description: 'Same-origin API v1 (recommended for Swagger Try it out)'
			},
			{
				url: '/api/v2',
				description: 'API v2 (mirror of v1 until breaking changes are introduced)'
			},
			{
				url: process.env.RENDER_EXTERNAL_URL ? `${process.env.RENDER_EXTERNAL_URL.replace(/\/$/, '')}/api/v1` : '/api/v1',
				description: 'Render external URL (if configured)'
			}
		],
		tags: [
			{ name: 'Health', description: 'Liveness and dependency checks' },
			{ name: 'Auth', description: 'Registration, login, tokens, password, Google OAuth' },
			{ name: 'Users', description: 'User CRUD (permission-gated)' },
			{ name: 'Roles', description: 'Roles and permissions (permission-gated)' },
			{ name: 'Images', description: 'Image upload (multipart)' },
			{ name: 'Notifications', description: 'In-app notifications for the current user' },
			{ name: 'Contracts', description: 'Contract CRUD, autosave, download, AI generation' },
			{ name: 'Templates', description: 'Template listing; create-from-template lives under Contracts' },
			{ name: 'Clauses', description: 'Reusable clause library' },
			{ name: 'AI', description: 'Gemini-powered chat, review, and editor tools' },
			{ name: 'Dashboard', description: 'Metrics, activity, and drill-downs' },
			{ name: 'Signatures', description: 'Signature requests and signing' }
		],
		paths: openApiPaths,
		components: openApiComponents
	};
}

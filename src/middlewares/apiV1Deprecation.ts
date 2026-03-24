import { Request, Response, NextFunction } from 'express';
import config from '~/config/config';

/**
 * Optional RFC 8594-style deprecation signals for frozen `/api/v1`.
 * Set API_V1_DEPRECATION_LINK and/or API_V1_SUNSET when steering clients to `/api/v2`.
 */
export function apiV1DeprecationHeaders(req: Request, res: Response, next: NextFunction): void {
	if (config.API_V1_SUNSET) {
		res.setHeader('Sunset', config.API_V1_SUNSET);
	}
	if (config.API_V1_DEPRECATION_LINK || config.API_V1_SUNSET) {
		res.setHeader('Deprecation', 'true');
	}
	if (config.API_V1_DEPRECATION_LINK) {
		const link = `<${config.API_V1_DEPRECATION_LINK}>; rel="deprecation"`;
		const existing = res.getHeader('Link');
		if (typeof existing === 'string') {
			res.setHeader('Link', `${existing}, ${link}`);
		} else if (Array.isArray(existing)) {
			res.setHeader('Link', [...existing, link]);
		} else {
			res.setHeader('Link', link);
		}
	}
	next();
}

export default apiV1DeprecationHeaders;

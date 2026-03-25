import * as Sentry from '@sentry/node';
import config from '~/config/config';

if (config.SENTRY_DSN && config.NODE_ENV !== 'test') {
	Sentry.init({
		dsn: config.SENTRY_DSN,
		environment: config.NODE_ENV,
		tracesSampleRate: 0
	});
}

export { Sentry };

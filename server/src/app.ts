import '~/config/sentryInit';
import express, { Router } from 'express';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import passport from '~/config/passport';
import v1Routes from '~/routes/v1';
import v2Routes from '~/routes/v2';
import error from '~/middlewares/error';
import rateLimiter from '~/middlewares/rateLimiter';
import requestId from '~/middlewares/requestId';
import apiV1DeprecationHeaders from '~/middlewares/apiV1Deprecation';
import { isMetricsEnabled, metricsMiddleware, metricsHandler } from '~/middlewares/metrics';
import config from '~/config/config';
import morgan from '~/config/morgan';
import swaggerSpec from '~/config/swagger';

const app = express();

if (config.NODE_ENV !== 'test') {
	app.use(morgan);
}

app.use(requestId);
if (isMetricsEnabled()) {
	app.use(metricsMiddleware);
}
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
const corsOrigin =
	config.CORS_ORIGIN === '*' || !config.CORS_ORIGIN
		? '*'
		: config.CORS_ORIGIN.split(',')
				.map((s) => s.trim())
				.filter(Boolean);
app.use(
	cors({
		origin: corsOrigin === '*' ? '*' : corsOrigin,
		optionsSuccessStatus: 200
	})
);
app.get('/metrics', (req, res, next) => {
	if (!isMetricsEnabled()) {
		next();
		return;
	}
	metricsHandler(req, res).catch(next);
});
app.use(rateLimiter);
app.use(passport.initialize());
app.use(express.static('public'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const v1Router = Router();
v1Router.use(apiV1DeprecationHeaders);
v1Router.use(v1Routes);
app.use('/api/v1', v1Router);
app.use('/api/v2', v2Routes);
app.use(error.converter);
app.use(error.notFound);
app.use(error.handler);

export default app;

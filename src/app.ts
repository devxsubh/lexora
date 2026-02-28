import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import mongoose from 'mongoose';
import passport from '~/config/passport';
import routes from '~/routes/v1';
import error from '~/middlewares/error';
import rateLimiter from '~/middlewares/rateLimiter';
import requestId from '~/middlewares/requestId';
import config from '~/config/config';
import morgan from '~/config/morgan';

const app = express();

// On Vercel, wait for MongoDB before handling the first request (connect() runs async in index.ts)
if (process.env.VERCEL) {
	app.use((_req, _res, next) => {
		if (mongoose.connection.readyState === 1) return next();
		mongoose.connection.once('connected', () => next());
	});
}

if (config.NODE_ENV !== 'test') {
	app.use(morgan);
}

app.use(requestId);
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
app.use(rateLimiter);
app.use(passport.initialize());
app.use(express.static('public'));
app.use('/api/v1', routes);
app.use(error.converter);
app.use(error.notFound);
app.use(error.handler);

export default app;

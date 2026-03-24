import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import config from './config';
import { resolveAccessTokenPublicKey } from '~/config/jwtPublicKeys';
import User from '~/models/userModel';

interface JwtPayload {
	sub: string;
}

passport.use(
	new JwtStrategy(
		{
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKeyProvider: (_req, rawJwtToken, done) => {
				try {
					const decoded = jwt.decode(rawJwtToken, { complete: true });
					const kid =
						decoded && typeof decoded === 'object' && decoded.header && typeof decoded.header === 'object'
							? (decoded.header as { kid?: string }).kid
							: undefined;
					const publicKey = resolveAccessTokenPublicKey(kid);
					done(null, publicKey);
				} catch (err) {
					done(err as Error);
				}
			},
			algorithms: ['RS256']
		},
		async (jwtPayload: JwtPayload, done: (err: Error | null, user?: unknown) => void) => {
			try {
				const user = await User.getUserById(jwtPayload.sub);
				if (!user) {
					return done(null, false);
				}
				// Attach normalized id, email, and roles (needed for RBAC in authenticate middleware)
				const u = user as unknown as {
					_id: import('mongoose').Types.ObjectId;
					email?: string;
					roles?: unknown[];
					[k: string]: unknown;
				};
				return done(null, { ...u, id: u._id.toString(), email: u.email, roles: u.roles ?? [] });
			} catch (err) {
				return done(err as Error, false);
			}
		}
	)
);

if (config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET) {
	passport.use(
		new GoogleStrategy(
			{
				clientID: config.GOOGLE_CLIENT_ID,
				clientSecret: config.GOOGLE_CLIENT_SECRET,
				callbackURL: '/api/v1/auth/google/callback',
				scope: ['profile', 'email'],
				passReqToCallback: true
			},
			// Passport Google OAuth20 VerifyCallback type is incompatible with our user shape
			((
				_req: import('express').Request,
				_at: string,
				_rt: string,
				_params: unknown,
				profile: import('passport-google-oauth20').Profile,
				done: (err: Error | null, user?: unknown) => void
			) => {
				User.findOrCreateFromGoogle(profile)
					.then((user) => {
						const u = user as unknown as { _id: import('mongoose').Types.ObjectId; email?: string; [k: string]: unknown };
						done(null, { ...u, id: u._id.toString(), email: u.email });
					})
					.catch((err) => done(err as Error, false));
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
			}) as any
		)
	);
}

export default passport;

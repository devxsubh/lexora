import { Router, Request, Response } from 'express';
import passport from 'passport';
import catchAsync from '~/utils/catchAsync';
import validate from '~/middlewares/validate';
import authenticate from '~/middlewares/authenticate';
import authRateLimiter from '~/middlewares/authRateLimiter';
import authValidation from '~/validations/authValidation';
import authController from '~/controllers/authController';
import config from '~/config/config';

const router = Router();

router.use(authRateLimiter);

router.get(
	'/google',
	(req: Request, res: Response, next: () => void) => {
		if (!config.GOOGLE_CLIENT_ID || !config.GOOGLE_CLIENT_SECRET) {
			res.status(501).json({ success: false, message: 'Google sign-in is not configured' });
			return;
		}
		next();
	},
	passport.authenticate('google', { scope: ['profile', 'email'] })
);
router.get('/google/callback', passport.authenticate('google', { session: false }), catchAsync(authController.googleCallback));

router.post('/signup', validate(authValidation.signup), catchAsync(authController.signup));
router.post('/signin', validate(authValidation.signin), catchAsync(authController.signin));
router.get('/current', authenticate(), catchAsync(authController.current));
router.get('/me', authenticate(), catchAsync(authController.getMe));
router.put('/me', authenticate(), validate(authValidation.updateMe), catchAsync(authController.updateMe));
router.post('/signout', validate(authValidation.signout), catchAsync(authController.signout));
router.post('/refresh-tokens', validate(authValidation.refreshTokens), catchAsync(authController.refreshTokens));
router.post('/send-verification-email', authenticate(), catchAsync(authController.sendVerificationEmail));
router.post('/verify-email', validate(authValidation.verifyEmail), catchAsync(authController.verifyEmail));
router.post('/forgot-password', validate(authValidation.forgotPassword), catchAsync(authController.forgotPassword));
router.post('/reset-password', validate(authValidation.resetPassword), catchAsync(authController.resetPassword));

export default router;

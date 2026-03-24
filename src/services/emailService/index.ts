import { Resend } from 'resend';
import logger from '~/config/logger';
import template from './template';
import config from '~/config/config';

export const isEmailConfigured = Boolean(config.RESEND_API_KEY && config.EMAIL_FROM);
const resend = isEmailConfigured ? new Resend(config.RESEND_API_KEY) : null;

if (config.NODE_ENV !== 'test') {
	if (isEmailConfigured) {
		logger.info('Resend email provider configured');
	} else {
		logger.info('Resend is not fully configured, email sending is disabled');
	}
}

export const sendEmail = async (to: string, subject: string, html: string): Promise<void> => {
	if (!isEmailConfigured || !resend) {
		logger.warn(`Email skipped because Resend is not configured. Subject: ${subject}`);
		return;
	}
	await resend.emails.send({
		from: `${config.APP_NAME} <${config.EMAIL_FROM}>`,
		to: [to],
		subject,
		html
	});
};

export const sendResetPasswordEmail = async (to: string, token: string): Promise<void> => {
	const subject = 'Reset password';
	const resetPasswordUrl = `${config.FRONTEND_URL}/reset-password?token=${token}`;
	const html = template.resetPassword(resetPasswordUrl, config.APP_NAME);
	await sendEmail(to, subject, html);
};

export const sendVerificationEmail = async (to: string, token: string): Promise<void> => {
	const subject = 'Email Verification';
	const verificationEmailUrl = `${config.FRONTEND_URL}/verify-email?token=${token}`;
	const html = template.verifyEmail(verificationEmailUrl, config.APP_NAME);
	await sendEmail(to, subject, html);
};

export async function verifyEmailConnection(): Promise<void> {
	if (!isEmailConfigured) {
		return;
	}
}

export default { sendEmail, sendResetPasswordEmail, sendVerificationEmail, isEmailConfigured, verifyEmailConnection };

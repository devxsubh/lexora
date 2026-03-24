import nodemailer from 'nodemailer';
import logger from '~/config/logger';
import template from './template';
import config from '~/config/config';

export const isSmtpConfigured = Boolean(config.SMTP_HOST && config.SMTP_PORT && config.SMTP_USERNAME && config.SMTP_PASSWORD);

export const transport = nodemailer.createTransport({
	host: config.SMTP_HOST,
	port: config.SMTP_PORT,
	secure: Number(config.SMTP_PORT) === 465,
	auth: {
		user: config.SMTP_USERNAME,
		pass: config.SMTP_PASSWORD
	}
});

if (config.NODE_ENV !== 'test') {
	if (isSmtpConfigured) {
		transport
			.verify()
			.then(() => logger.info('Connected to email server'))
			.catch(() => logger.warn('Unable to connect to email server'));
	} else {
		logger.info('SMTP is not fully configured, email sending is disabled');
	}
}

export const sendEmail = async (to: string, subject: string, html: string): Promise<void> => {
	if (!isSmtpConfigured) {
		logger.warn(`Email skipped because SMTP is not configured. Subject: ${subject}`);
		return;
	}
	const msg = {
		from: `${config.APP_NAME} <${config.EMAIL_FROM}>`,
		to,
		subject,
		html
	};
	await transport.sendMail(msg);
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

export async function verifySmtpConnection(): Promise<void> {
	if (!isSmtpConfigured) {
		return;
	}
	await transport.verify();
}

export default { sendEmail, sendResetPasswordEmail, sendVerificationEmail, isSmtpConfigured, verifySmtpConnection };

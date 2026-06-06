import nodemailer from 'nodemailer';
import { config } from './index';
import { logger } from './logger';

const createTransporter = () => {
  if (config.SMTP_HOST) {
    return nodemailer.createTransport({
      host: config.SMTP_HOST,
      port: config.SMTP_PORT || 587,
      secure: config.SMTP_PORT === 465,
      auth: { user: config.SMTP_USER, pass: config.SMTP_PASS },
    });
  }
  // Ethereal for development fallback
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: { user: 'ethereal_user', pass: 'ethereal_pass' },
  });
};

const transporter = createTransporter();

export const emailService = {
  async sendVerificationEmail(to: string, name: string, token: string) {
    const url = `${config.CLIENT_URL}/verify-email?token=${token}`;
    try {
      await transporter.sendMail({
        from: `"${config.EMAIL_FROM_NAME}" <${config.EMAIL_FROM}>`,
        to,
        subject: 'Verify your LifeOS account',
        html: `<h2>Welcome, ${name}!</h2><p>Click <a href="${url}">here</a> to verify your email.</p><p>Link expires in 24 hours.</p>`,
      });
    } catch (err) {
      logger.error('Failed to send verification email:', err);
    }
  },

  async sendPasswordResetEmail(to: string, name: string, token: string) {
    const url = `${config.CLIENT_URL}/reset-password?token=${token}`;
    try {
      await transporter.sendMail({
        from: `"${config.EMAIL_FROM_NAME}" <${config.EMAIL_FROM}>`,
        to,
        subject: 'Reset your LifeOS password',
        html: `<h2>Password Reset</h2><p>Hi ${name}, click <a href="${url}">here</a> to reset your password.</p><p>Link expires in 1 hour.</p>`,
      });
    } catch (err) {
      logger.error('Failed to send password reset email:', err);
    }
  },
};

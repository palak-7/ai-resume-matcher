import nodemailer from "nodemailer";
import logger from "./logger";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
  family: 4,
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 15000,
} as any);

const FROM_EMAIL = process.env.EMAIL_USER!;

export const sendVerificationEmail = async (
  email: string,
  name: string,
  token: string,
): Promise<void> => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  console.log("EMAIL_USER:", process.env.EMAIL_USER);
  console.log("EMAIL_APP_PASSWORD exists:", !!process.env.EMAIL_APP_PASSWORD);
  try {
    await transporter.sendMail({
      from: `"AI Resume Matcher" <${FROM_EMAIL}>`,
      to: email,
      subject: "Verify your email — AI Resume Matcher",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
          </head>
          <body style="font-family: Arial, sans-serif; background: #f9fafb; margin: 0; padding: 40px 20px;">
            <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; border: 1px solid #e5e7eb;">
              <h1 style="font-size: 24px; font-weight: 700; color: #111827; margin: 0 0 8px;">
                Verify your email
              </h1>
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px;">
                Hi ${name}, thanks for signing up! Please verify your email to get started.
              </p>
              <a href="${verifyUrl}"
                style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                Verify Email
              </a>
              <p style="color: #9ca3af; font-size: 12px; margin: 24px 0 0;">
                This link expires in 24 hours. If you didn't sign up, ignore this email.
              </p>
            </div>
          </body>
        </html>
      `,
    });
    logger.info(`Verification email sent to: ${email}`);
  } catch (error) {
    logger.error(`Failed to send verification email to ${email}:`, error);
    throw error;
  }
};

export const sendPasswordResetEmail = async (
  email: string,
  name: string,
  token: string,
): Promise<void> => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  try {
    await transporter.sendMail({
      from: `"AI Resume Matcher" <${FROM_EMAIL}>`,
      to: email,
      subject: "Reset your password — AI Resume Matcher",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
          </head>
          <body style="font-family: Arial, sans-serif; background: #f9fafb; margin: 0; padding: 40px 20px;">
            <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; border: 1px solid #e5e7eb;">
              <h1 style="font-size: 24px; font-weight: 700; color: #111827; margin: 0 0 8px;">
                Reset your password
              </h1>
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px;">
                Hi ${name}, we received a request to reset your password.
              </p>
              <a href="${resetUrl}"
                style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                Reset Password
              </a>
              <p style="color: #9ca3af; font-size: 12px; margin: 24px 0 0;">
                This link expires in 15 minutes. If you didn't request this, ignore this email.
              </p>
            </div>
          </body>
        </html>
      `,
    });
    logger.info(`Password reset email sent to: ${email}`);
  } catch (error) {
    logger.error(`Failed to send password reset email to ${email}:`, error);
    throw error;
  }
};

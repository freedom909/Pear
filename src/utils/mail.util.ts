import nodemailer from 'nodemailer';
import { LoggerConfig } from '../config/logger.config.js';

export class MailUtil {
  private static transporter: nodemailer.Transporter;

  /**
   * Initialize mail transporter
   */
  static async init(): Promise<void> {
    try {
      // TODO: Replace these with actual environment variables
      const host = process.env.SMTP_HOST || 'smtp.gmail.com';
      const port = parseInt(process.env.SMTP_PORT || '587', 10);
      const user = process.env.SMTP_USER;
      const pass = process.env.SMTP_PASS;

      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass,
        },
      });

      // Verify connection configuration
      await this.transporter.verify();
      LoggerConfig.info('Mail server connection established');
    } catch (error) {
      LoggerConfig.error('Failed to initialize mail transporter', { error });
      throw error;
    }
  }

  /**
   * Send verification email
   */
  static async sendVerificationEmail(
    to: string,
    token: string,
    username?: string
  ): Promise<void> {
    try {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;
      
      const mailOptions = {
        from: `"Pear App" <${process.env.SMTP_USER}>`,
        to,
        subject: 'Verify Your Email Address',
        html: `
          <h1>Email Verification</h1>
          <p>Hello ${username || 'there'},</p>
          <p>Please click the button below to verify your email address:</p>
          <p>
            <a href="${verificationUrl}" style="
              display: inline-block;
              padding: 10px 20px;
              background-color: #4CAF50;
              color: white;
              text-decoration: none;
              border-radius: 5px;
            ">
              Verify Email
            </a>
          </p>
          <p>Or copy and paste this link into your browser:</p>
          <p>${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <p>If you did not request this verification, please ignore this email.</p>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      LoggerConfig.info('Verification email sent', { to });
    } catch (error) {
      LoggerConfig.error('Failed to send verification email', { error, to });
      throw error;
    }
  }
}
import nodemailer from 'nodemailer';
import { ApiError } from './api-error.util';

/**
 * Email configuration interface
 */
interface EmailConfig {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

/**
 * Email templates
 */
export class EmailTemplates {
  /**
   * Generate email verification template
   * @param name User's name
   * @param verificationUrl Verification URL
   */
  static verificationEmail(name: string, verificationUrl: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Verify Your Email</h2>
        <p>Hello ${name || 'there'},</p>
        <p>Thank you for registering! Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            Verify Email
          </a>
        </div>
        <p>If the button doesn't work, you can also click this link:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
      </div>
    `;
  }

  /**
   * Generate password reset template
   * @param name User's name
   * @param resetUrl Reset URL
   */
  static passwordResetEmail(name: string, resetUrl: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Reset Your Password</h2>
        <p>Hello ${name || 'there'},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            Reset Password
          </a>
        </div>
        <p>If the button doesn't work, you can also click this link:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
      </div>
    `;
  }

  /**
   * Generate welcome email template
   * @param name User's name
   */
  static welcomeEmail(name: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Our Platform!</h2>
        <p>Hello ${name || 'there'},</p>
        <p>Thank you for joining our platform. We're excited to have you on board!</p>
        <p>Here are some things you can do to get started:</p>
        <ul>
          <li>Complete your profile</li>
          <li>Explore our features</li>
          <li>Connect with others</li>
        </ul>
        <p>If you have any questions, feel free to reach out to our support team.</p>
      </div>
    `;
  }
}

/**
 * Email Service
 * Handles email sending using nodemailer
 */
export class EmailService {
  private static transporter: nodemailer.Transporter;

  /**
   * Initialize email transporter
   */
  static async init() {
    try {
      // Create transporter
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      // Verify connection
      await this.transporter.verify();
      console.log('Email service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize email service:', error);
      throw new ApiError(500, 'Email service initialization failed');
    }
  }

  /**
   * Send email
   * @param config Email configuration
   */
  static async sendEmail(config: EmailConfig): Promise<void> {
    try {
      if (!this.transporter) {
        await this.init();
      }

      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@example.com',
        to: config.to,
        subject: config.subject,
        text: config.text,
        html: config.html,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new ApiError(500, 'Failed to send email');
    }
  }

  /**
   * Send verification email
   * @param email User's email
   * @param name User's name
   * @param token Verification token
   */
  static async sendVerificationEmail(email: string, name: string, token: string): Promise<void> {
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;
    await this.sendEmail({
      to: email,
      subject: 'Verify Your Email',
      html: EmailTemplates.verificationEmail(name, verificationUrl),
    });
  }

  /**
   * Send password reset email
   * @param email User's email
   * @param name User's name
   * @param token Reset token
   */
  static async sendPasswordResetEmail(email: string, name: string, token: string): Promise<void> {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
    await this.sendEmail({
      to: email,
      subject: 'Reset Your Password',
      html: EmailTemplates.passwordResetEmail(name, resetUrl),
    });
  }

  /**
   * Send welcome email
   * @param email User's email
   * @param name User's name
   */
  static async sendWelcomeEmail(email: string, name: string): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: 'Welcome to Our Platform',
      html: EmailTemplates.welcomeEmail(name),
    });
  }
}

// Export a simplified function for backward compatibility
export const sendEmail = EmailService.sendEmail.bind(EmailService);
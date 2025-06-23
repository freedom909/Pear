import nodemailer from 'nodemailer';
import config from '../config/config';
import logger from '../utils/logger';
import  User  from '../models/user/user.model';
import {  ErrorCode, } from '../utils/errors/error-code';
import {BadRequestError} from '../utils/errors';


/**
 * 邮件服务类
 */
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // 创建邮件传输器
    this.transporter = nodemailer.createTransport({
      host: config.email.host,// 
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.user,
        pass: config.email.password,
      },
    });
  }


  async verifyEmail(token: string): Promise<void> {
    const user = await User.findOne({ emailVerificationToken: token, emailVerificationExpires: { $gt: Date.now() } });
    if (!user) throw new BadRequestError(ErrorCode.INVALID_TOKEN, 'Invalid or expired verification token');

    user.verified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
  }

  /**
   * 发送邮件
   * @param to 收件人
   * @param subject 主题
   * @param html 邮件内容(HTML)
   * @returns 发送结果
   */
  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"${config.email.senderName}" <${config.email.user}>`,
        to,
        subject,
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent: ${info.messageId}`);
      return true;
    } catch (error) {
      logger.error('Error sending email:', error);
      return false;
    }
  }

  /**
   * 发送验证邮件
   * @param to 收件人
   * @param name 用户名
   * @param token 验证令牌
   * @returns 发送结果
   */
  async sendVerificationEmail(to: string, name: string, token: string): Promise<boolean> {
    const verificationUrl = `${config.clientUrl}/verify-email?token=${token}`;
    const subject = '请验证您的电子邮箱';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">您好，${name}！</h2>
        <p>感谢您注册我们的服务。请点击下面的按钮验证您的电子邮箱：</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">验证邮箱</a>
        </div>
        <p>或者，您可以复制并粘贴以下链接到您的浏览器：</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>此链接将在24小时后过期。</p>
        <p>如果您没有注册我们的服务，请忽略此邮件。</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p style="color: #777; font-size: 12px;">此邮件由系统自动发送，请勿回复。</p>
      </div>
    `;

    return this.sendEmail(to, subject, html);
  }

  /**
   * 发送密码重置邮件
   * @param to 收件人
   * @param name 用户名
   * @param token 重置令牌
   * @returns 发送结果
   */
  async sendPasswordResetEmail(to: string, name: string, token: string): Promise<boolean> {
    const resetUrl = `${config.clientUrl}/reset-password?token=${token}`;
    const subject = '密码重置请求';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">您好，${name}！</h2>
        <p>我们收到了您的密码重置请求。请点击下面的按钮重置您的密码：</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #2196F3; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">重置密码</a>
        </div>
        <p>或者，您可以复制并粘贴以下链接到您的浏览器：</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>此链接将在1小时后过期。</p>
        <p>如果您没有请求重置密码，请忽略此邮件，您的账户将保持安全。</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p style="color: #777; font-size: 12px;">此邮件由系统自动发送，请勿回复。</p>
      </div>
    `;

    return this.sendEmail(to, subject, html);
  }

  /**
   * 发送欢迎邮件
   * @param to 收件人
   * @param name 用户名
   * @returns 发送结果
   */
  async sendWelcomeEmail(to: string, name: string): Promise<boolean> {
    const subject = '欢迎加入我们的平台';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">欢迎，${name}！</h2>
        <p>感谢您加入我们的平台。我们很高兴您成为我们社区的一员！</p>
        <p>您现在可以访问我们的所有功能和服务。</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${config.clientUrl}" style="background-color: #673AB7; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">访问平台</a>
        </div>
        <p>如果您有任何问题或需要帮助，请随时联系我们的支持团队。</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p style="color: #777; font-size: 12px;">此邮件由系统自动发送，请勿回复。</p>
      </div>
    `;

    return this.sendEmail(to, subject, html);
  }

  /**
   * 发送密码更改通知
   * @param to 收件人
   * @param name 用户名
   * @returns 发送结果
   */
  async sendPasswordChangeNotification(to: string, name: string): Promise<boolean> {
    const subject = '密码已更改';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">您好，${name}！</h2>
        <p>您的账户密码已成功更改。</p>
        <p>如果这不是您本人操作，请立即联系我们的支持团队。</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p style="color: #777; font-size: 12px;">此邮件由系统自动发送，请勿回复。</p>
      </div>
    `;

    return this.sendEmail(to, subject, html);
  }
}

// 导出单例
export const emailService = new EmailService();
import nodemailer from 'nodemailer';
import config from '../config/config';

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

/**
 * 邮件服务类
 * 用于发送电子邮件
 */
class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // 创建一个 SMTP 传输器
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure, // true for 465, false for other ports
      auth: {
        user: config.email.user,
        pass: config.email.password,
      },
    });
  }

  /**
   * 发送电子邮件
   * @param options 邮件选项
   * @returns 发送结果
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      // 发送邮件
      await this.transporter.sendMail({
        from: `"${config.email.senderName}" <${config.email.user}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
      return true;
    } catch (error) {
      console.error('发送邮件失败:', error);
      return false;
    }
  }

  /**
   * 发送密码重置邮件
   * @param email 用户邮箱
   * @param resetToken 重置令牌
   * @param resetUrl 重置链接
   * @returns 发送结果
   */
  async sendPasswordResetEmail(
    email: string,
    _resetToken: string,
    resetUrl: string
  ): Promise<boolean> {
    const subject = '密码重置请求';
    const text = `您收到此邮件是因为您（或其他人）请求重置密码。请点击以下链接或将其粘贴到浏览器中以完成密码重置过程：\n\n${resetUrl}\n\n如果您没有请求此操作，请忽略此邮件，您的密码将保持不变。此链接将在10分钟后过期。`;
    const html = `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #333; text-align: center;">密码重置</h2>
        <p>您好，</p>
        <p>您收到此邮件是因为您（或其他人）请求重置密码。</p>
        <p>请点击以下按钮完成密码重置过程：</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">重置密码</a>
        </div>
        <p>或者，您可以将以下链接粘贴到浏览器中：</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>如果您没有请求此操作，请忽略此邮件，您的密码将保持不变。</p>
        <p>此链接将在10分钟后过期。</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
        <p style="color: #777; font-size: 12px; text-align: center;">此邮件由系统自动发送，请勿回复。</p>
      </div>
    `;

    return this.sendEmail({ to: email, subject, text, html });
  }

  /**
   * 发送密码重置成功确认邮件
   * @param email 用户邮箱
   * @returns 发送结果
   */
  async sendPasswordResetConfirmationEmail(email: string): Promise<boolean> {
    const subject = '密码重置成功';
    const text = `您的密码已成功重置。如果您没有进行此操作，请立即联系我们的支持团队。`;
    const html = `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #333; text-align: center;">密码重置成功</h2>
        <p>您好，</p>
        <p>我们想通知您，您的密码已成功重置。</p>
        <p>如果您没有进行此操作，请立即联系我们的支持团队，因为您的账户可能已被盗用。</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
        <p style="color: #777; font-size: 12px; text-align: center;">此邮件由系统自动发送，请勿回复。</p>
      </div>
    `;

    return this.sendEmail({ to: email, subject, text, html });
  }
}
const emailService = new EmailService()
export default emailService ;

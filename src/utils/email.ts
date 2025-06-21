import nodemailer from 'nodemailer';
import { ErrorResponse } from './errorResponse';
import { logger } from '../logger/logger';
import path from 'path';
import fs from 'fs';
import handlebars from 'handlebars';

// 邮件配置接口
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// 邮件选项接口
interface EmailOptions {
  email: string;
  subject: string;
  message?: string;
  template?: string;
  context?: Record<string, any>;
}

// 邮件服务类
class EmailService {
  private transporter: nodemailer.Transporter;
  private from: string;

  constructor() {
    // 初始化邮件传输器
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    } as EmailConfig);

    this.from = `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`;
  }

  /**
   * 发送邮件
   * @param options 邮件选项
   */
  async sendEmail(options: EmailOptions) {
    try {
      let html: string | undefined;
      let text: string | undefined;

      // 如果有模板，使用模板渲染内容
      if (options.template) {
        const templatePath = path.join(
          __dirname,
          '../templates/emails',
          `${options.template}.hbs`
        );
        const templateSource = fs.readFileSync(templatePath, 'utf8');
        const template = handlebars.compile(templateSource);
        html = template(options.context || {});
        text = options.message;
      } else {
        text = options.message;
      }

      const mailOptions = {
        from: this.from,
        to: options.email,
        subject: options.subject,
        text,
        html
      };

      await this.transporter.sendMail(mailOptions);
      log.info(`邮件已发送至: ${options.email}`);
    } catch (error) {
      log.error('发送邮件失败:', error);
      throw new ErrorResponse('发送邮件失败', 500);
    }
  }

  /**
   * 发送密码重置邮件
   * @param email 收件人邮箱
   * @param resetUrl 重置密码URL
   */
  async sendPasswordReset(email: string, resetUrl: string) {
    await this.sendEmail({
      email,
      subject: '密码重置请求 (有效期10分钟)',
      template: 'passwordReset',
      context: {
        resetUrl,
        name: process.env.APP_NAME,
        supportEmail: process.env.SUPPORT_EMAIL
      }
    });
  }

  /**
   * 发送密码已重置确认邮件
   * @param email 收件人邮箱
   */
  async sendPasswordResetConfirmation(email: string) {
    await this.sendEmail({
      email,
      subject: '密码已重置',
      template: 'passwordResetConfirmation',
      context: {
        name: process.env.APP_NAME,
        supportEmail: process.env.SUPPORT_EMAIL
      }
    });
  }

  /**
   * 发送欢迎邮件
   * @param email 收件人邮箱
   * @param name 用户名
   */
  async sendWelcomeEmail(email: string, name: string) {
    await this.sendEmail({
      email,
      subject: `欢迎加入 ${process.env.APP_NAME}`,
      template: 'welcome',
      context: {
        name,
        appName: process.env.APP_NAME,
        supportEmail: process.env.SUPPORT_EMAIL
      }
    });
  }
}

// 创建单例实例
const emailService = new EmailService();

export default emailService;
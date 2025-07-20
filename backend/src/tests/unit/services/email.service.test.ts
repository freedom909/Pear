import  emailService  from '../../../services/email.service';
import nodemailer from 'nodemailer';
import { expect, describe, it, beforeEach, afterAll ,jest} from '@jest/globals';
jest.mock('nodemailer');

describe('Email Service', () => {
  const testEmail = {
    to: 'recipient@example.com',
    subject: 'Test Email',
    text: 'This is a test email'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.EMAIL_FROM = 'test@example.com';
  });

  it('should send email successfully', async () => {
    const mockSendMail = jest.fn().mockResolvedValueOnce(true as unknown as never);
    (nodemailer.createTransport as jest.Mock).mockReturnValueOnce({
      sendMail: mockSendMail
    });

    await emailService.sendEmail(testEmail);
    
    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    expect(mockSendMail).toHaveBeenCalledWith({
      from: process.env.EMAIL_FROM,
      ...testEmail
    });
  });

  it('should throw error when email fails to send', async () => {
    const mockSendMail = jest.fn().mockRejectedValueOnce(
      new Error('Email failed') as unknown as never
    );
    (nodemailer.createTransport as jest.Mock).mockReturnValueOnce({
      sendMail: mockSendMail
    });
    
    await expect(emailService.sendEmail(testEmail)).rejects.toThrow('Email failed');
  });

  it('should use default from address when not provided', async () => {
    const mockSendMail = jest.fn().mockResolvedValueOnce(true as unknown as never);
    (nodemailer.createTransport as jest.Mock).mockReturnValueOnce({
      sendMail: mockSendMail
    });

    const emailWithoutFrom = {
      to: 'recipient@example.com',
      subject: 'Test Email',
      text: 'This is a test email'
    };

    await emailService.sendEmail(emailWithoutFrom);// This expression is not callable.
    
    expect(mockSendMail).toHaveBeenCalledWith({
      from: process.env.EMAIL_FROM,
      ...emailWithoutFrom
    });
  });
});
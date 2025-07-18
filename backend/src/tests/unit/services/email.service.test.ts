import { sendEmail } from '../../../services/email.service';
import nodemailer from 'nodemailer';
import { expect, describe, it, beforeAll, afterAll } from '@jest/globals';
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
    const mockSendMail = jest.fn().mockResolvedValueOnce(true);
    (nodemailer.createTransport as jest.Mock).mockReturnValueOnce({
      sendMail: mockSendMail
    });

    await sendEmail(testEmail);
    
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
      new Error('Email failed')
    );
    (nodemailer.createTransport as jest.Mock).mockReturnValueOnce({
      sendMail: mockSendMail
    });
    
    await expect(sendEmail(testEmail)).rejects.toThrow('Email failed');
  });

  it('should use default from address when not provided', async () => {
    const mockSendMail = jest.fn().mockResolvedValueOnce(true);
    (nodemailer.createTransport as jest.Mock).mockReturnValueOnce({
      sendMail: mockSendMail
    });

    const emailWithoutFrom = {
      to: 'recipient@example.com',
      subject: 'Test Email',
      text: 'This is a test email'
    };

    await sendEmail(emailWithoutFrom);
    
    expect(mockSendMail).toHaveBeenCalledWith({
      from: process.env.EMAIL_FROM,
      ...emailWithoutFrom
    });
  });
});
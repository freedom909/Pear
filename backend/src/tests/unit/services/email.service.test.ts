import { describe, it, expect, jest } from '@jest/globals';
import * as emailService from '../../../services/email.service';
import nodemailer from 'nodemailer';

// 模拟 nodemailer
jest.mock('nodemailer');

const mockSendMail = jest.fn().mockResolvedValue({});
(nodemailer.createTransport as jest.Mock).mockReturnValue({
  sendMail: mockSendMail
});

describe('Email Service', () => {
  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      await emailService.sendEmail({
        to: 'test@example.com',
        subject: 'Test Email',
        text: 'This is a test email'
      });
      
      expect(mockSendMail).toHaveBeenCalled();
    });

    it('should throw error if email fails', async () => {
      mockSendMail.mockRejectedValue(new Error('Failed to send email'));
      
      await expect(emailService.sendEmail({
        to: 'test@example.com',
        subject: 'Test Email',
        text: 'This is a test email'
      })).rejects.toThrow('Failed to send email');
    });

    it('should validate email format', async () => {
      await expect(emailService.sendEmail({
        to: 'invalid-email',
        subject: 'Test Email',
        text: 'This is a test email'
      })).rejects.toThrow('Invalid email address');
    });
  });
});
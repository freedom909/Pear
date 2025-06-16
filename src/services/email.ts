
import nodemailerSendgrid from "nodemailer-sendgrid";
import nodemailer, { TransportOptions, SendMailOptions } from "nodemailer";
import { Options } from "nodemailer/lib/smtp-transport";
import User, { UserDocument, IUser } from "../models/User";
import crypto from 'crypto';
import dotenv from "dotenv";
import {Response, Request,NextFunction} from 'express'; 
import validator from "validator";
import mailChecker from 'mailchecker';
import { promisify } from "bluebird";
dotenv.config();

interface MailSettings {
  successfulType: string;
  failedType: string;
  successfulMessage: string;
  failedMessage: string;
  errorType: string;
  errorMessage: string;
  mailOptions: SendMailOptions;
  req: Request;
}

const sendMail = async (settings: MailSettings): Promise<boolean> => {
  const transportConfig: Options = process.env.SENDGRID_API_KEY
    ? nodemailerSendgrid({ apiKey: process.env.SENDGRID_API_KEY })
    : {
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      };

  const transporter = nodemailer.createTransport(transportConfig);

  try {
    await transporter.sendMail(settings.mailOptions);
    console.log('Email sent successfully');
    settings.req.flash(settings.successfulType, settings.successfulMessage);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    settings.req.flash(settings.failedType, settings.failedMessage);
    return false;
  }
};
export const sendForgotPasswordEmail = (user: UserDocument, req: Request) => {
  if (!user) {
    return Promise.resolve(false);
  }
  
  const token = crypto.randomBytes(16).toString('hex');
  user.passwordResetToken = token;
  user.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour
  
  const mailOptions = {
    to: user.email,
    from: process.env.SMTP_FROM || process.env.GMAIL_USER || '',
    subject: "Reset your password on Pear",
    text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
    Please click on the following link, or paste this into your browser to complete the process:\n\n
    http://${req.headers.host}/reset/${token}\n\n
    If you did not request this, please ignore this email and your password will remain unchanged.\n`
  };
  
  const mailSettings = {
    successfulType: "success",
    successfulMessage: "An email has been sent with password reset instructions",
    failedType: "error",
    failedMessage: "Error sending password reset email",
    errorType: "error",
    errorMessage: "Something went wrong",
    mailOptions,
    req,
  };
  
  return user.save()
    .then(() => sendMail(mailSettings))
    .catch(err => {
      console.error('Error saving user reset token:', err);
      return false;
    });
};


export default {sendMail,sendForgotPasswordEmail}
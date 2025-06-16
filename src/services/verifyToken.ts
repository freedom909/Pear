import nodemailerSendgrid from "nodemailer-sendgrid";
import nodemailer, { TransportOptions, SendMailOptions } from "nodemailer";
import User, { UserDocument, IUser } from "../models/User";
import crypto from 'crypto';
import dotenv from "dotenv";
import {Response, Request,NextFunction} from 'express'; 
import validator from "validator";
import mailChecker from 'mailchecker';
import { promisify } from "bluebird";
dotenv.config();

 const getVerifyEmail = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userReq = req.user as IUser & UserDocument ;//red line, UserDocument is not proper?
  if (userReq.isEmailVerified) {
    return res.status(200).json({
      success: true,
      message: "Verified email successfully",
      redirectTo: "/dashboard"
    });
  }
  const user = req.user as IUser & UserDocument;
  if (!mailChecker.isValid(user.email)) {
    req.flash(
      "errors",
      "The email address is invalid or disposable and can not be verified.  Please update your email address and try again."
    );
    return res.redirect("/dashboard");
  }
  const randomBytesAsync = promisify(crypto.randomBytes);
  const createRandomToken = randomBytesAsync(16).then((buf) =>
    buf.toString("hex")
  );
  const setRandomToken = (token: string) =>
    User.findOne({ email: req.body.email }).then((user) => {
      if (!user) {
        req.flash("errors", "Account with that email address does not exist.");
      } else {
        user.passwordResetToken = token;
        user.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour
        const savedUser = user
          .save()
          .then((savedUser) => {
            console.log("user saved successfully");
            return savedUser;
          })
          .catch((err: any) => {
            console.log("user save failed:", err);
            throw err;
          });
      }
    });
};

 const getVerifiedEmailToken = (req: Request, res: Response, next: NextFunction) => {
  const userReq = req.user as UserDocument;
  if (userReq.isEmailVerified) {
    req.flash('success', 'Verified email successfully');
    return res.redirect('/dashboard');
  }
  const validationErrors: { msg: string; }[] = []
  if (req.params.token && (!validator.isHexadecimal(req.params.token))) validationErrors.push({ msg: 'Invalid Token.  Please retry.' });
  if (validationErrors.length) {
    req.flash('errors', validationErrors.map(err => err.msg[0]));
    return res.redirect('/account');

  }
  let userParams = req.user as IUser & UserDocument;
  if (req.params.token === userParams?.emailVerificationToken) {
    User.findOne({ email: req.params.email })
      .then(user => {
        if (!user) {
          req.flash('errors', validationErrors.map(err => err.msg[0]));
          return res.redirect('/dashboard')
        }
        user.emailVerificationToken = '';
        user.isEmailVerified = true;
        user.save().then(() => {
          req.flash('success', "Verified email successfully");
          return res.redirect('/dashboard');
        }).catch((err: any) => {
          console.log('Error saving user after email verification', err);
          req.flash('errors', 'There was an error when updating your profile.');
          return res.redirect('/account');
        });
      }).catch((error: any) => {
        console.log('Error saving the user profile to the database after email verification', error);
        req.flash('errors', 'There was an error when updating your profile.  Please try again later.');
        return res.redirect('/account');
      });
  } else {
    req.flash('errors', 'The verification link was invalid, or is for a different account.');
    return res.redirect('/account');
  }
};
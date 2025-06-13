import async, { any } from "async";
import crypto from "crypto";
import nodemailer from "nodemailer";
import passport from "passport";
import  User,{ UserDocument, AuthToken } from "../models/User.js";
import { Request, Response, NextFunction } from "express";
import { IVerifyOptions } from "passport-local";
import { WriteError } from "mongodb";
import {
  ValidationError,
  body,
  check,
  validationResult,
} from "express-validator";
import "../config/passport.js";
import { CallbackError, SaveOptions } from "mongoose";
import NativeError from "mongoose";
import { Session } from "express-session";
import flash from "express-flash";

/**
 * Login page data.
 * @route GET /api/auth/login
 */
export const getLogin = (req: Request, res: Response): void => {
  if (req.user) {
    return res.status(200).json({
      isAuthenticated: true,
      redirectUrl: "/"
    });
  }
  res.status(200).json({
    title: "Login",
    isAuthenticated: false
  });
};
/**
 * Sign in using email and password.
 * @route POST /api/auth/login
 */
export const postLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  await check("email", "Email is not valid").isEmail().run(req);
  await check("password", "Password cannot be blank")
    .isLength({ min: 1 })
    .run(req);
  await body("email").normalizeEmail({ gmail_remove_dots: false }).run(req);

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array().map((error) => ({ msg: error.msg }))
    });
  }

  passport.authenticate(
    "local",
    (err: Error, user: UserDocument, info: IVerifyOptions) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({
          errors: [{ msg: info.message }]
        });
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        const session = req.session as Session & { returnTo?: string };
        res.status(200).json({
          success: true,
          message: "Success! You are logged in.",
          user: {
            id: user.id,
            email: user.email,
            profile: user.profile
          },
          redirectUrl: session.returnTo || "/"
        });
      });
    }
  )(req, res, next);
};
/**
 * Log out.
 * @route POST /api/auth/logout
 */
export async function logout(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "You are not authorized to access the app. Can't logout",
    });
  } else {
    req.logout((err: Error) => {
      if (err) {
        return next(err);
      }
      res.status(200).json({
        success: true,
        message: "You have been logged out successfully",
        redirectUrl: "/"
      });
    });
  }
}

/**
 * Signup page data.
 * @route GET /api/auth/signup
 */
export const getSignup = (req: Request, res: Response): void => {
  if (req.user) {
    return res.status(200).json({
      isAuthenticated: true,
      redirectUrl: "/"
    });
  }
  res.status(200).json({
    title: "Create Account",
    isAuthenticated: false
  });
};
/**
 * Create a new local account.
 * @route POST /api/auth/signup
 */
export const postSignup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  await check("email", "Email is not valid").isEmail().run(req);
  await check("password", "Password must be at least 4 characters long")
    .isLength({ min: 4 })
    .run(req);
  await check("confirmPassword", "Passwords do not match")
    .equals(req.body.password)
    .run(req);
  await body("email").normalizeEmail({ gmail_remove_dots: false }).run(req);

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array().map((error) => ({ msg: error.msg }))
    });
  }

  const user = new User({
    email: req.body.email,
    password: req.body.password,
  });

  User.findOne(
    { email: req.body.email },
    (err: NativeError, existingUser: UserDocument) => {
      if (err) {
        return next(err);
      }
      if (existingUser) {
        return res.status(409).json({
          errors: [{ msg: "Account with that email address already exists." }]
        });
      }
      user
        .save()
        .then(() => {
          req.logIn(user, (err) => {
            if (err) {
              return next(err);
            }
            res.status(201).json({
              success: true,
              message: "Success! You are logged in.",
              user: {
                id: user.id,
                email: user.email,
                profile: user.profile
              },
              redirectUrl: "/"
            });
          });
        })
        .catch((err: Error) => {
          next(err);
        });
    }
  );
};
/**
 * Profile page data.
 * @route GET /api/auth/account
 */
export const getAccount = (req: Request, res: Response): void => {
  res.status(200).json({
    title: "Account Management",
    user: req.user
  });
};
/**
 * Update profile information.
 * @route POST /api/auth/account/profile
 */
export const postUpdateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  await check("email", "Please enter a valid email address.")
    .isEmail()
    .run(req);
  await body("email").normalizeEmail({ gmail_remove_dots: false }).run(req);

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array().map((err: ValidationError) => ({ msg: err.msg }))
    });
  }

  const user = req.user as UserDocument;
  User.findById(user.id, (err: NativeError, user: UserDocument) => {
    if (err) {
      return next(err);
    }
    user.email = req.body.email || "";
    user.profile.name = req.body.name || "";
    user.profile.gender = req.body.gender || "";
    user.profile.location = req.body.location || "";
    user.profile.website = req.body.website || "";
    user
      .save()
      .then(() => {
        res.status(200).json({
          success: true,
          message: "Profile information has been updated successfully",
          user: {
            id: user.id,
            email: user.email,
            profile: user.profile
          }
        });
      })
      .catch((err) => {
        next(err);
      });
  });
};
/**
 * Update current password.
 * @route POST /api/auth/account/password
 */
export const postUpdatePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  await check("password", "Password must be at least 6 characters long")
    .isLength({ min: 6 })
    .run(req);
  await check("confirmPassword", "Passwords do not match")
    .equals(req.body.password)
    .run(req);

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((err: ValidationError) => ({ msg: err.msg }))
    });
  }

  const user = req.user as UserDocument;
  User.findById(user.id, (err: NativeError, user: UserDocument) => {
    if (err) {
      return next(err);
    }
    user.password = req.body.password;
    user
      .save()
      .then(() => {
        res.status(200).json({
          success: true,
          message: "Password has been changed successfully"
        });
      })
      .catch((err) => {
        next(err);
      });
  });
};
/**
 * Delete user account.
 * @route POST /api/auth/account/delete
 */
export const postDeleteAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = req.user as UserDocument;
  User.deleteOne({ _id: user.id }, (err: any) => {
    if (err) {
      return next(err);
    }
    if (!req.user) {
      return res.status(404).json({ 
        success: false,
        message: "You are not logged in" 
      });
    }
    req.logout((err: Error) => {
      if (err) {
        return next(err);
      }
      res.status(200).json({
        success: true,
        message: "Your account has been deleted successfully",
        redirectUrl: "/"
      });
    });
  });
};

/**
 * Unlink OAuth provider.
 * @route POST /api/auth/account/unlink/:provider
 */
export const getOauthUnlink = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const provider = req.params.provider;
  const user = req.user as UserDocument;
  User.findById(user.id, (err: NativeError, user: any) => {
    if (err) {
      return next(err);
    }
    user[provider] = undefined;
    user.tokens = user.tokens.filter(
      (token: AuthToken) => token.kind !== provider
    );
    user.save((err: WriteError) => {
      if (err) {
        return next(err);
      }
      res.status(200).json({
        success: true,
        message: `${provider} account has been unlinked successfully`,
        user: {
          id: user.id,
          email: user.email,
          profile: user.profile
        }
      });
    });
  });
};

/**
 * Reset Password page data.
 * @route GET /api/auth/reset/:token
 */
export const getReset = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (req.isAuthenticated()) {
    return res.status(200).json({
      isAuthenticated: true,
      redirectUrl: "/"
    });
  }
  User.findOne({ passwordResetToken: req.params.token })
    .where("passwordResetExpires")
    .gt(Date.now())
    .exec()
    .then((user: UserDocument | null) => {
      if (!user) {
        return res.status(400).json({
          errors: [{ msg: "Password reset token is invalid or has expired." }],
          redirectUrl: "/forgot"
        });
      }
      res.status(200).json({
        title: "Password Reset",
        isAuthenticated: false,
        token: req.params.token
      });
    })
    .catch((err: WriteError) => {
      return next(err);
    });
};
/**
 * Reset Password.
 * @route POST /api/auth/reset/:token
 */
export const postReset = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  await check("password", "Password must be 6 characters long")
    .isLength({ min: 6 })
    .run(req);
  await check("confirmPassword", "Passwords do not match")
    .equals(req.body.password)
    .run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((err: ValidationError) => ({ msg: err.msg }))
    });
  }
  
  const token = req.params.token;
  
  try {
    // Find user with valid reset token
    const user = await User.findOne({ passwordResetToken: token })
      .where("passwordResetExpires")
      .gt(Date.now())
      .exec();
      
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Password reset token is invalid or has expired.",
        redirectUrl: "/forgot"
      });
    }
    
    // Reset password
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    
    await user.save();
    
    // Log user in
    req.logIn(user, async (err: any) => {
      if (err) {
        return next(err);
      }
      
      try {
        // Send confirmation email
        const transporter = nodemailer.createTransport({
          service: "SendGrid",
          auth: {
            user: process.env.SENDGRID_USER,
            pass: process.env.SENDGRID_PASSWORD,
          },
        });
        
        const mailOptions = {
          to: user.email,
          from: "nnheo@example.com",
          subject: "Your password has been changed",
          text:
            `Hello,\n\nThis is a confirmation that the password for your account ${user.email} has just been changed.\n` +
            `If you did not request this, please contact support immediately.\n`
        };
        
        await transporter.sendMail(mailOptions);
        
        return res.status(200).json({
          success: true,
          message: "Password has been changed successfully. An email confirmation has been sent.",
          user: {
            id: user.id,
            email: user.email
          },
          redirectUrl: "/"
        });
      } catch (emailError) {
        // Still return success even if email fails
        return res.status(200).json({
          success: true,
          message: "Password has been changed successfully, but we couldn't send a confirmation email.",
          user: {
            id: user.id,
            email: user.email
          },
          redirectUrl: "/"
        });
      }
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Forgot Password page data.
 * @route GET /api/auth/forgot
 */
export const getForgot = (req: Request, res: Response): void => {
  if (req.isAuthenticated()) {
    return res.status(200).json({
      isAuthenticated: true,
      redirectUrl: "/"
    });
  }
  res.status(200).json({
    title: "Forgot Password",
    isAuthenticated: false
  });
};

/**
 * Create a random token, then the send user an email with a reset link.
 * @route POST /api/auth/forgot
 */
export const postForgot = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  await body("email")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .notEmpty()
    .run(req);
  await body("email").normalizeEmail({ gmail_remove_dots: false }).run(req);
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((err: ValidationError) => ({ msg: err.msg }))
    });
  }
  
  try {
    // Create random token
    const buffer = await new Promise<Buffer>((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) reject(err);
        else resolve(buf);
      });
    });
    
    const token = buffer.toString("hex");
    
    // Find user and set reset token
    const user = await User.findOne({ email: req.body.email });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Account with that email address does not exist."
      });
    }
    
    user.passwordResetToken = token;
    user.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();
    
    // Send email with reset link
    const transporter = nodemailer.createTransport({
      service: "SendGrid",
      auth: {
        user: process.env.SENDGRID_USER,
        pass: process.env.SENDGRID_PASSWORD,
      },
    });
    
    const resetUrl = `${req.protocol}://${req.headers.host}/reset/${token}`;
    
    const mailOptions = {
      to: user.email,
      from: "nnheo@example.com",
      subject: "Reset your password",
      text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
        Please click on the following link, or paste it into your browser to complete the process:\n\n
        ${resetUrl}\n\n
        If you did not request this, please ignore this email and your password will remain unchanged.\n`
    };
    
    await transporter.sendMail(mailOptions);
    
    res.status(200).json({
      success: true,
      message: `An email has been sent to ${user.email} with further instructions.`
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * OAuth authentication routes. (Sign in)
 */
const signin = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("local", (err: any, user: Express.User, info: any) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json(info);
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.json(user);
    });
    return next();
  })(req, res, next);
};

export async function list(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response<any, Record<string, any>>> {
  const users = await User.find({});
  if (users.length === 0) {
    return res.status(404).json({
      code: 404,
      success: false,
      message: "No users found",
    });
  }
  return res.status(200).json({
    code: 200,
    success: true,
    data: users,
  });
}

/**
 * Get user's Google Photos.
 * @route GET /api/user/photos
 */
export const getPhotos = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = req.user as UserDocument;
  if (!user.google) {
    return res.status(400).json({
      success: false,
      message: "Please connect your Google account first."
    });
  }

  try {
    // TODO: Implement Google Photos API integration
    res.status(501).json({ 
      success: false,
      message: "Google Photos integration not implemented yet" 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Download a file from Google Drive/Photos.
 * @route GET /api/user/download
 */
export const downloadFile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = req.user as UserDocument;
  if (!user.google) {
    return res.status(400).json({
      success: false,
      message: "Please connect your Google account first."
    });
  }

  try {
    // TODO: Implement Google Drive/Photos file download
    res.status(501).json({ 
      success: false,
      message: "File download not implemented yet" 
    });
  } catch (error) {
    next(error);
  }
};
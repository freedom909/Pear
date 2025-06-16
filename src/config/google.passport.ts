import { Express } from "express";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";
import { User } from "../models/user.model";
import dotenv from "dotenv";
import { Request, Response, NextFunction } from "express";
import crypto from 'crypto';
import '../types/express';

// Custom error class for authentication errors
export class AuthenticationError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 401) {
    super(message);
    this.name = 'AuthenticationError';
    this.statusCode = statusCode;
  }
}

// Generate a random state parameter for CSRF protection
function generateStateParameter(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Validate state parameter
function validateState(savedState: string | undefined, receivedState: string | undefined): boolean {
  if (!savedState || !receivedState) {
    return false;
  }
  return savedState === receivedState;
}

/**
 * Configure Google OAuth Strategy
 */
export function configurePassport(app: Express) {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!googleClientId || !googleClientSecret) {
    throw new Error("Missing Google OAuth configuration");
  }

  const googleStrategy = new GoogleStrategy(
    {
      clientID: googleClientId,
      clientSecret: googleClientSecret,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/api/auth/google/callback",
      scope: ['profile', 'email'],
      state: true,
    },
    async (
      req: Express.Request,
      accessToken: string,
      refreshToken: string,
      profile: any,
      done: (error: Error | null, user?: any) => void
    ) => {
      try {
        // Handle existing authenticated user
        if (req.user) {
          const result = await handleExistingUser(req, profile, accessToken);
          return done(null, result);
        }

        // Handle new authentication
        const result = await handleNewAuthentication(req, profile, accessToken);
        return done(null, result);
      } catch (error) {
        console.error('Google authentication error:', error);
        return done(error instanceof Error ? error : new Error('Authentication failed'));
      }
    }
  );

  passport.use(googleStrategy);
}

// Helper function to handle existing authenticated user
async function handleExistingUser(
  req: Express.Request,
  profile: any,
  accessToken: string
): Promise<any> {
  // Check if Google account is already linked to another user
  const existingGoogleUser = await User.findOne({ googleId: profile.id });
  if (existingGoogleUser) {
    req.flash("info", "This Google account is already connected to another user.");
    return existingGoogleUser;
  }

  // Update existing user with Google data
  const user = await User.findById(req.user.id);
  if (!user) {
    throw new Error("User not found");
  }

  // Update user profile
  user.googleId = profile.id;
  updateUserProfile(user, profile, accessToken);

  await user.save();
  req.flash("info", "Google account has been linked to your profile.");
  return user;
}

// Helper function to handle new authentication
async function handleNewAuthentication(
  req: Express.Request,
  profile: any,
  accessToken: string
): Promise<any> {
  // Check for existing Google user
  const existingUser = await User.findOne({ googleId: profile.id });
  if (existingUser) {
    return existingUser;
  }

  // Check for existing email user
  const email = profile.emails?.[0]?.value;
  if (email) {
    const userWithEmail = await User.findOne({ email });
    if (userWithEmail) {
      // Link Google to existing email account
      updateUserProfile(userWithEmail, profile, accessToken);
      await userWithEmail.save();
      req.flash("info", "Google account has been linked to your existing account.");
      return userWithEmail;
    }
  }

  // Create new user
  const newUser = new User();
  newUser.email = email;
  updateUserProfile(newUser, profile, accessToken);
  
  await newUser.save();
  req.flash("info", "Your new account has been created.");
  return newUser;
}

// Helper function to update user profile
function updateUserProfile(user: any, profile: any, accessToken: string): void {
  // Update tokens
  if (!user.tokens) {
    user.tokens = [];
  }
  user.tokens = user.tokens.filter((token: any) => token.kind !== 'google');
  user.tokens.push({ kind: 'google', accessToken });

  // Update profile information
  const photo = profile.photos?.[0]?.value;
  user.profile = user.profile || {};
  user.profile.name = user.profile.name || profile.displayName;
  if (photo) {
    user.profile.picture = user.profile.picture || photo;
  }
}

/**
 * Initiate Google authentication
 */
export function initiateGoogleAuthentication(
  req: Request & Express.AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  // Generate state parameter for CSRF protection
  const state = generateStateParameter();
  req.session.state = state;
  
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state: state,
  })(req, res, next);
}

/**
 * Handle Google authentication callback
 */
export function handleGoogleCallback(
  req: Request & Express.AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  // Validate state parameter
  const savedState = req.session.state;
  const receivedState = req.query.state as string | undefined;
  
  if (!validateState(savedState, receivedState)) {
    req.flash('error', 'Invalid state parameter. Please try again.');
    res.redirect('/login');
    return;
  }
  
  // Clear the state from session
  delete req.session.state;

  passport.authenticate('google', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true,
    successFlash: 'Successfully logged in with Google!'
  })(req, res, next);
}

/**
 * Unlink Google account from user profile
 */
export async function unlinkGoogle(
  req: Request & Express.AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.isAuthenticated() || !req.user) {
      res.status(401).redirect('/login');
      return;
    }
    
    const user = req.user;
    
    // Remove Google ID
    user.googleId = undefined;
    
    // Remove Google token
    if (user.tokens && Array.isArray(user.tokens)) {
      user.tokens = user.tokens.filter(token => token.kind !== 'google');
    }
    
    // Save user
    await user.save();
    
    // Set success message
    req.flash('success', 'Google account has been unlinked from your profile');
    
    // Redirect to profile page
    res.redirect('/profile');
  } catch (error) {
    console.error('Error unlinking Google account:', error);
    req.flash('error', 'Failed to unlink Google account');
    res.redirect('/profile');
  }
}
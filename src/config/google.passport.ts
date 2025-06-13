import { Express } from "express";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import passport from "passport";
import User from "../models/User.js";
import dotenv from "dotenv";
dotenv.config();
import qs, { ParsedQs } from "qs";
import crypto from 'crypto';

import { Request, Response, NextFunction } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { Document } from "mongoose";

import fetch from "node-fetch";
import { URL } from 'url';

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
 * Refreshes a Google access token if it's expired or about to expire
 * @param refreshToken The refresh token to use
 * @returns Promise resolving to the new tokens or null if refresh failed
 */
// Define the Google token response interface
interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  scope?: string;
  token_type?: string;
  id_token?: string;
}

// Function to validate Google token response
// function isValidGoogleTokenResponse(data: any): data is GoogleTokenResponse {
//   return typeof data.access_token === 'string' && typeof data.expires_in === 'number';
// }

/**
 * Refreshes a Google access token if it's expired or about to expire
 * @param refreshToken The refresh token to use
 * @returns Promise resolving to the new tokens or null if refresh failed
 */
export async function refreshGoogleToken(refreshToken: string): Promise<{
  access_token: string;
  expires_in: number;
} | null> {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      throw new AuthenticationError('Missing Google OAuth configuration');
    }
    
    const tokenUrl = 'https://oauth2.googleapis.com/token';
    const params = {
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    };
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: qs.stringify(params)
    });
    
    if (!response.ok) {
      throw new AuthenticationError(`Failed to refresh token: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (isValidGoogleTokenResponse(data)) {
      const { access_token, expires_in } = data;
      return { access_token, expires_in };
    } else {
      throw new AuthenticationError('Invalid token response format');
    }
    
  } catch (error) {
    console.error('Error refreshing Google token:', error);
    return null;
  }
}
function isValidGoogleTokenResponse(data: any): data is GoogleTokenResponse {
  return typeof data.access_token === 'string';
}
// Extend Express Request to include authenticated user
declare global {
  namespace Express {
    interface User extends IUser {}
    
    interface AuthenticatedRequest extends Request {
      isAuthenticated(): boolean;
      user?: User;
      session: {
        [key: string]: any;
        state?: string;
      };
    }
  }
}

interface IUser extends Document {
  id: string;
  email: string;
  google?: string;
  tokens: Array<{ kind: string; accessToken: string; refreshToken?: string }>;
  profile: {
    name?: string;
    gender?: string;
    picture?: string;
  };
}

interface GoogleProfile extends Profile {
  _json: {
    email: string;
    name?: string;
    picture?: string;
  };
}

/**
 * Check if user has connected Google account
 * @param user User object to check
 * @returns Boolean indicating if user has connected Google
 */
export function hasConnectedGoogle(user: Express.User | undefined): boolean {
  if (!user) return false;
  
  // Check if user has Google ID
  if (user.google) return true;
  
  // Check if user has Google token
  if (user.tokens && Array.isArray(user.tokens)) {
    return user.tokens.some(token => token.kind === 'google');
  }
  
  return false;
}

/**
 * Unlink Google account from user profile
 * This middleware removes the Google connection from a user's account
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
    user.google = undefined;
    
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

/**
 * Initiate Google authentication
 * This middleware starts the Google OAuth flow
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
    scope: [
      'profile', 
      'email',
      'https://www.googleapis.com/auth/photoslibrary.readonly'
    ],
    state: state,
    accessType: 'offline',
    prompt: 'consent'
  })(req, res, next);
}

/**
 * Handle Google authentication callback
 * This middleware processes the callback from Google after user authorization
 */
export function handleGoogleCallback(
  req: Request & Express.AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  passport.authenticate('google', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true,
    successFlash: 'Successfully logged in with Google!'
  })(req, res, next);
}

export function configurePassport(app: Express) {
  // Configure passport middleware and strategies

  const googleClientId = process.env.GOOGLE_CLIENT_ID as string;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET as string;

  const googleStrategy = new GoogleStrategy(
    {
      clientID: googleClientId,
      clientSecret: googleClientSecret,
      callbackURL: process.env.GOOGLE_REDIRECT_URI || `${process.env.BASE_URL || "http://localhost:3001"}/auth/google/callback`,
      scope: [
        'profile', 
        'email',
        'https://www.googleapis.com/auth/photoslibrary.readonly'
      ],
      accessType: 'offline',
      prompt: 'consent',
      passReqToCallback: true,
      state: true, // Enable state parameter for CSRF protection
    },
    async (
      req: Express.Request,
      accessToken: string,
      refreshToken: string,
      profile: GoogleProfile,
      done: (error: Error | null, user?: IUser | false) => void
    ) => {
      try {
        // Handle existing authenticated user
        if (req.user) {
          const result = await handleExistingUser(req, profile, accessToken, refreshToken);
          return done(null, result);
        }

        // Handle new authentication
        const result = await handleNewAuthentication(req, profile, accessToken, refreshToken);
        return done(null, result);
      } catch (error) {
        console.error('Google authentication error:', error);
        return done(error instanceof Error ? error : new Error('Authentication failed'));
      }
    }
  );

  // Helper function to handle existing authenticated user
  async function handleExistingUser(
    req: Express.Request,
    profile: GoogleProfile,
    accessToken: string,
    refreshToken: string
  ): Promise<IUser> {
    // Check if Google account is already linked to another user
    const existingGoogleUser = await User.findOne({ google: profile.id });
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
    user.google = profile.id;
    updateUserProfile(user, profile, accessToken, refreshToken);

    await user.save();
    req.flash("info", "Google account has been linked to your profile.");
    return user;
  }

  // Helper function to handle new authentication
  async function handleNewAuthentication(
    req: Express.Request,
    profile: GoogleProfile,
    accessToken: string,
    refreshToken: string
  ): Promise<IUser> {
    // Check for existing Google user
    const existingUser = await User.findOne({ google: profile.id });
    if (existingUser) {
      return existingUser;
    }

    // Check for existing email user
    if (profile._json.email) {
      const userWithEmail = await User.findOne({ email: profile._json.email });
      if (userWithEmail) {
        // Link Google to existing email account
        updateUserProfile(userWithEmail, profile, accessToken, refreshToken);
        await userWithEmail.save();
        req.flash("info", "Google account has been linked to your existing account.");
        return userWithEmail;
      }
    }

    // Create new user
    const newUser = new User();
    newUser.email = profile._json.email;
    updateUserProfile(newUser, profile, accessToken, refreshToken);
    
    await newUser.save();
    req.flash("info", "Your new account has been created.");
    return newUser;
  }

  // Helper function to update user profile
  function updateUserProfile(user: IUser, profile: GoogleProfile, accessToken: string, refreshToken: string): void {
    // Update tokens
    if (!user.tokens) {
      user.tokens = [];
    }
    user.tokens = user.tokens.filter(token => token.kind !== 'google');
    user.tokens.push({ 
      kind: 'google', 
      accessToken,
      refreshToken: refreshToken || undefined
    });

    // Update profile information
    user.profile.name = user.profile.name || profile._json.name;
    if (profile._json.picture) {
      user.profile.picture = user.profile.picture || profile._json.picture;
    }
  }

  passport.use(googleStrategy);
  passport.serializeUser<IUser, any>((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser<string, IUser | null>(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
}

/**
 * Middleware to ensure Google token is valid
 * Automatically refreshes token if needed
 */
export function requireValidGoogleToken(
  req: Request & Express.AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.isAuthenticated() || !req.user) {
    res.status(401).redirect('/login');
    return;
  }

  // Check if user has Google token
  const googleToken = req.user.tokens && 
    Array.isArray(req.user.tokens) && 
    req.user.tokens.find(token => token.kind === 'google');

  if (!googleToken || !googleToken.accessToken) {
    res.status(403).redirect('/connect/google');
    return;
  }

  // Check if token is valid by making a test request to Google API
  fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${googleToken.accessToken}`
    }
  })
  .then(response => {
    if (response.ok) {
      // Token is valid, proceed
      next();
      return;
    }
    
    // Token is invalid, try to refresh it
    if (!googleToken.refreshToken) {
      // No refresh token, redirect to reconnect
      res.status(401).redirect('/connect/google');
      return;
    }
    
    // Refresh token
    return refreshGoogleToken(googleToken.refreshToken)
      .then(newTokens => {
        if (!newTokens) {
          // Token refresh failed, redirect to reconnect
          res.status(401).redirect('/connect/google');
          return;
        }
        
        // Update user's token in database
        googleToken.accessToken = newTokens.access_token;
        return req.user.save().then(() => {
          // Token refreshed and saved, proceed
          next();
        });
      });
  })
  .catch(error => {
    console.error('Google token validation error:', error);
    res.status(500).json({ error: 'Authentication error' });
  });
}
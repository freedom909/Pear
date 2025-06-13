import { Express } from "express";
import { Strategy as FacebookStrategy, Profile } from "passport-facebook";
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
 * Refreshes a Facebook access token if it's expired or about to expire
 * @param user User object containing the Facebook token
 * @returns Promise resolving to the refreshed token or null if refresh failed
 */
export async function refreshFacebookToken(user: Express.User): Promise<string | null> {
  try {
    if (!user.tokens || !Array.isArray(user.tokens)) {
      throw new AuthenticationError('User has no tokens');
    }

    const facebookToken = user.tokens.find(token => token.kind === 'facebook');
    if (!facebookToken || !facebookToken.accessToken) {
      throw new AuthenticationError('No Facebook token found');
    }

    // Check if token is valid by making a test request to Facebook Graph API
    const testUrl = 'https://graph.facebook.com/v13.0/me';
    const testResponse = await fetch(`${testUrl}?access_token=${facebookToken.accessToken}`);
    
    // If token is valid, return it
    if (testResponse.ok) {
      return facebookToken.accessToken;
    }
    
    // If token is invalid, try to get a long-lived token
    const clientId = process.env.FACEBOOK_CLIENT_ID;
    const clientSecret = process.env.FACEBOOK_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      throw new AuthenticationError('Missing Facebook OAuth configuration');
    }
    
    const exchangeUrl = 'https://graph.facebook.com/v13.0/oauth/access_token';
    const params = {
      grant_type: 'fb_exchange_token',
      client_id: clientId,
      client_secret: clientSecret,
      fb_exchange_token: facebookToken.accessToken
    };
    
    const response = await fetch(`${exchangeUrl}?${qs.stringify(params)}`);
    
    if (!response.ok) {
      throw new AuthenticationError(`Failed to refresh token: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.access_token) {
      throw new AuthenticationError('Invalid response when refreshing token');
    }
    
    // Update user's token in database
    facebookToken.accessToken = data.access_token;
    await user.save();
    
    return data.access_token;
  } catch (error) {
    console.error('Error refreshing Facebook token:', error);
    return null;
  }
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

/**
 * Initializes Facebook authentication request with CSRF protection
 */
export function initiateFacebookAuth(
  req: Request & Express.AuthenticatedRequest,
  res: Response
): void {
  // Generate and store state parameter for CSRF protection
  const state = generateStateParameter();
  req.session.state = state;
  
  // Construct Facebook authorization URL with state parameter
  const clientId = process.env.FACEBOOK_CLIENT_ID;
  const redirectUri = process.env.FACEBOOK_REDIRECT_URI;
  
  if (!clientId || !redirectUri) {
    throw new Error("Missing Facebook OAuth configuration");
  }
  
  const authUrl = new URL('https://www.facebook.com/v13.0/dialog/oauth');
  authUrl.searchParams.append('client_id', clientId);
  authUrl.searchParams.append('redirect_uri', redirectUri);
  authUrl.searchParams.append('state', state);
  authUrl.searchParams.append('scope', 'email,public_profile');
  authUrl.searchParams.append('response_type', 'code');
  
  // Redirect to Facebook authorization page
  res.redirect(authUrl.toString());
}

interface IUser extends Document {
  id: string;
  email: string;
  facebook?: string;
  tokens: Array<{ kind: string; accessToken: string }>;
  profile: {
    name?: string;
    gender?: string;
    picture?: string;
  };
}

interface FacebookProfile extends Profile {
  _json: {
    email: string;
    gender?: string;
    picture?: string;
  };
}

/**
 * Check if user has connected Facebook account
 * @param user User object to check
 * @returns Boolean indicating if user has connected Facebook
 */
export function hasConnectedFacebook(user: Express.User | undefined): boolean {
  if (!user) return false;
  
  // Check if user has Facebook ID
  if (user.facebook) return true;
  
  // Check if user has Facebook token
  if (user.tokens && Array.isArray(user.tokens)) {
    return user.tokens.some(token => token.kind === 'facebook');
  }
  
  return false;
}

/**
 * Unlink Facebook account from user profile
 * This middleware removes the Facebook connection from a user's account
 */
export async function unlinkFacebook(
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
    
    // Remove Facebook ID
    user.facebook = undefined;
    
    // Remove Facebook token
    if (user.tokens && Array.isArray(user.tokens)) {
      user.tokens = user.tokens.filter(token => token.kind !== 'facebook');
    }
    
    // Save user
    await user.save();
    
    // Set success message
    req.flash('success', 'Facebook account has been unlinked from your profile');
    
    // Redirect to profile page
    res.redirect('/profile');
  } catch (error) {
    console.error('Error unlinking Facebook account:', error);
    req.flash('error', 'Failed to unlink Facebook account');
    res.redirect('/profile');
  }
}

/**
 * Initiate Facebook authentication
 * This middleware starts the Facebook OAuth flow
 */
export function initiateFacebookAuthentication(
  req: Request & Express.AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  // Generate state parameter for CSRF protection
  const state = generateStateParameter();
  req.session.state = state;
  
  passport.authenticate('facebook', {
    scope: ['email', 'public_profile'],
    state: state,
    // Request additional permissions if needed
    // authType: 'rerequest', // Use this to re-request declined permissions
  })(req, res, next);
}

/**
 * Handle Facebook authentication callback
 * This middleware processes the callback from Facebook after user authorization
 */
export function handleFacebookCallback(
  req: Request & Express.AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  passport.authenticate('facebook', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true,
    successFlash: 'Successfully logged in with Facebook!'
  })(req, res, next);
}

export function configurePassport(app: Express) {
  // Configure passport middleware and strategies

  const facebookClientId = process.env.FACEBOOK_CLIENT_ID as string;
  const facebookClientSecret = process.env.FACEBOOK_CLIENT_SECRET as string;

  const facebookStrategy = new FacebookStrategy(
    {
      clientID: facebookClientId,
      clientSecret: facebookClientSecret,
      callbackURL: process.env.FACEBOOK_REDIRECT_URI || "http://localhost:3000/auth/facebook/callback",
      profileFields: ["id", "displayName", "photos", "email", "gender"],
      passReqToCallback: true,
      enableProof: true, // Increases security by using app secret proof
      state: true, // Enable state parameter for CSRF protection
    },
    async (
      req: Express.Request,
      accessToken: string,
      refreshToken: string,
      profile: FacebookProfile,
      done: (error: Error | null, user?: IUser | false) => void
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
        console.error('Facebook authentication error:', error);
        return done(error instanceof Error ? error : new Error('Authentication failed'));
      }
    }
  );

  // Helper function to handle existing authenticated user
  async function handleExistingUser(
    req: Express.Request,
    profile: FacebookProfile,
    accessToken: string
  ): Promise<IUser> {
    // Check if Facebook account is already linked to another user
    const existingFacebookUser = await User.findOne({ facebook: profile.id });
    if (existingFacebookUser) {
      req.flash("info", "This Facebook account is already connected to another user.");
      return existingFacebookUser;
    }

    // Update existing user with Facebook data
    const user = await User.findById(req.user.id);
    if (!user) {
      throw new Error("User not found");
    }

    // Update user profile
    user.facebook = profile.id;
    updateUserProfile(user, profile, accessToken);

    await user.save();
    req.flash("info", "Facebook account has been linked to your profile.");
    return user;
  }

  // Helper function to handle new authentication
  async function handleNewAuthentication(
    req: Express.Request,
    profile: FacebookProfile,
    accessToken: string
  ): Promise<IUser> {
    // Check for existing Facebook user
    const existingUser = await User.findOne({ facebook: profile.id });
    if (existingUser) {
      return existingUser;
    }

    // Check for existing email user
    if (profile._json.email) {
      const userWithEmail = await User.findOne({ email: profile._json.email });
      if (userWithEmail) {
        // Link Facebook to existing email account
        updateUserProfile(userWithEmail, profile, accessToken);
        await userWithEmail.save();
        req.flash("info", "Facebook account has been linked to your existing account.");
        return userWithEmail;
      }
    }

    // Create new user
    const newUser = new User();
    newUser.email = profile._json.email;
    updateUserProfile(newUser, profile, accessToken);
    
    await newUser.save();
    req.flash("info", "Your new account has been created.");
    return newUser;
  }

  // Helper function to update user profile
  function updateUserProfile(user: IUser, profile: FacebookProfile, accessToken: string): void {
    // Update tokens
    if (!user.tokens) {
      user.tokens = [];
    }
    user.tokens = user.tokens.filter(token => token.kind !== 'facebook');
    user.tokens.push({ kind: 'facebook', accessToken });

    // Update profile information
    const photo = profile.photos?.[0]?.value;
    user.profile.name = user.profile.name || profile.displayName;
    user.profile.gender = user.profile.gender || profile._json.gender;
    if (photo) {
      user.profile.picture = user.profile.picture || photo;
    }
  }

  passport.use(facebookStrategy);
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
 * Middleware to ensure Facebook token is valid
 * Automatically refreshes token if needed
 */
export function requireValidFacebookToken(
  req: Request & Express.AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.isAuthenticated() || !req.user) {
    res.status(401).redirect('/login');
    return;
  }

  // Check if user has Facebook token
  const hasFacebookToken = req.user.tokens && 
    Array.isArray(req.user.tokens) && 
    req.user.tokens.some(token => token.kind === 'facebook');

  if (!hasFacebookToken) {
    res.status(403).redirect('/connect/facebook');
    return;
  }

  // Refresh token if needed
  refreshFacebookToken(req.user)
    .then(token => {
      if (!token) {
        // Token refresh failed, redirect to reconnect
        res.status(401).redirect('/connect/facebook');
        return;
      }
      // Token is valid, proceed
      next();
    })
    .catch(error => {
      console.error('Facebook token validation error:', error);
      res.status(500).json({ error: 'Authentication error' });
    });
}

export async function authorizeFacebook(
  req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>> &
    Express.AuthenticatedRequest,
  res: Response<any, Record<string, any>>,
  next: NextFunction,
): Promise<void> {
  try {
    // Check if the user is authenticated and authorized
    if (!req.isAuthenticated() || !req.user) {
      res.status(401).redirect("/login");
      return;
    }

    // Validate state parameter to prevent CSRF attacks
    const savedState = req.session.state;
    const receivedState = req.query.state as string | undefined;
    
    if (!validateState(savedState, receivedState)) {
      throw new AuthenticationError("Invalid state parameter. Possible CSRF attack.", 403);
    }
    
    // Clear the state from session after validation
    delete req.session.state;

    // Exchange authorization code for access token
    if (!req.query.code) {
      throw new AuthenticationError("Authorization code not found.", 400);
    }

    const code = req.query.code as string;
    
    const clientId = process.env.FACEBOOK_CLIENT_ID;
    const clientSecret = process.env.FACEBOOK_CLIENT_SECRET;
    const redirectUri = process.env.FACEBOOK_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      throw new AuthenticationError("Missing Facebook OAuth configuration.", 500);
    }

    // Use URL for better parameter handling
    const tokenUrl = new URL("https://graph.facebook.com/v13.0/oauth/access_token");
    tokenUrl.searchParams.append("client_id", clientId);
    tokenUrl.searchParams.append("client_secret", clientSecret);
    tokenUrl.searchParams.append("redirect_uri", redirectUri);
    tokenUrl.searchParams.append("code", code);

    const tokenOptions = {
      method: "GET",
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Pear-App/1.0'
      }
    };

    try {
      const response = await fetch(tokenUrl.toString(), tokenOptions);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Facebook API error response:', errorText);
        throw new AuthenticationError(`Facebook API error: ${response.statusText}`, 502);
      }

      const data = await response.json();
      
      // Type guard for Facebook OAuth response
      if (!('access_token' in data && 'expires_in' in data)) {
        throw new AuthenticationError('Invalid response from Facebook OAuth endpoint', 502);
      }

      const accessToken = data.access_token as string;
      const expiresIn = data.expires_in as number;

      // Update user's Facebook access token
      if (!req.user.tokens) {
        req.user.tokens = [];
      }

      // Remove old Facebook token if exists
      req.user.tokens = req.user.tokens.filter(token => token.kind !== 'facebook');
      
      // Add new token with expiration information
      req.user.tokens.push({
        kind: 'facebook',
        accessToken: accessToken,
        // Store token expiration time if your token schema supports it
        // expiresAt: new Date(Date.now() + expiresIn * 1000)
      });

      try {
        // Save updated user
        await req.user.save();
        
        // Log successful token update
        console.log(`Facebook token updated for user: ${req.user.id}`);
        
        // Set success flash message
        req.flash('success', 'Facebook account connected successfully');
        
        // Successful authorization
        res.redirect("/profile");
      } catch (saveError) {
        console.error('Error saving user token:', saveError);
        throw new AuthenticationError("Failed to save authentication token.", 500);
      }
    } catch (fetchError) {
      if (fetchError instanceof AuthenticationError) {
        throw fetchError;
      }
      console.error('Facebook token fetch error:', fetchError);
      throw new AuthenticationError('Failed to communicate with Facebook', 502);
    }
  } catch (error) {
    console.error("Facebook authorization error:", error);
    
    // Handle different types of errors
    if (error instanceof AuthenticationError) {
      req.flash('error', error.message);
      res.status(error.statusCode).redirect('/auth/error');
    } else {
      req.flash('error', 'An unexpected error occurred during authentication');
      res.status(500).redirect('/auth/error');
    }
  }
}
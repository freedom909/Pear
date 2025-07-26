// merged-auth.routes.ts
import express, { Request, Response } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

import { protect } from "../middleware/auth";
import logger from "../middleware/logger";
import { register, login } from "../controllers/auth.controller";

import User from "../models/user/user.model";
import { authenticateJWTMiddleware } from "@/middleware/authenticateJWTMiddleware";


const publicRouter = express.Router();
const protectedRouter = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// 注册路由
publicRouter.post("/register", register);

// 登录路由
publicRouter.post("/login", login);

/**
 * Utility: Generate JWT token
 */
const generateToken = (user: any): string => {
  return jwt.sign(
    { id: user._id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// GET /api/v1/auth/verify-token
publicRouter.get('/verify-token', authenticateJWTMiddleware, (req, res) => {
  res.status(200).json({ message: 'Token is valid', user: req.user });
});


// Facebook Debug
publicRouter.get("/facebook/debug", (_req, res) => {
  const config = {
    FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID ? `****${process.env.FACEBOOK_APP_ID.slice(-4)}` : "MISSING",
    FACEBOOK_APP_SECRET: process.env.FACEBOOK_APP_SECRET ? `****${process.env.FACEBOOK_APP_SECRET.slice(-4)}` : "MISSING",
    FACEBOOK_CALLBACK_URL: process.env.FACEBOOK_CALLBACK_URL || "MISSING",
  };
  res.json({ success: true, config });
});

// OAuth Start: Facebook
publicRouter.get("/facebook", (req, res, next) => {
  const redirectUri = req.query.redirect_uri as string;
  if (redirectUri) {
    req.session = req.session || {};
    (req.session as any).redirectUri = redirectUri;
  }
  passport.authenticate("facebook", { scope: ["email"] })(req, res, next);
});

// OAuth Callback: Facebook
publicRouter.get("/facebook/callback",
  passport.authenticate("facebook", { session: false, failureRedirect: "/api/v1/auth/failure" }),
  async (req, res) => {
    try {
      const user = req.user as any;
      const token = generateToken(user);
      const redirectUri = ((req.session as any).redirectUri as string) ||`${FRONTEND_URL}/oauth/facebook-callback`;
      if (req.session) delete (req.session as any).redirectUri;
      const redirectUrl = new URL(redirectUri);
      redirectUrl.searchParams.append("token", token);
      logger.info("Facebook authentication successful", { userId: user._id });
      res.redirect(redirectUrl.toString());
    } catch (error) {
      logger.error("Error in Facebook callback handler", error);
      res.redirect(`${FRONTEND_URL}/auth/callback?code=server_error&message=Internal+server+error`);
    }
  });

// OAuth Start: Google
publicRouter.get("/google", (req, res, next) => {
  const redirectUri = req.query.redirect_uri as string;
  if (redirectUri) {
    req.session = req.session || {};
    (req.session as any).redirectUri = redirectUri;
  }
  passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
});

// OAuth Callback: Google
publicRouter.get("/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/api/v1/auth/failure" }),
  async (req, res) => {
    try {
      const user = req.user as any;
      const token = generateToken(user);
      const redirectUri = ((req.session as any).redirectUri as string) || `${FRONTEND_URL}/oauth/google-callback`;
      if (req.session) delete (req.session as any).redirectUri;
      const redirectUrl = new URL(redirectUri);
      redirectUrl.searchParams.append("token", token);
      logger.info("Google authentication successful", { userId: user._id });
      res.redirect(redirectUrl.toString());
    } catch (error) {
      logger.error("Error in Google callback handler", error);
      res.redirect(`${FRONTEND_URL}/auth/callback?code=server_error&message=Internal+server+error`);
    }
  });

  publicRouter.post("/logout", (_req, res) => {
  res.clearCookie("auth_token", {
    path: "/",
  });
  res.status(200).json({ success: true, message: "Logout successful" });
});


// Auth Status Check
publicRouter.get("/status", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.status(200).json({ authenticated: false });
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(200).json({ authenticated: false });
    return res.status(200).json({ authenticated: true, user: { id: user._id, email: user.email, name: user.username } });
  } catch (error) {
    logger.debug('Auth status check failed', error);
    return res.status(200).json({ authenticated: false });
  }
});

// Auth Failure
publicRouter.get("/failure", (req, res) => {
  logger.warn("Authentication failed", { reason: req.query.reason || "unknown" });
  res.redirect(`${FRONTEND_URL}/auth/callback?code=auth_failed&message=Authentication+failed`);
});

// Logout Endpoint
publicRouter.post("/logout", (_req, res) => {
  res.status(200).json({ success: true, message: "Logout successful" });
});

// Protected: /me
protectedRouter.get("/me", protect, (req: Request, res: Response) => {
  res.json({
    user: {
      id: req.user?.id,
      email: req.user?.email,
      name: req.user?.username
    },
  });
});

// Protected: /profile
protectedRouter.get("/profile", protect, (req: Request, res: Response) => {
  res.json({
    user: {
      id: req.user?.id,
      email: req.user?.email,
      name: req.user?.username
    },
  });
});

export { publicRouter, protectedRouter };
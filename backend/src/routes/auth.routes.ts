// routes/auth.routes.ts
import express from "express";
import passport from "passport";
import { Request, Response } from "express";
import { corsPreflightHandler } from "../middleware/corsPreflightHandler";
import { protect } from "../middleware/auth";
import { logger } from "../utils/logger";
import { authService } from "../services/auth.service";
import { AuthenticateOptions } from "passport";
import { UserDocument } from "@/models/user/user.types";

 const publicRouter = express.Router();
 const protectedRouter = express.Router();

/**
 * Facebook Debug Endpoint
 */
publicRouter.get("/facebook/debug", (_req, res) => {
  const config = {
    FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID ? `****${process.env.FACEBOOK_APP_ID.slice(-4)}` : "MISSING",
    FACEBOOK_APP_SECRET: process.env.FACEBOOK_APP_SECRET ? `****${process.env.FACEBOOK_APP_SECRET.slice(-4)}` : "MISSING",
    FACEBOOK_CALLBACK_URL: process.env.FACEBOOK_CALLBACK_URL || "MISSING",
  };

  res.json({
    success: true,
    config,
  });
});

/**
 * Facebook OAuth Start
 */
publicRouter.route("/facebook")
  .options(corsPreflightHandler)
  .get((req, res, next) => {
    try {
      const options: AuthenticateOptions = {
        scope: ["email"],
        session: false,
        state: typeof req.query.redirect_uri === 'string' ? req.query.redirect_uri : "/",
      };
      logger.info("Starting Facebook login with options", options);
      passport.authenticate("facebook", options)(req, res, next);
    } catch (err) {
      logger.error("Facebook OAuth init error:", err);
      res.status(500).json({
        success: false,
        message: "Facebook OAuth initialization failed",
      });
    }
  });

/**
 * Facebook OAuth Callback
 */
publicRouter.route("/facebook/callback")
  .options(corsPreflightHandler)
  .get((req, res, next) => {
    passport.authenticate("facebook", { session: false }, 
      async (err:Error, user:UserDocument, info:{ message: string }) => {
      if (err) {
        logger.error("Facebook callback error", { err, info });
        return res.redirect("/api/v1/auth/error?source=facebook");
      }
      if (!user) {
        logger.warn("Facebook callback no user", { info });
        return res.redirect("/api/v1/auth/error?source=facebook");
      }
      try {
        const token = await authService.generateJwtForUser(user);
        res.json({ success: true, user, token });
      } catch (e) {
        logger.error("Token generation failed", e);
        res.status(500).json({ success: false, message: "Failed to generate token" });
      }
    })(req, res, next);
  });

/**
 * Protected Profile Route
 */
protectedRouter.route("/profile")
  .options(corsPreflightHandler)
  .get(protect, (req: Request, res: Response) => {
    res.json({
      user: {
        id: req.user?.id,// Property 'id' does not exist on type 'User'
        email: req.user?.email,// Property 'emails' does not exist on type 'User'
      },
    });
  });

export { publicRouter, protectedRouter }
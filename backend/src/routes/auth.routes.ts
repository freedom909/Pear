import express from "express";
import { login, register } from "../controllers/auth.controller";
import { googleLogin, googleCallback } from "../controllers/oauth/google.controller";
import { facebookLogin, facebookCallback } from "../controllers/oauth/facebook.controller";
import { protect } from "../middleware/auth";
import { appleCallback, appleLogin } from "@/controllers/oauth/apple.controller";
import { twitterCallback, twitterLogin } from "@/controllers/oauth/twitter.controller";

const publicRouter = express.Router();
const protectedRouter = express.Router();

/**
 * Public routes
 * (No authentication required)
 */
publicRouter.post("/login", login);
publicRouter.post("/register", register);

// Google OAuth
publicRouter.get("/google", googleLogin);
publicRouter.get("/google/callback", googleCallback);

// Apple OAuth
publicRouter.get("/apple", appleLogin);
publicRouter.get("/apple/callback", appleCallback);

// Twitter OAuth
publicRouter.get("/twitter", twitterLogin);
publicRouter.get("/twitter/callback", twitterCallback);

// Facebook OAuth
publicRouter.get("/facebook", facebookLogin);
publicRouter.get("/facebook/callback", facebookCallback);

/**
 * Protected routes
 * (Authentication required)
 */
protectedRouter.use(protect);

protectedRouter.get("/verify-token", (req, res) => {
  res.json({ user: req.user });
});

protectedRouter.post("/logout", (req, res) => {
  req.logout(() => {});
  res.json({ message: "Logged out" });
});

export { publicRouter, protectedRouter };

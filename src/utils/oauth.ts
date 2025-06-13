import { Request, Response, NextFunction } from "express";
import { IUser, UserDocument } from "../models/User.js";


/**
 * Generic OAuth unlink function
 * @param provider OAuth provider name (e.g., 'google', 'facebook')
 * @param req Express request object
 * @param res Express response object
 * @param next Express next function
 */
export const unlinkOAuthProvider = async (
  provider: string,
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user as UserDocument;
    
    if (!user) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    // Create update object dynamically based on provider
    const updateObj: any = {};
    updateObj[`${provider}Id`] = undefined;
    updateObj[`${provider}Tokens`] = undefined;
    
    // Update user in database
    await updateObj.findByIdAndUpdate(user.id, { $unset: updateObj });
    
    req.flash("success", `${provider.charAt(0).toUpperCase() + provider.slice(1)} account has been unlinked.`);
    res.redirect("/account");
  } catch (err) {
    next(err);
  }
};

/**
 * Handle OAuth callback for login or account connection
 * @param provider OAuth provider name
 * @param req Express request object
 * @param res Express response object
 * @param err Error object if any
 * @param userId User ID from OAuth profile
 * @param tokens OAuth tokens
 * @param isConnect Whether this is a connection to existing account
 */
export const handleOAuthCallback = async (
  provider: string,
  req: Request,
  res: Response,
  err: any,
  userId: string | undefined,
  tokens: any,
  isConnect: boolean = false
): Promise<void> => {
  if (err) {
    req.flash("error", `Error connecting to ${provider}: ${err.message}`);
    return res.redirect(isConnect ? "/account" : "/login");
  }
  
  if (!userId) {
    req.flash("error", `No ${provider} ID returned`);
    return res.redirect(isConnect ? "/account" : "/login");
  }
  
  try {
    if (isConnect) {
      // Connect to existing account
      const user = req.user as UserDocument;
      
      if (!user) {
        req.flash("error", "User not authenticated");
        return res.redirect("/login");
      }
      
      // Update user with OAuth provider info
      const updateObj: any = {};
      updateObj[`${provider}Id`] = userId;
      updateObj[`${provider}Tokens`] = tokens;
      
      await updateObj.findByIdAndUpdate(user.id, updateObj);
      
      req.flash("success", `${provider.charAt(0).toUpperCase() + provider.slice(1)} account has been linked.`);
      res.redirect("/account");
    } else {
      // Login flow - handled by Passport, just redirect
      res.redirect(req.session.returnTo || "/");
    }
  } catch (error) {
    console.error(`${provider} OAuth error:`, error);
    req.flash("error", `An error occurred with ${provider} authentication.`);
    res.redirect(isConnect ? "/account" : "/login");
  }
};
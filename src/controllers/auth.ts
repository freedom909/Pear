import passport from "passport";
import { 
  initiateFacebookAuthentication, 
  handleFacebookCallback, 
  unlinkFacebook, 
  hasConnectedFacebook 
} from "../config/facebook.passport.js";
import {
  initiateGoogleAuthentication,
  handleGoogleCallback,
  unlinkGoogle,
  hasConnectedGoogle
} from "../config/google.passport.js";

/**
 * GET /login
 * Login page.
 */
export const login = (req: any, res: any, next: any) => {
    passport.authenticate('local',(err: any,user: any,info: { message: any; }) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            req.flash('error',info.message);
            return res.redirect('/account/login');

            
        }
        req.login(user,(err: any) => {
            if (err) {
                return next(err);
            }
            req.flash('success', { msg: 'Success! You are logged in.' });
            return res.redirect(req.session.returnTo || '/');
        });
    })(req,res,next);
}



/**
 * GET /auth/facebook
 * Initiate Facebook authentication
 */
export const facebookLogin = (req: any, res: any, next: any): void => {
    initiateFacebookAuthentication(req, res, next);
};

/**
 * GET /auth/facebook/callback
 * Handle Facebook authentication callback
 */
export const facebookCallback = (req: any, res: any, next: any): void => {
    handleFacebookCallback(req, res, next);
};

/**
 * GET /auth/facebook/connect
 * Connect Facebook account to existing user
 */
export const facebookConnect = (req: any, res: any, next: any): void => {
    if (!req.isAuthenticated()) {
        req.flash("error", "You must be logged in to connect Facebook account");
        return res.redirect("/account/login");
    }
    
    passport.authenticate("facebook", {
        scope: ["email", "public_profile"],
        state: req.session.state,
        callbackURL: process.env.FACEBOOK_CONNECT_CALLBACK_URL || "/auth/facebook/connect/callback"
    })(req, res, next);
};

/**
 * GET /auth/facebook/connect/callback
 * Handle Facebook connection callback
 */
export const facebookConnectCallback = (req: any, res: any, next: any): void => {
    passport.authenticate("facebook", {
        successRedirect: "/account/profile",
        failureRedirect: "/account/profile",
        failureFlash: true,
        successFlash: "Facebook account successfully connected!"
    })(req, res, next);
};

/**
 * GET /auth/facebook/unlink
 * Unlink Facebook account from user
 */
export const facebookUnlink = (req: any, res: any, next: any): void => {
    unlinkFacebook(req, res, next);
};

/**
 * Helper function to check if user has connected Facebook account
 */
export const hasConnectedFacebookAccount = (user: any): boolean => {
    return hasConnectedFacebook(user);
};

/**
 * GET /auth/google
 * Initiate Google authentication
 */
export const googleLogin = (req: any, res: any, next: any): void => {
    initiateGoogleAuthentication(req, res, next);
};

/**
 * GET /auth/google/callback
 * Handle Google authentication callback
 */
export const googleCallback = (req: any, res: any, next: any): void => {
    handleGoogleCallback(req, res, next);
};

/**
 * GET /auth/google/connect
 * Connect Google account to existing user
 */
export const googleConnect = (req: any, res: any, next: any): void => {
    if (!req.isAuthenticated()) {
        req.flash("error", "You must be logged in to connect Google account");
        return res.redirect("/account/login");
    }
    
    passport.authenticate("google", {
        scope: ["profile", "email"],
        state: req.session.state,
        callbackURL: process.env.GOOGLE_CONNECT_CALLBACK_URL || "/auth/google/connect/callback"
    })(req, res, next);
};

/**
 * GET /auth/google/connect/callback
 * Handle Google connection callback
 */
export const googleConnectCallback = (req: any, res: any, next: any): void => {
    passport.authenticate("google", {
        successRedirect: "/account/profile",
        failureRedirect: "/account/profile",
        failureFlash: true,
        successFlash: "Google account successfully connected!"
    })(req, res, next);
};

/**
 * GET /auth/google/unlink
 * Unlink Google account from user
 */
export const googleUnlink = (req: any, res: any, next: any): void => {
    unlinkGoogle(req, res, next);
};

/**
 * Helper function to check if user has connected Google account
 */
export const hasConnectedGoogleAccount = (user: any): boolean => {
    return hasConnectedGoogle(user);
};

export const logout = (req: any, res: any, next: any)=>{
    req.logout()
    req.session.destroy(err=>{
        if(err) console.log('error:fail to destroy session');
        req.user=null;
        res.redirect('/');
    })
}

/**
 * GET /signup
 * Signup page.
 */
export const Signup = (req: any, res: any, next: any)=>{
    if(req.user){
        return res.redirect('/');
    }
    res.render('/account/signup', {
        title: 'Signup'
    });
}
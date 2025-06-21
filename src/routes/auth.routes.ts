import { Router } from 'express';
import {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword,
} from '../controllers/auth.controller';
import { auth } from '../middleware/auth';

import {
  googleLogin,
  googleCallback,
} from '../controllers/oauth/google.controller';
import {
  facebookLogin,
  facebookCallback,
} from '../controllers/oauth/facebook.controller';
import {
  appleLogin,
  appleCallback,
} from '../controllers/oauth/apple.controller';
import {
  twitterLogin,
  twitterCallback,
} from '../controllers/oauth/twitter.controller';

const router = Router();

/**
 * ========================
 * Local Auth
 * ========================
 */
router.post('/register', register);               // POST /api/v1/auth/register
router.post('/login', login);                     // POST /api/v1/auth/login
router.get('/logout', logout);                    // GET /api/v1/auth/logout
router.post('/forgotpassword', forgotPassword);   // POST /api/v1/auth/forgotpassword
router.put('/resetpassword/:token', resetPassword); // PUT /api/v1/auth/resetpassword/:token

// Authenticated user
router.use(auth); // Require auth for the routes below
router.get('/me', getMe);                         // GET /api/v1/auth/me
router.put('/updatedetails', updateDetails);      // PUT /api/v1/auth/updatedetails
router.put('/updatepassword', updatePassword);    // PUT /api/v1/auth/updatepassword

/**
 * ========================
 * OAuth Providers
 * ========================
 */

// Google OAuth
router.get('/google', googleLogin);                // GET /api/v1/auth/google
router.get('/google/callback', googleCallback);    // GET /api/v1/auth/google/callback

// Facebook OAuth
router.get('/facebook', facebookLogin);            // GET /api/v1/auth/facebook
router.get('/facebook/callback', facebookCallback);// GET /api/v1/auth/facebook/callback

// Apple OAuth
router.get('/apple', appleLogin);                  // GET /api/v1/auth/apple
router.get('/apple/callback', appleCallback);      // GET /api/v1/auth/apple/callback

// Twitter OAuth
router.get('/twitter', twitterLogin);              // GET /api/v1/auth/twitter
router.get('/twitter/callback', twitterCallback);  // GET /api/v1/auth/twitter/callback

export default router;

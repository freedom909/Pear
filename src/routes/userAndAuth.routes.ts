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
import {
  googleLogin,
  googleCallback,
} from '../controllers/oauth/google.controller';
import {
  getUsers,  
  getUserById,
  createUser,
  deleteUser,
  changeUserRole,
} from '../controllers/user.controller';
import { auth, role } from '../middleware/auth';
import { UserRole } from '../models/interface';

const router = Router();

/**
 * ========================
 * Public auth routes
 * ========================
 */
router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

/**
 * ========================
 * Private auth routes
 * ========================
 */
router.get('/me', getMe);                            // GET /api/v1/user/me
router.put('/updatedetails', updateDetails);        // PUT /api/v1/user/updatedetails
router.put('/updatepassword', updatePassword);      // PUT /api/v1/user/updatepassword


/**
 * ========================
 * OAuth Provider
 * ========================
 */
// Google OAuth
router.get('/google', googleLogin);                    // GET /api/v1/user/google
router.get('/google/callback', googleCallback);        // GET /api/v1/user/google/callback
// Facebook OAuth
router.get('/facebook', facebookLogin);                // GET /api/v1/user/facebook
router.get('/facebook/callback', facebookCallback);    // GET /api/v1/user/facebook/callback
// Apple OAuth
router.get('/apple', appleLogin);                      // GET /api/v1/user/apple
router.get('/apple/callback', appleCallback);          // GET /api/v1/user/apple/callback
// Twitter OAuth
router.get('/twitter', twitterLogin);                  // GET /api/v1/user/twitter
router.get('/twitter/callback', twitterCallback);      // GET /api/v1/user/twitter/callback

/**
 * ========================
 * Authenticated routes
 * ========================
 */
router.use(auth); // require auth for routes below

// User profile routes
router.get('/me', getMe);                            // GET /api/v1/user/me
router.put('/updatedetails', updateDetails);        // PUT /api/v1/user/updatedetails
router.put('/updatepassword', updatePassword);      // PUT /api/v1/user/updatepassword

/**
 * ========================
 * Admin routes
 * ========================
 */
// Assuming the role middleware expects a single string, we might need to handle each role separately.
// Here we use multiple router.use calls for each role.
router.use(role(UserRole.ADMIN));
router.use(role(UserRole.SUPER_ADMIN));

// User management
router.get('/', getUsers);                           // GET /api/v1/user/
router.post('/', createUser);                        // POST /api/v1/user/
router.get('/:id', getUserById);                     // GET /api/v1/user/:id                // PUT /api/v1/user/:id
router.delete('/:id', deleteUser);                   // DELETE /api/v1/user/:id
router.put('/:id/role', changeUserRole);             // PUT /api/v1/user/:id/role

export default router;

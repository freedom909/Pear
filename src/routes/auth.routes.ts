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
import { auth,role} from '../middleware/auth';
import { UserRole } from '../models/interface/index';
import userService from '@/services/user.service';

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

/**
 * ========================
* Admin Providers
* ========================
*/



// Apply admin role check to all routes below
router.use((req, res, next) => {

if (typeof role === 'function') {
// Assume the role function now accepts a single string, so we need to adjust the way we pass roles.
// Here we pick the first role as an example, you may need to adjust the logic according to the actual situation.
if ([UserRole.ADMIN, UserRole.SUPER_ADMIN].length > 0) {
  role([UserRole.ADMIN, UserRole.SUPER_ADMIN][0])(req as any, res, next);
} else {
  console.error('No valid roles provided.');
  next(new Error('No valid roles for authorization.'));
}
} else {
  console.error('The "role" function is not defined. Please check the import.');
  next(new Error('Authorization middleware is not available.'));
}
 });
  

// Get all users (paginated)
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const usersResponse = await userService.getUsers(page, limit);
    res.json(usersResponse);
  } catch (error) {
    next(error);
  }
});

// Get single user
router.get('/:id', async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Update user (admin privileges)
router.put('/:id', async (req, res, next) => {
  try {
    const updatedUser = await userService.updateUserAdmin(
      req.params.id,
      req.body
    );
    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
});

// Delete user
router.delete('/:id', async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;





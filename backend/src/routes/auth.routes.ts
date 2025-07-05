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
  refreshToken,
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
import { googleLogin, googleCallback } from '../controllers/oauth/google.controller';
import {
  getUsers,
  getUserById,
  createUser,
  deleteUser,
  changeUserRole,
} from '../controllers/user.controller';
import { protect} from '../middleware/auth';
import { role } from '../middleware/role';


export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MANAGER = 'manager',
}

const router = Router();
/**
 * ========================
 * Public routes
 * ========================
 */
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.post('/refresh-token', refreshToken); // Add refresh token endpoint

/**
 * ========================
 * OAuth routes
 * ========================
 */
// your OAuth routes here...
/**
 * ========================
 * OAuth routes
 * ========================
 */
// Google
router.get('/google', googleLogin);
router.get('/google/callback', googleCallback);

// Facebook
router.get('/facebook', facebookLogin);
router.get('/facebook/callback', facebookCallback);

// Apple
router.get('/apple', appleLogin);
router.get('/apple/callback', appleCallback);

// Twitter
router.get('/twitter', twitterLogin);
router.get('/twitter/callback', twitterCallback);

/**
 * ========================
 * Authenticated routes
 * ========================
 */
router.use(protect); // require authentication for everything below

router.get('/me', getMe); // Now req.user will ALWAYS be set

router.put('/updatedetails', updateDetails);
router.put('/updatepassword', updatePassword);

/**
 * ========================
 * Admin routes
 * ========================
 */
router.use(role(UserRole.ADMIN) as any);//Argument of type '"admin"' is not assignable to parameter of type 'UserRole'
router.use (role(UserRole.ADMIN) as any); // Argument of type '"admin"' is not assignable to parameter of type 'UserRole'
router.get('/', getUsers);
router.post('/', createUser);
router.get('/:id', getUserById);
router.delete('/:id', deleteUser);
router.put('/:id/role', changeUserRole);

export default router;
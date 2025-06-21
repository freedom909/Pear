import express from 'express';
import {
  register,
  login,
  getMe,
  updateUser,
  updatePassword,
  forgotPassword,
  resetPassword,
  getUsers,
  getUser,
  updateUserAdmin,
  deleteUser
} from '../controllers/userController';
import { auth } from '../middleware/auth';
import { UserRole } from '../models/interface';
import { loginLimiter } from '../middleware/rateLimiter';

const router = express.Router();

// 公共路由
router.post('/register', register);
router.post('/login', loginLimiter, login);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

// 需要认证的路由
router.use(auth);

router.get('/me', getMe);
router.put('/updatedetails', updateUser);
router.put('/updatepassword', updatePassword);

// 管理员路由
router.use([UserRole.ADMIN, UserRole.SUPER_ADMIN]);// is this ok?

router.get('/', getUsers);
router.get('/:id', getUser);
router.put('/:id', updateUserAdmin);
router.delete('/:id', deleteUser);

export default router;
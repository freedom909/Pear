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
} from '../controllers/userController.ts';
import { auth } from '../middleware/auth.ts';
import {UserRole}  from '../models/interface/index.ts';
import { role } from '../middleware/auth.ts';
import { loginLimiter } from '../middleware/rateLimiter.ts';

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
router.use((req, res, next) => {
// Assuming UserRole is an enum and needs to be imported correctly as a value
// If UserRole is a type, we need to have a corresponding value representation
// Here we assume UserRole is an enum and the import is correct as a value
  role([UserRole.ADMIN, UserRole.SUPER_ADMIN] as any)(req, res, next);//'UserRole' only refers to a type, but is being used as a value here
});

router.get('/', getUsers);
router.get('/:id', getUser);
router.put('/:id', updateUserAdmin);
router.delete('/:id', deleteUser);

export default router;
import { Router } from 'express';
import {
  getUsers, 
  getUser,//is the same as getUserById 
  createUser,
  updateUser,
  deleteUser,
  changeUserRole,
} from '../controllers/user.controller';
import { protect, authorize} from '../middleware/auth';
import { UserRole } from '../models/interface';
const router = Router();

// 所有用户路由都需要认证和管理员权限
router.use(protect);
router.use(authorize(UserRole.ADMIN));

// 用户CRUD路由
router.route('/')
  .get(getUsers)
  .post(createUser);

router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

router.put('/:id/role', changeUserRole);


export default router;
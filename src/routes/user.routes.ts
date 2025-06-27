//routes/user.routes.ts
import express from 'express';
import {
  createUserValidator,
  updateUserValidator,
  getUserValidator,
  deleteUserValidator
} from '../validators/user.validator';
import { userController } from '../controllers/user.controller';

const router = express.Router();


// Create a new user
router.post('/', 
  createUserValidator,
  userController.createUser
);

// Get user by ID
router.get('/:id',
  getUserValidator,
  userController.getUser
);

// Update user
router.put('/:id',
  updateUserValidator,
  userController.updateUser
);

// Delete user
router.delete('/:id',
  deleteUserValidator,
  userController.deleteUser
);

export default router;
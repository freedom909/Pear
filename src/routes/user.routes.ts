//routes/user.routes.ts
import express from 'express';
import {
  createUserValidator,
  updateUserValidator,
  getUserValidator,
  deleteUserValidator
} from '../validators/user.validator';

import * as userController from '../controllers/user.controller';

const router = express.Router();


// Create a new user
router.post('/', 
  createUserValidator,
  userController.createUser
);

// Get user by ID
router.get('/:id',
  getUserValidator,
  userController.getUserById
);

// Update user
router.put('/:id',
  updateUserValidator,
  userController.updateMe
);

// Delete user
router.delete('/:id',
  deleteUserValidator,
  userController.deleteUser
);

export default router;
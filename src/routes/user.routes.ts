// routes/user.routes.ts
import express from 'express';
import {
  validateBody,
  validateQuery,
  createUserSchema,
  updateUserSchema,
  userIdParamSchema
} from '../validators/user.validator';
import * as userController from '../controllers/user.controller';

const router = express.Router();

// Create a new user
router.post(
  '/',
  validateBody(createUserSchema),
  userController.createUser
);

// Get user by ID
router.get(
  '/:id',
  validateQuery(userIdParamSchema), // validate the ":id" param
  userController.getUserById
);

// Update user
router.put(
  '/:id',
  validateQuery(userIdParamSchema), // validate ":id"
  validateBody(updateUserSchema),   // validate body
  userController.updateMe
);

// Delete user
router.delete(
  '/:id',
  validateQuery(userIdParamSchema),
  userController.deleteUser
);

export default router;

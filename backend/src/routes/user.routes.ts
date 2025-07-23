// routes/user.routes.ts
import express from "express";
import {
  validateBody,
  validateQuery,
  createUserSchema,
  updateUserSchema,
  userIdParamSchema,
} from "../validators/user.validator";
import * as userController from "../controllers/user.controller";
import { corsPreflightHandler } from "../middleware/corsPreflightHandler";
import { protect } from "../middleware/auth";

const router = express.Router();

router.use(protect);

// CORS preflight
router.options("*", corsPreflightHandler);

// Get current user profile
router.get("/me", userController.getMe);

// Create new user
router.post("/", validateBody(createUserSchema), userController.createUser);

// Get user by ID
router.get(
  "/:id",
  validateQuery(userIdParamSchema),
  userController.getUserById
);

// Update user
router.put(
  "/:id",
  validateQuery(userIdParamSchema),
  validateBody(updateUserSchema),
  userController.updateMe
);

// Delete user
router.delete(
  "/:id",
  validateQuery(userIdParamSchema),
  userController.deleteUser
);

export default router;
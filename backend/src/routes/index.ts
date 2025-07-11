// routes/index.ts
import express from "express";
import { publicRouter, protectedRouter } from "./auth.routes";
import userRoutes from "./user.routes";

const router = express.Router();

// Public authentication routes
router.use("/api/v1/auth", publicRouter);

// Protected authentication routes
router.use("/api/v1/auth", protectedRouter);

// Protected user routes
router.use("/api/v1/user", userRoutes);

export default router;

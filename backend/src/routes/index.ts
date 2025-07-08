import express from "express";
import { publicRouter, protectedRouter } from "./auth.routes";
import userRoutes from "./user.routes";

const router = express.Router();

// ✅ Public auth routes (login, register, OAuth callbacks)
router.use("/api/v1/auth", publicRouter);

// ✅ Protected auth routes (must be logged in)
router.use("/api/v1/auth", protectedRouter);

// ✅ Other protected routes (must be logged in)
router.use("/api/v1/user", userRoutes);

export default router;

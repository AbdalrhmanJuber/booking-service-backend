import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { User } from "../models/User";
import pool from "../config/database";
import { authRateLimit } from "../config/rateLimits";
import { validateUserInput } from "../middlewares/validateUser";

const router = Router();
const authController = new AuthController(new User(pool));

router.post("/login", authRateLimit, authController.login.bind(authController));
router.post(
  "/register",
  validateUserInput,
  authController.register.bind(authController),
);

// 🔹 Step 1: User requests password reset (generate token)
router.post("/forgot-password", authController.forgotPassword.bind(authController));

// 🔹 Step 2: User resets password using the token
router.post("/reset-password", authController.requesetPasswordReset.bind(authController));
export default router;

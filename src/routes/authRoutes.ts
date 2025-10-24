import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { User } from "../models/User";
import pool from "../config/database";
import { authRateLimit } from "../config/rateLimits";
import { validateUserInput } from "../middlewares/validateUser";

const router = Router();
const authController = new AuthController(new User(pool));

router.post("/register", authController.register);

router.post("/login", authRateLimit, authController.login.bind(authController));
router.post(
  "/register",
  validateUserInput,
  authController.register.bind(authController),
);
export default router;

import { Router } from "express";
import { UserController } from "../controllers/userController";
import { validateUserInput } from "../middlewares/validateUser";
import { authenticate } from "../middlewares/authMiddleware";
import { User } from "../models/User";
import pool from "../config/database";
import { authRateLimit } from "../config/rateLimits";

const router = Router();
const userModel = new User(pool);
const controller = new UserController(userModel);

router.get("/", authenticate, controller.getAll.bind(controller));
router.get("/:id", authenticate, controller.getById.bind(controller));
router.put(
  "/:id",
  authenticate,
  validateUserInput,
  controller.update.bind(controller),
);
router.delete("/:id", authenticate, controller.delete.bind(controller));

router.post("/login",authRateLimit,controller.authenticateUser.bind(controller)); // login
router.post("/", validateUserInput, controller.create.bind(controller)); // Register
export default router;

import { NextFunction, Request, Response } from "express";
import { User } from "../models/User";
import { generateToken } from "../helpers/jwt";
import { ValidationError } from "../utils/validators";
import { asyncHandler } from "../middlewares/errorHandler";
import { DuplicateEmailError, NotFoundError } from "../utils/errors";

export class AuthController {
  constructor(private userModel: User) {}

  // POST /api/auth/register
  register = asyncHandler(async (req: Request, res: Response) => {
    try {
      const newUser = await this.userModel.create(req.body);

      const token = generateToken({
        id: newUser.id!,
        full_name: newUser.full_name,
        email: newUser.email,
        phone: newUser.phone,
      });

      res.status(201).json({
        message: "User registered successfully",
        user: {
          id: newUser.id,
          full_name: newUser.full_name,
          email: newUser.email,
          phone: newUser.phone,
        },
        token,
      });
    } catch (error: any) {
      if (error.code === "23505") {
        throw new DuplicateEmailError("Email already exists");
      }
      throw error;
    }
  });

  // POST /api/auth/login
  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ValidationError("Missing required fields: email or password");
    }

    const user = await this.userModel.authenticate(email, password);
    if (!user) {
      throw new ValidationError("Invalid credentials");
    }

    const token = generateToken({
      id: user.id!,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
    });

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
      },
      token,
    });
  });

  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
      throw new ValidationError("Missing required fields: email");
    }
    const user = await this.userModel.getByEmail(email);

    if (!user) throw new NotFoundError("User not found");

    const resetToken = await this.userModel.createPasswordResettoken(email!);

    res.status(200).json({
      message: "Password reset link generated successfully",
      resetToken, // ⚠️ remove in production
    });
  });

  requesetPasswordReset = async (req: Request, res: Response) => {};
}

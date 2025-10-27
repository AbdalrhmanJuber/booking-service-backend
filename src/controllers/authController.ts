import { NextFunction, Request, Response } from "express";
import { User } from "../models/User";
import { ValidationError } from "../utils/validators";
import { asyncHandler } from "../middlewares/errorHandler";
import {
  DuplicateEmailError,
  EmailError,
  NotFoundError,
} from "../utils/errors";
import { sendEmail } from "../utils/email";
import crypto from "crypto";
import { createSendToken } from "../utils/createSendtoken";

export class AuthController {
  constructor(private userModel: User) {}

  register = asyncHandler(async (req, res) => {
    try {
      const newUser = await this.userModel.create(req.body);
      createSendToken(newUser, 201, res, "User registered successfully");
    } catch (error: any) {
      if (error.code === "23505") {
        throw new DuplicateEmailError("Email already exists");
      }
      throw error;
    }
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ValidationError("Missing required fields: email or password");
    }

    const user = await this.userModel.authenticate(email, password);
    if (!user) {
      throw new ValidationError("Invalid credentials");
    }

    createSendToken(user, 200, res, "Login successful");
  });

  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) throw new ValidationError("Missing required fields: email");

    const user = await this.userModel.getByEmail(email);
    if (!user) throw new NotFoundError("User not found");

    const resetToken = await this.userModel.createPasswordResettoken(
      user.email,
    );

    const resetURL = `${process.env.FRONTEND_URL}/customer/new-password?token=${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password to: ${resetURL}.
If you didn't request a password reset, please ignore this email.`;
    try {
      await sendEmail({
        to: user.email,
        subject: "Your password reset token (valid for 15 min)",
        text: message,
      });

      res.status(200).json({
        message: "Password reset link sent successfully",
      });
    } catch (error: any) {
      console.error("❌ Email sending failed:", error.message);

      await this.userModel.clearResetToken(user.id!);

      throw new EmailError(
        "There was an error sending the password reset email.",
      );
    }
  });

  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      throw new ValidationError(
        "Missing required fields: token or newPassword",
      );
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // 3️⃣ Find the user by hashed token and ensure it's not expired
    const user = await this.userModel.findPasswordHashToken(hashedToken);
    if (!user) throw new NotFoundError("Invalid or expired reset token");

    // 4️⃣ Reset password using new model method
    await this.userModel.resetPassword(user.id!, newPassword);

    createSendToken(user, 200, res, "Password reset successful");
  });
}

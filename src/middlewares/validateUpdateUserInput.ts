import { Request, Response, NextFunction } from "express";
import {
  ValidationError,
  validateFullName,
  validatePalestinePhone,
  validatePassword,
} from "../utils/validators";

export const validateUpdateUserInput = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fullName, phone, password } = req.body;

    // If no fields provided, return error
    if (!fullName && !phone && !password) {
      return res.status(400).json({
        message: "At least one field (fullName, phone, or password) must be provided",
      });
    }

    // Validate only provided fields
    if (fullName) validateFullName(fullName);
    if (phone) validatePalestinePhone(phone);
    if (password) validatePassword(password);

    next();
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(400).json({ message: err.message });
    }
    next(err);
  }
};


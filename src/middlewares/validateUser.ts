import { Request, Response, NextFunction } from "express";
import {
  ValidationError,
  getMissingFields,
  validateFullName,
  validatePalestinePhone,
  validateEmail,
  validatePassword,
} from "../utils/validators";

export const validateUserInput = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { fullName, email, phone, password } = req.body;

    // Check missing fields
    const missing = getMissingFields(req.body, [
      "fullName",
      "email",
      "phone",
      "password",
    ]);
    if (missing.length) {
      return res
        .status(400)
        .json({ message: `Missing required fields: ${missing.join(", ")}` });
    }

    // Validate fields
    validateFullName(fullName);
    validateEmail(email);
    validatePalestinePhone(phone);
    validatePassword(password);

    next();
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(400).json({ message: err.message });
    }
    next(err);
  }
};

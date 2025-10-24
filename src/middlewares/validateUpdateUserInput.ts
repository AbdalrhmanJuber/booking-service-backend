import { Request, Response, NextFunction } from "express";
import {
  ValidationError,
  getMissingFields,
  validateFullName,
  validatePalestinePhone,
  validatePassword,
} from "../utils/validators";

export const validateUpdateUserInput = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { fullName, phone, password } = req.body;

    // If no fields provided, return error
    const missing = getMissingFields(req.body, [
      "fullName",
      "phone",
      "password",
    ]);
    if (missing.length) {
      return res
        .status(400)
        .json({ message: `Missing required fields: ${missing.join(", ")}` });

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

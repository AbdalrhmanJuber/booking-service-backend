import { Request, Response, NextFunction } from "express";

export const validateUserInput = (req: Request, res: Response, next: NextFunction) => {
  const { firstName, lastName, password} = req.body;

  if (!firstName || !lastName || !password) {
    return res.status(400).json({ message: "Missing required fields: firstName, lastName, password" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long" });
  }

  next();
};


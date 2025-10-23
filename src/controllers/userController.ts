import { Request, Response } from "express";
import { User } from "../models/User";
import { generateToken } from "../helpers/jwt";
import { ValidationError } from "../utils/validators";
import { asyncHandler } from "../middlewares/errorHandler"; // import your wrapper
import { DuplicateEmailError, NotFoundError } from "../utils/errors";

type EmailParams = { email?: string };

export class UserController {
  constructor(private userModel: User) {}

  // GET /api/users
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const users = await this.userModel.getAll();
    res.json(users);
  });

  // GET /api/users/:email
  getByEmail = asyncHandler(async (req: Request, res: Response) => {
    const email = req.params.email!;
    const user = await this.userModel.getByEmail(email);

    if (!user) throw new NotFoundError("User not found");

    res.json(user);
  });

  // POST /api/users
  create = asyncHandler(async (req: Request, res: Response) => {
    try {
      const newUser = await this.userModel.create(req.body);

      const token = generateToken({
        id: newUser.id!,
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,
      });

      res.status(201).json({
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,
        token,
      });
    } catch (error: any) {
      if (error.code === "23505") {
        throw new DuplicateEmailError("Email already exists");
      }
      throw error;
    }
  });

  // PUT /api/users/:email
  update = asyncHandler(async (req: Request<EmailParams>, res: Response) => {
    const email = req.params.email!;
    const updated = await this.userModel.update(email, req.body);

    if (!updated) throw new NotFoundError("User not found");

    res.json(updated);
  });

  // DELETE /api/users/:email
  delete = asyncHandler(async (req: Request<EmailParams>, res: Response) => {
    const email = req.params.email!;
    const deleted = await this.userModel.delete(email);

    if (!deleted) throw new NotFoundError("User not found");

    res.json({ message: "User deleted" });
  });

  // POST /api/users/authenticate
  authenticateUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await this.userModel.authenticate(email, password);

    if (!user) {
      throw new ValidationError("Invalid credentials");
    }

    const token = generateToken({
      id: user.id!,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
    });

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
      },
      token,
    });
  });
}

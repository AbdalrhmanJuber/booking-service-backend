import { Request, Response } from "express";
import { User, IUser } from "../models/User";
import { generateToken } from "../helpers/jwt";
import { parseId, ValidationError } from "../utils/validators";

type EmailParams = { email: string };

export class UserController {
  constructor(private userModel: User) {}

  async getAll(req: Request, res: Response) {
    try {
      const users = await this.userModel.getAll();
      res.json(users);
    } catch (error) {
      console.error("Error getting all users:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async getByEmail(req: Request<{ email: string }>, res: Response) {
    try {
      const email = req.params?.email;
      const user = await this.userModel.getByEmail(email);
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ message: error.message });
      }
      console.error("Error getting user by Email:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async create(req: Request, res: Response) {
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
        return res.status(400).json({ message: "Email already exists" });
      }
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async update(req: Request<EmailParams>, res: Response) {
    try {
      const email = req.params?.email;
      const updated = await this.userModel.update(email, req.body);
      if (!updated) return res.status(404).json({ message: "User not found" });
      res.json(updated);
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ message: error.message });
      }
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async delete(req: Request<EmailParams>, res: Response) {
    try {
      const email = req.params?.email;
      const deleted = await this.userModel.delete(email);
      if (!deleted) return res.status(404).json({ message: "User not found" });
      res.json({ message: "User deleted" });
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ message: error.message });
      }
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async authenticateUser(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const user = await this.userModel.authenticate(email, password);

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
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
        token: token,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
}

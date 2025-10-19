import { Request, Response } from "express";
import { User, IUser } from "../models/User";
import { generateToken } from "../helpers/jwt";
import { parseId, ValidationError } from "../utils/validators";


type IdParams = { id: string };

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

  async getById(req: Request<IdParams>, res: Response) {
    try {
      const id = parseId(req.params?.id, "user");
      const user = await this.userModel.getById(id);
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ message: error.message });
      }
      console.error("Error getting user by ID:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const newUser = await this.userModel.create(req.body);

      const token = generateToken({
        id: newUser.id!,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
      });

      res.status(201).json({
        ...newUser,
        token: token,
      });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async update(req: Request<IdParams>, res: Response) {
    try {
      const id = parseId(req.params?.id, "user");
      const updated = await this.userModel.update(id, req.body);
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

  async delete(req: Request<IdParams>, res: Response) {
    try {
      const id = parseId(req.params?.id, "user");
      const deleted = await this.userModel.delete(id);
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
      const { firstName, password } = req.body;
      const user = await this.userModel.authenticate(firstName, password);

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = generateToken({
        id: user.id!,
        firstName: user.firstName,
        lastName: user.lastName,
      });

      res.json({
        message: "Login successful",
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        token: token,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
}

import { Pool } from "pg";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import crypto from "crypto";

dotenv.config();

export interface IUser {
  id?: string; // UUID from the database
  full_name: string;
  email: string;
  phone?: string;
  birthday?: Date; // optional birthday field
  password: string; // store the hashed password
  passwordResetToken?: string | null;
  passwordResetExpires?: Date | null;
  isEmailVerified?: boolean;
  status?: "pending" | "active" | "disabled";
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  private pepper = process.env.BCRYPT_PASSWORD || "";
  private saltRounds = parseInt(process.env.SALT_ROUNDS || "10", 10);

  constructor(private pool: Pool) {}
  private async hashPassword(password: string): Promise<string> {
    const saltedPassword = password + this.pepper;
    const salt = await bcrypt.genSalt(this.saltRounds);
    const hash = await bcrypt.hash(saltedPassword, salt);
    return hash;
  }

  private async comparePassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    const saltedPassword = password + this.pepper;
    return await bcrypt.compare(saltedPassword, hash);
  }

  async createPasswordResettoken(email: string): Promise<string> {
    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await this.pool.query(
      `
    UPDATE users
    SET "password_reset_token" = $1,
        "password_reset_expires" = $2
    WHERE email = $3
    `,
      [hashedToken, expiresAt, email],
    );

    return resetToken;
  }
  async clearResetToken(userId: string): Promise<void> {
    await this.pool.query(
      `UPDATE users
     SET "password_reset_token" = NULL,
         "password_reset_expires" = NULL
     WHERE id = $1`,
      [userId],
    );
  }

  async getAll(): Promise<IUser[]> {
    const result = await this.pool.query(
      `SELECT
         id,
         "full_name",
         "email",
         "phone"
       FROM users`,
    );
    return result.rows;
  }

  async getByEmail(email: string): Promise<IUser | null> {
    const result = await this.pool.query(
      `SELECT
         id,
         "full_name",
         "email",
         "phone"
       FROM users
       WHERE email = $1`,
      [email],
    );
    return result.rows[0] || null;
  }

  async create(user: IUser): Promise<IUser> {
    const hashedPassword = await this.hashPassword(user.password);
    const result = await this.pool.query(
      `INSERT INTO users ("full_name", "email", "phone","password") VALUES ($1, $2, $3, $4) RETURNING
         id,
         "full_name",
         "email",
         "phone"`,
      [user.full_name, user.email, user.phone, hashedPassword],
    );
    return result.rows[0];
  }

  async update(email: string, user: IUser): Promise<IUser | null> {
    const hashedPassword = await this.hashPassword(user.password);
    const result = await this.pool.query(
      `UPDATE users
         SET "full_name" = $1,
              "phone" = $2,
             "password"  = $3
       WHERE email = $4
       RETURNING
         id,
         "full_name" ,
         "email",
         "phone"`,
      [user.full_name, user.phone, hashedPassword, email],
    );
    return result.rows[0] || null;
  }

  async delete(email: string): Promise<boolean> {
    const result = await this.pool.query("DELETE FROM users WHERE email = $1", [
      email,
    ]);
    return result.rowCount! > 0;
  }

  async authenticate(email: string, password: string): Promise<IUser | null> {
    const result = await this.pool.query(
      `SELECT id, "full_name", "email", "phone", "password"
        FROM users
        WHERE "email" = $1`,
      [email],
    );

    const user = result.rows[0];

    if (user && (await this.comparePassword(password, user.password))) {
      return user;
    }
    return null;
  }
}

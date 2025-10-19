import { Pool } from "pg";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

export interface IUser {
  id?: number;
  fullName: string;
  email: string;
  phone: string;
  password: string;
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
  async getAll(): Promise<IUser[]> {
    const result = await this.pool.query(
      `SELECT
         id,
         "fullName",
         "email",
         "phone",
         "password"
       FROM users`,
    );
    return result.rows;
  }

  async getByEmail(email: string): Promise<IUser | null> {
    const result = await this.pool.query(
      `SELECT
         id,
         "fullName",
         "email",
         "phone",
         "password"
       FROM users
       WHERE email = $1`,
      [email],
    );
    return result.rows[0] || null;
  }

  async create(user: IUser): Promise<IUser> {
    const hashedPassword = await this.hashPassword(user.password);
    const result = await this.pool.query(
      `INSERT INTO users ("fullName", "email", "phone","password") VALUES ($1, $2, $3, $4) RETURNING id, "fullName",
         "email",
         "phone",
         "password" `,
      [user.fullName, user.email, user.phone, hashedPassword],
    );
    return result.rows[0];
  }

  async update(email: string, user: IUser): Promise<IUser | null> {
    const hashedPassword = await this.hashPassword(user.password);
    const result = await this.pool.query(
      `UPDATE users
         SET "fullName" = $1,
              "phone" = $2,
             "password"  = $3
       WHERE email = $4
       RETURNING
         id,
         "fullName" ,
         "email",
        "phone",
         "password" `,
      [user.fullName, user.phone,hashedPassword, email],
    );
    return result.rows[0] || null;
  }

  async delete(email: string): Promise<boolean> {
    const result = await this.pool.query("DELETE FROM users WHERE email = $1", [
      email,
    ]);
    return result.rowCount! > 0;
  }

  async authenticate(
    email: string,
    password: string,
  ): Promise<IUser | null> {
    const result = await this.pool.query(
      `SELECT id, "fullName", "email", "phone", "password"
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

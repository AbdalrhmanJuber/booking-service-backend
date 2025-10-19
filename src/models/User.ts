import { Pool } from "pg";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

export interface IUser {
  id?: number;
  firstName: string;
  lastName: string;
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
         "firstName",
         "lastName" ,
         "password"
       FROM users`,
    );
    return result.rows;
  }

  async getById(id: number): Promise<IUser | null> {
    const result = await this.pool.query(
      `SELECT

         id,
         "firstName",
         "lastName" ,
         "password"
       FROM users
       WHERE id = $1`,
      [id],
    );
    return result.rows[0] || null;
  }

  async create(user: IUser): Promise<IUser> {
    const hashedPassword = await this.hashPassword(user.password);
    const result = await this.pool.query(
      `INSERT INTO users ("firstName", "lastName", "password") VALUES ($1, $2, $3) RETURNING id, "firstName",
         "lastName" ,
         "password" `,
      [user.firstName, user.lastName, hashedPassword],
    );
    return result.rows[0];
  }

  async update(id: number, user: IUser): Promise<IUser | null> {
    const hashedPassword = await this.hashPassword(user.password);
    const result = await this.pool.query(
      `UPDATE users
         SET "firstName" = $1,
             "lastName"  = $2,
             "password"  = $3
       WHERE id = $4
       RETURNING
         id,
         "firstName" ,
         "lastName" ,
         "password" `,
      [user.firstName, user.lastName, hashedPassword, id],
    );
    return result.rows[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.pool.query("DELETE FROM users WHERE id = $1", [id]);
    return result.rowCount! > 0;
  }

  async authenticate(
    firstName: string,
    password: string,
  ): Promise<IUser | null> {
    const result = await this.pool.query(
      `SELECT id, "firstName", "lastName", "password"
        FROM users
        WHERE "firstName" = $1`,
      [firstName],
    );

    const user = result.rows[0];

    if (user && (await this.comparePassword(password, user.password))) {
      return user;
    }
    return null;
  }
}

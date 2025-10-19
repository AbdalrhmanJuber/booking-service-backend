import supertest from "supertest";
import app from "../server";
import pool from "../config/database";

const request = supertest(app);

describe("User API Endpoints", () => {
  let userId: number;
  let authToken: string;

  beforeAll(async () => {
    await pool.query("DELETE FROM users;");
  });

  describe("POST /api/users - Create User", () => {
    it("should create a new user successfully", async () => {
      const res = await request.post("/api/users").send({
        firstName: "Alice",
        lastName: "Smith",
        password: "hashed_password_123",
      });

      expect(res.status).toBe(201);
      expect(res.body).toBeDefined();
      expect(res.body.firstName).toBe("Alice");
      expect(res.body.lastName).toBe("Smith");
      expect(res.body.token).toBeDefined();

      // Store for subsequent tests
      userId = res.body.id;
      authToken = res.body.token;
    });

    it("should return 400 when required fields are missing", async () => {
      const res = await request.post("/api/users").send({
        firstName: "Updated",
        password: "new_password",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe(
        "Missing required fields: firstName, lastName, password"
      );
    });

    it("should return 400 when password is less than 6 characters", async () => {
      const res = await request.post("/api/users").send({
        firstName: "Alice",
        lastName: "Smith",
        password: "1234",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Password must be at least 6 characters long");
    });
  });

  describe("GET /api/users/:id - Get User", () => {
    it("should retrieve a user by ID successfully", async () => {
      const res = await request
        .get(`/api/users/${userId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(userId);
      expect(res.body.firstName).toBe("Alice");
    });

    it("should return 404 when user does not exist", async () => {
      const res = await request
        .get("/api/users/99999")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("User not found");
    });
  });

  describe("PUT /api/users/:id - Update User", () => {
    it("should update a user successfully", async () => {
      const res = await request
        .put(`/api/users/${userId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          firstName: "Updated",
          lastName: "Name",
          password: "new_password",
        });

      expect(res.status).toBe(200);
      expect(res.body.firstName).toBe("Updated");
      expect(res.body.lastName).toBe("Name");
    });
  });

  describe("DELETE /api/users/:id - Delete User", () => {
    it("should delete a user successfully", async () => {
      const res = await request
        .delete(`/api/users/${userId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("User deleted");
    });
  });
});

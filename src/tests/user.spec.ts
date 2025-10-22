import supertest from "supertest";
import app from "../server";
import pool from "../config/database";

const request = supertest(app);

describe("User API Endpoints", () => {
  let userEmail: string;
  let authToken: string;

  beforeAll(async () => {
    // Clear the users table before tests
    await pool.query("DELETE FROM users;");
  });

  describe("POST /api/users - Create User", () => {
    it("should create a new user successfully", async () => {
      const res = await request.post("/api/users/signup").send({
        fullName: "Alice",
        email: "example@test.com",
        phone: "0599123456", // Valid Palestinian number
        password: "hashed_password_123",
      });

      expect(res.status).toBe(201);
      expect(res.body).toBeDefined();
      expect(res.body.fullName).toBe("Alice");
      expect(res.body.email).toBe("example@test.com");
      expect(res.body.token).toBeDefined();

      // Store for subsequent tests
      userEmail = res.body.email;
      authToken = res.body.token;
    });
    it("should return 400 when trying to create a user with an existing email", async () => {
      const res = await request.post("/api/users/signup").send({
        fullName: "Duplicate Alice",
        email: "example@test.com", // same email as before
        phone: "0599111111",
        password: "another_password_123",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Email already exists");
    });
    it("should return 400 when required fields are missing", async () => {
      const res = await request.post("/api/users/signup").send({
        email: "missing@test.com",
        password: "new_password",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Missing required fields:/);
    });

    it("should return 400 when password is less than 6 characters", async () => {
      const res = await request.post("/api/users/signup").send({
        fullName: "Bob",
        email: "bob@test.com",
        phone: "0599234567",
        password: "1234",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe(
        "Password must be at least 6 characters long",
      );
    });

    it("should return 400 for invalid Palestinian phone numbers", async () => {
      const res = await request.post("/api/users/signup").send({
        fullName: "Charlie",
        email: "charlie@test.com",
        phone: "0123456789", // Invalid
        password: "securePassword",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe(
        "Phone number is invalid. It must be a valid Palestinian phone number.",
      );
    });

    it("should return 400 for invalid email format", async () => {
      const res = await request.post("/api/users/signup").send({
        fullName: "Dana",
        email: "invalid-email",
        phone: "0599123456",
        password: "securePassword",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid email format");
    });
  });

  describe("GET /api/users/:email - Get User", () => {
    it("should retrieve a user by email successfully", async () => {
      const res = await request
        .get(`/api/users/${userEmail}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.email).toBe(userEmail);
      expect(res.body.fullName).toBe("Alice");
    });

    it("should return 404 when user does not exist", async () => {
      const res = await request
        .get("/api/users/nonexistent@test.com")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("User not found");
    });
  });

  describe("PUT /api/users/:email - Update User", () => {
    it("should update a user successfully", async () => {
      const res = await request
        .put(`/api/users/${userEmail}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          fullName: "Alice Updated",
          phone: "0599234567",
          password: "new_password",
        });

      expect(res.status).toBe(200);
      expect(res.body.fullName).toBe("Alice Updated");
      expect(res.body.phone).toBe("0599234567");
    });

    it("should return 400 if phone is invalid during update", async () => {
      const res = await request
        .put(`/api/users/${userEmail}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          fullName: "Alice Updated",
          phone: "0000000000", // invalid
          password: "new_password",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe(
        "Phone number is invalid. It must be a valid Palestinian phone number.",
      );
    });

    it("should return 400 if password is too short during update", async () => {
      const res = await request
        .put(`/api/users/${userEmail}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          fullName: "Alice Updated",
          phone: "0599234567",
          password: "123",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe(
        "Password must be at least 6 characters long",
      );
    });

    it("should return 404 if user does not exist during update", async () => {
      const res = await request
        .put("/api/users/nonexistent@test.com")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          fullName: "Test",
          phone: "0599123456",
          password: "newpassword",
        });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("User not found");
    });
  });

  describe("DELETE /api/users/:email - Delete User", () => {
    it("should delete a user successfully", async () => {
      const res = await request
        .delete(`/api/users/${userEmail}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("User deleted");
    });

    it("should return 404 when deleting a non-existing user", async () => {
      const res = await request
        .delete("/api/users/nonexistent@test.com")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("User not found");
    });
  });
});

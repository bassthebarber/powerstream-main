// backend/src/tests/integration/auth.integration.test.js
// Integration tests for auth endpoints
import request from "supertest";
import express from "express";
import { configureExpress } from "../../loaders/express.js";
import authRoutes from "../../api/routes/auth.routes.js";

describe("Auth API Integration Tests", () => {
  let app;

  beforeAll(() => {
    app = express();
    configureExpress(app);
    app.use("/api/auth", authRoutes);
  });

  describe("POST /api/auth/login", () => {
    it("should return 400 if email is missing", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ password: "test123" });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("required");
    });

    it("should return 400 if password is missing", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@example.com" });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("required");
    });

    it("should return 401 for invalid credentials", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "nonexistent@example.com", password: "wrongpassword" });

      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/auth/register", () => {
    it("should return 400 if email is missing", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ password: "test123456" });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("required");
    });

    it("should return 400 if password is too short", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "test@example.com", password: "12345" });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("6 characters");
    });
  });

  describe("GET /api/auth", () => {
    it("should return health check response", async () => {
      const res = await request(app).get("/api/auth");

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("ok");
    });
  });
});





// backend/src/tests/integration/feed.integration.test.js
// Integration tests for feed endpoints
import request from "supertest";
import express from "express";
import { configureExpress } from "../../loaders/express.js";
import feedRoutes from "../../api/routes/feed.routes.js";

describe("Feed API Integration Tests", () => {
  let app;

  beforeAll(() => {
    app = express();
    configureExpress(app);
    app.use("/api/feed", feedRoutes);
  });

  describe("GET /api/feed", () => {
    it("should return feed without authentication (public feed)", async () => {
      const res = await request(app).get("/api/feed");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty("posts");
    });

    it("should accept pagination parameters", async () => {
      const res = await request(app)
        .get("/api/feed")
        .query({ page: 1, limit: 10 });

      expect(res.status).toBe(200);
      expect(res.body.page).toBe(1);
      expect(res.body.limit).toBe(10);
    });
  });

  describe("GET /api/feed/explore", () => {
    it("should return explore feed", async () => {
      const res = await request(app).get("/api/feed/explore");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("GET /api/feed/trending", () => {
    it("should return trending hashtags", async () => {
      const res = await request(app).get("/api/feed/trending");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty("hashtags");
    });
  });

  describe("POST /api/feed", () => {
    it("should require authentication", async () => {
      const res = await request(app)
        .post("/api/feed")
        .send({ text: "Test post" });

      expect(res.status).toBe(401);
    });
  });
});





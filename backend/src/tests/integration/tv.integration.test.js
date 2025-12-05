// backend/src/tests/integration/tv.integration.test.js
// Integration tests for TV endpoints
import request from "supertest";
import express from "express";
import { configureExpress } from "../../loaders/express.js";
import tvRoutes from "../../api/routes/tv.routes.js";

describe("TV API Integration Tests", () => {
  let app;

  beforeAll(() => {
    app = express();
    configureExpress(app);
    app.use("/api/tv", tvRoutes);
  });

  describe("GET /api/tv/stations", () => {
    it("should return list of stations", async () => {
      const res = await request(app).get("/api/tv/stations");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty("stations");
    });

    it("should accept filter parameters", async () => {
      const res = await request(app)
        .get("/api/tv/stations")
        .query({ category: "music", isLive: "true" });

      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/tv/live", () => {
    it("should return live stations", async () => {
      const res = await request(app).get("/api/tv/live");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("GET /api/tv/guide", () => {
    it("should return TV guide", async () => {
      const res = await request(app).get("/api/tv/guide");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("POST /api/tv/stations", () => {
    it("should require authentication", async () => {
      const res = await request(app)
        .post("/api/tv/stations")
        .send({ name: "Test Station" });

      expect(res.status).toBe(401);
    });
  });
});


import request from "supertest";
import app from "../index";

describe("GET /health", () => {
  it("should return a lightweight ok response", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/json/);
    expect(res.body.status).toBe("ok");
    expect(res.body).toHaveProperty("timestamp");
  });
});

describe("GET /health/detailed", () => {
  it("should return detailed health status", async () => {
    const res = await request(app).get("/health/detailed");

    expect([200, 503]).toContain(res.status);
    expect(res.body).toHaveProperty("status");
    expect(res.body).toHaveProperty("uptime");
    expect(res.body).toHaveProperty("version");
    expect(res.body).toHaveProperty("environment");
    expect(res.body).toHaveProperty("timestamp");
    expect(res.body).toHaveProperty("services");
    expect(res.body.services).toHaveProperty("database");
    expect(res.body.services).toHaveProperty("redis");
    expect(res.body.services).toHaveProperty("memory");
  });

  it("should return memory info", async () => {
    const res = await request(app).get("/health/detailed");

    expect(res.body.services.memory).toHaveProperty("used");
    expect(res.body.services.memory).toHaveProperty("total");
    expect(res.body.services.memory).toHaveProperty("percentage");
    expect(res.body.services.memory).toHaveProperty("status");
  });
});

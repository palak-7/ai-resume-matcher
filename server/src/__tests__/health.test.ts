import request from "supertest";
import app from "../index";

describe("Health Check", () => {
  it("should return status ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it("should return json content type", async () => {
    const res = await request(app).get("/health");
    expect(res.headers["content-type"]).toMatch(/json/);
  });

  it("should have a message field", async () => {
    const res = await request(app).get("/health");
    expect(res.body).toHaveProperty("message");
  });
});

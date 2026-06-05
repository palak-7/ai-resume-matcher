import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../index";

let mongoServer: MongoMemoryServer;

// Real MongoDB ki jagah in-memory DB use karo — tests fast aur isolated rehte hain
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  // Har test ke baad users clean karo
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// ── REGISTER TESTS ──────────────────────────────────────────────────────────
describe("POST /api/auth/register", () => {
  it("should register a new user and return token", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Palak Sehgal",
      email: "palak@test.com",
      password: "Password123",
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user.email).toBe("palak@test.com");
  });

  it("should not register with missing fields", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "palak@test.com",
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

  it("should not register duplicate email", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Palak",
      email: "palak@test.com",
      password: "Password123",
    });
    const res = await request(app).post("/api/auth/register").send({
      name: "Palak 2",
      email: "palak@test.com",
      password: "Password456",
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });
});

// ── LOGIN TESTS ─────────────────────────────────────────────────────────────
describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await request(app).post("/api/auth/register").send({
      name: "Palak Sehgal",
      email: "palak@test.com",
      password: "Password123",
    });
  });

  it("should login with correct credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "palak@test.com",
      password: "Password123",
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  it("should not login with wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "palak@test.com",
      password: "Wrongpass123",
    });
    expect(res.status).toBe(401);
  });

  it("should not login with non-existent email", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "nobody@test.com",
      password: "Password123",
    });
    expect(res.status).toBe(401);
  });
});

// ── PROTECTED ROUTE TEST ────────────────────────────────────────────────────
describe("GET /api/auth/me", () => {
  it("should return user data with valid token", async () => {
    const registerRes = await request(app).post("/api/auth/register").send({
      name: "Palak Sehgal",
      email: "palak@test.com",
      password: "Password123",
    });
    const token = registerRes.body.token;

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("palak@test.com");
  });

  it("should reject request without token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });
});

describe("Input Validation", () => {
  it("should reject weak password on register", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Palak",
      email: "palak@test.com",
      password: "abc",
    });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it("should reject invalid email on register", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Palak",
      email: "notanemail",
      password: "Test123",
    });
    expect(res.status).toBe(400);
  });

  it("should reject invalid mongoId on analyse", async () => {
    const loginRes = await request(app).post("/api/auth/register").send({
      name: "Palak",
      email: "palak2@test.com",
      password: "Test123",
    });
    const res = await request(app)
      .post("/api/resume/analyse")
      .set("Authorization", `Bearer ${loginRes.body.token}`)
      .send({ resumeId: "invalid-id", jobDescription: "x".repeat(50) });
    expect(res.status).toBe(400);
  });
});

it("should block NoSQL injection attempt", async () => {
  const res = await request(app)
    .post("/api/auth/login")
    .send({
      email: { $gt: "" },
      password: "anything",
    });
  expect(res.status).toBe(400);
});

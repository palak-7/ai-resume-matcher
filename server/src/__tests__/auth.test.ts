import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../index";
import * as emailService from "../utils/emailService";
import User from "../models/User";
jest.spyOn(emailService, "sendVerificationEmail").mockResolvedValue(undefined);
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
    expect(res.body).toHaveProperty("accessToken");
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
    expect(res.body).toHaveProperty("accessToken");
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
    const token = registerRes.body.accessToken;

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
      .set("Authorization", `Bearer ${loginRes.body.accessToken}`)
      .send({ resumeId: "invalid-id", jobDescription: "x".repeat(50) });
    expect(res.status).toBe(400);
  });
});
it("should reject payload larger than 10kb", async () => {
  const res = await request(app)
    .post("/api/auth/login")
    .send({
      email: "test@test.com",
      password: "A".repeat(11 * 1024), // 11kb
    });
  expect(res.status).toBe(413);
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

describe("Account Lockout", () => {
  beforeEach(async () => {
    await request(app).post("/api/auth/register").send({
      name: "Palak",
      email: "palak@test.com",
      password: "Password123",
    });
  });

  it("should track failed attempts and warn user", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "palak@test.com",
      password: "WrongPass123",
    });
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/attempts remaining/i);
  });

  it("should lock account after 5 failed attempts", async () => {
    // 5 failed attempts
    for (let i = 0; i < 5; i++) {
      await request(app).post("/api/auth/login").send({
        email: "palak@test.com",
        password: "WrongPass123",
      });
    }

    // 6th attempt — should be locked
    const res = await request(app).post("/api/auth/login").send({
      email: "palak@test.com",
      password: "WrongPass123",
    });
    expect(res.status).toBe(423);
    expect(res.body.message).toMatch(/locked/i);
  });

  it("should reset failed attempts on successful login", async () => {
    // 2 failed attempts
    for (let i = 0; i < 2; i++) {
      await request(app).post("/api/auth/login").send({
        email: "palak@test.com",
        password: "WrongPass123",
      });
    }

    // Successful login
    const res = await request(app).post("/api/auth/login").send({
      email: "palak@test.com",
      password: "Password123",
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("accessToken");
  });

  it("should not allow login when account is locked", async () => {
    // Lock account
    for (let i = 0; i < 5; i++) {
      await request(app).post("/api/auth/login").send({
        email: "palak@test.com",
        password: "WrongPass123",
      });
    }

    // Even correct password should not work
    const res = await request(app).post("/api/auth/login").send({
      email: "palak@test.com",
      password: "Password123",
    });
    expect(res.status).toBe(423);
  });
});

describe("POST /api/auth/resend-verification", () => {
  let token: string;

  beforeEach(async () => {
    const registerRes = await request(app).post("/api/auth/register").send({
      name: "Palak",
      email: "palak@test.com",
      password: "Password123",
    });

    token = registerRes.body.accessToken;
  });

  it("should resend verification email successfully", async () => {
    const res = await request(app)
      .post("/api/auth/resend-verification")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Verification email sent successfully");
  });

  it("should reject unauthenticated requests", async () => {
    const res = await request(app).post("/api/auth/resend-verification");

    expect(res.status).toBe(401);
  });

  it("should reject already verified users", async () => {
    const registerRes = await request(app).post("/api/auth/register").send({
      name: "Verified User",
      email: "verified@test.com",
      password: "Password123",
    });

    const verifiedToken = registerRes.body.accessToken;

    await User.updateOne({ email: "verified@test.com" }, { isVerified: true });

    const res = await request(app)
      .post("/api/auth/resend-verification")
      .set("Authorization", `Bearer ${verifiedToken}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already verified/i);
  });

  it("should rate limit resend requests", async () => {
    await request(app)
      .post("/api/auth/resend-verification")
      .set("Authorization", `Bearer ${token}`);

    const res = await request(app)
      .post("/api/auth/resend-verification")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(429);
    expect(res.body.message).toMatch(/wait/i);
  });
  it("should generate a new verification token", async () => {
    const before = await User.findOne({
      email: "palak@test.com",
    });

    const oldToken = before?.verificationToken;

    await request(app)
      .post("/api/auth/resend-verification")
      .set("Authorization", `Bearer ${token}`);

    const after = await User.findOne({
      email: "palak@test.com",
    });

    expect(after?.verificationToken).not.toBe(oldToken);
  });
});

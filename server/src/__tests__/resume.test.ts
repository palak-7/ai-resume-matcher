// ✅ ALL MOCKS FIRST — before any imports
jest.mock("pdfreader", () => ({
  PdfReader: jest.fn().mockImplementation(() => ({
    parseBuffer: jest.fn((_buffer, callback) => {
      callback(null, { text: "React" });
      callback(null, { text: "TypeScript" });
      callback(null, { text: "Node.js developer with 3 years experience" });
      callback(null, null);
    }),
  })),
}));

jest.mock("groq-sdk", () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  matchScore: 85,
                  matchedSkills: ["React", "TypeScript", "Node.js"],
                  missingSkills: [{ skill: "GraphQL", severity: "medium" }],
                  suggestions: ["Add GraphQL to your skillset"],
                }),
              },
            },
          ],
        }),
      },
    },
  }));
});

import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../index";

let mongoServer: MongoMemoryServer;
let authToken: string;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  await request(app).post("/api/auth/register").send({
    name: "Palak Sehgal",
    email: "palak@test.com",
    password: "Password123",
  });

  const loginRes = await request(app).post("/api/auth/login").send({
    email: "palak@test.com",
    password: "Password123",
  });
  authToken = loginRes.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// ── UPLOAD TESTS ──────────────────────────────────────────────────────────────
describe("POST /api/resume/upload", () => {
  it("should reject upload without auth token", async () => {
    const res = await request(app).post("/api/resume/upload");
    expect(res.status).toBe(401);
  });

  it("should reject non-PDF files", async () => {
    const res = await request(app)
      .post("/api/resume/upload")
      .set("Authorization", `Bearer ${authToken}`)
      .attach("resume", Buffer.from("fake content"), {
        filename: "resume.txt",
        contentType: "text/plain",
      });
    expect(res.status).toBe(400);
  });
});

// ── ANALYSE TESTS ─────────────────────────────────────────────────────────────
describe("POST /api/resume/analyse", () => {
  it("should reject without required fields", async () => {
    const res = await request(app)
      .post("/api/resume/analyse")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ resumeId: "507f1f77bcf86cd799439011" });
    expect(res.status).toBe(400);
  });

  it("should return 404 for non-existent resume", async () => {
    const res = await request(app)
      .post("/api/resume/analyse")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        resumeId: "507f1f77bcf86cd799439011",
        jobDescription:
          "Looking for a React developer with TypeScript experience and Node.js skills",
      });
    expect(res.status).toBe(404);
  });

  it("should return analysis with mocked Groq response", async () => {
    // Create a resume directly in DB with a temp userId
    const ResumeModel = mongoose.model("Resume");
    const resume = await ResumeModel.create({
      userId: new mongoose.Types.ObjectId(),
      originalName: "test.pdf",
      extractedText:
        "Experienced React and TypeScript developer with Node.js skills",
    });

    // Register a new user and get their token
    const regRes = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "test2@test.com",
      password: "Password123",
    });
    const token = regRes.body.token;

    // Update resume to belong to this user
    const UserModel = mongoose.model("User");
    const user = await UserModel.findOne({ email: "test2@test.com" });
    await ResumeModel.findByIdAndUpdate(resume._id, { userId: user!._id });

    const res = await request(app)
      .post("/api/resume/analyse")
      .set("Authorization", `Bearer ${token}`)
      .send({
        resumeId: resume._id,
        jobDescription:
          "Looking for React TypeScript Node.js developer with GraphQL experience",
      });

    expect(res.status).toBe(200);
    expect(res.body.analysis.matchScore).toBe(85);
    expect(res.body.analysis.matchedSkills).toContain("React");
  });
});

// ── MY RESUMES TEST ───────────────────────────────────────────────────────────
describe("GET /api/resume/my-resumes", () => {
  it("should reject without auth token", async () => {
    const res = await request(app).get("/api/resume/my-resumes");
    expect(res.status).toBe(401);
  });

  it("should return empty array when no resumes", async () => {
    const res = await request(app)
      .get("/api/resume/my-resumes")
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.resumes).toEqual([]);
  });
});

// ── MY ANALYSES TEST ──────────────────────────────────────────────────────────
describe("GET /api/resume/analyses", () => {
  it("should reject without auth token", async () => {
    const res = await request(app).get("/api/resume/analyses");
    expect(res.status).toBe(401);
  });

  it("should return empty array when no analyses", async () => {
    const res = await request(app)
      .get("/api/resume/analyses")
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.analyses).toEqual([]);
  });
});

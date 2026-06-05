jest.mock("groq-sdk", () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  rewrites: ["Version 1", "Version 2", "Version 3"],
                  questions: [
                    {
                      question: "Tell me about React?",
                      type: "technical",
                      tip: "Mention hooks and state management",
                    },
                  ],
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
  const res = await request(app).post("/api/auth/register").send({
    name: "Palak",
    email: "palak@test.com",
    password: "Password123",
  });
  authToken = res.body.accessToken;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("POST /api/ai/rewrite-bullet", () => {
  it("should reject without auth", async () => {
    const res = await request(app).post("/api/ai/rewrite-bullet");
    expect(res.status).toBe(401);
  });

  it("should reject without bulletPoint", async () => {
    const res = await request(app)
      .post("/api/ai/rewrite-bullet")
      .set("Authorization", `Bearer ${authToken}`)
      .send({});
    expect(res.status).toBe(400);
  });

  it("should return rewrites with valid input", async () => {
    const res = await request(app)
      .post("/api/ai/rewrite-bullet")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ bulletPoint: "Worked on React projects" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("rewrites");
    expect(res.body.rewrites).toHaveLength(3);
  });
});

describe("POST /api/ai/interview-questions", () => {
  it("should reject without auth", async () => {
    const res = await request(app).post("/api/ai/interview-questions");
    expect(res.status).toBe(401);
  });

  it("should reject without jobDescription", async () => {
    const res = await request(app)
      .post("/api/ai/interview-questions")
      .set("Authorization", `Bearer ${authToken}`)
      .send({});
    expect(res.status).toBe(400);
  });
});

describe("POST /api/ai/cover-letter", () => {
  it("should reject without auth", async () => {
    const res = await request(app).post("/api/ai/cover-letter");
    expect(res.status).toBe(401);
  });

  it("should reject without required fields", async () => {
    const res = await request(app)
      .post("/api/ai/cover-letter")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ jobDescription: "some jd" });
    expect(res.status).toBe(400);
  });

  it("should return 404 for invalid resumeId", async () => {
    const res = await request(app)
      .post("/api/ai/cover-letter")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        resumeId: "507f1f77bcf86cd799439011",
        jobDescription: "Looking for React developer",
      });
    expect(res.status).toBe(404);
  });
});

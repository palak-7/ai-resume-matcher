process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test_secret_key";
process.env.GROQ_API_KEY = "test_groq_key";

process.env.UPSTASH_REDIS_REST_URL = ""; // ← test mein Redis skip hoga
process.env.UPSTASH_REDIS_REST_TOKEN = "";

process.env.RESEND_API_KEY = "test_resend_key";
process.env.FRONTEND_URL = "http://localhost:5173";

jest.mock("pdf-parse", () =>
  jest.fn().mockResolvedValue({
    text: "Mocked resume text for testing purposes with React TypeScript Node.js skills",
  }),
);

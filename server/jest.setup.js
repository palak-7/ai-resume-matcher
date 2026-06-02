process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test_secret_key";
process.env.GROQ_API_KEY = "test_groq_key";

jest.mock("pdf-parse", () =>
  jest.fn().mockResolvedValue({
    text: "Mocked resume text for testing purposes with React TypeScript Node.js skills",
  }),
);

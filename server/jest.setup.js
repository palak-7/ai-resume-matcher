process.env.NODE_ENV = "test";

jest.mock("pdf-parse", () =>
  jest.fn().mockResolvedValue({
    text: "Mocked resume text for testing purposes with React TypeScript Node.js skills",
  }),
);

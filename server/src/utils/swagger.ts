import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "AI Resume Matcher API",
      version: "1.0.0",
      description:
        "REST API for AI-powered resume analysis, skill gap detection, and career tools. Built with Node.js, Express, TypeScript, MongoDB, and Groq AI.",
      contact: {
        name: "Palak Sehgal",
        url: "https://github.com/palak-7/ai-resume-matcher",
      },
    },
    servers: [
      {
        url: "http://localhost:5001",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT access token",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string", example: "507f1f77bcf86cd799439011" },
            name: { type: "string", example: "Palak Sehgal" },
            email: { type: "string", example: "palak@example.com" },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            message: { type: "string" },
            accessToken: { type: "string" },
            user: { $ref: "#/components/schemas/User" },
          },
        },
        Resume: {
          type: "object",
          properties: {
            id: { type: "string" },
            originalName: { type: "string", example: "palak-resume.pdf" },
            textLength: { type: "number", example: 2847 },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        MissingSkill: {
          type: "object",
          properties: {
            skill: { type: "string", example: "GraphQL" },
            severity: {
              type: "string",
              enum: ["high", "medium", "low"],
              example: "high",
            },
          },
        },
        Analysis: {
          type: "object",
          properties: {
            id: { type: "string" },
            matchScore: { type: "number", example: 85 },
            matchedSkills: {
              type: "array",
              items: { type: "string" },
              example: ["React", "TypeScript", "Node.js"],
            },
            missingSkills: {
              type: "array",
              items: { $ref: "#/components/schemas/MissingSkill" },
            },
            suggestions: {
              type: "array",
              items: { type: "string" },
            },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            message: { type: "string", example: "Error message here" },
          },
        },
        ValidationError: {
          type: "object",
          properties: {
            message: { type: "string", example: "Validation failed" },
            errors: {
              type: "array",
              items: { type: "string" },
              example: ["Password must have uppercase, lowercase and a number"],
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"], // routes files se comments read karega
};

export const swaggerSpec = swaggerJsdoc(options);

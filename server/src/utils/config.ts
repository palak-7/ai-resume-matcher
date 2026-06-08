import dotenv from "dotenv";
import path from "path";

// NODE_ENV ke hisaab se correct .env file load karo
const env = process.env.NODE_ENV || "development";
const envFile = `.env.${env}`;

dotenv.config({
  path: path.resolve(__dirname, "../../", envFile),
});

// Fallback — agar specific env file na mile
dotenv.config({
  path: path.resolve(__dirname, "../../", ".env"),
});

const config = {
  env,
  port: parseInt(process.env.PORT || "5000", 10),
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",

  db: {
    uri: process.env.MONGODB_URI || "",
  },

  auth: {
    jwtSecret: process.env.JWT_SECRET || "fallback_secret",
    refreshSecret:
      process.env.REFRESH_TOKEN_SECRET || "fallback_refresh_secret",
    accessTokenExpiry: "15m",
    refreshTokenExpiry: 7 * 24 * 60 * 60 * 1000,
  },

  ai: {
    groqApiKey: process.env.GROQ_API_KEY || "",
  },

  redis: {
    url: process.env.UPSTASH_REDIS_REST_URL || "",
    token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  },

  email: {
    resendApiKey: process.env.RESEND_API_KEY || "",
  },

  github: {
    clientId: process.env.GITHUB_CLIENT_ID || "",
    clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    redirectUri: process.env.GITHUB_REDIRECT_URI || "",
  },

  logging: {
    level: process.env.LOG_LEVEL || "info",
  },

  isDevelopment: env === "development",
  isProduction: env === "production",
  isTest: env === "test",
};

export default config;

import rateLimit from "express-rate-limit";

// General — sab routes pe
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { message: "Too many requests — try again after 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth — login/register pe strict
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  skip: () => process.env.NODE_ENV === "test",
  message: { message: "Too many login attempts — try again after 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});

// AI — Groq API calls pe
export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  skip: () => process.env.NODE_ENV === "test",
  message: { message: "AI request limit reached — try again after 1 hour" },
  standardHeaders: true,
  legacyHeaders: false,
});

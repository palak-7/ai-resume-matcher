import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import hpp from "hpp";

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: "Too many requests - try again after 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skip: () => process.env.NODE_ENV === "test",
  message: { message: "Too many login attempts - try again after 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});

export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  skip: () => process.env.NODE_ENV === "test",
  message: { message: "AI request limit reached - try again after 1 hour" },
  standardHeaders: true,
  legacyHeaders: false,
});

const hasMongoOperator = (value: unknown): boolean => {
  if (!value || typeof value !== "object") {
    return false;
  }

  if (Array.isArray(value)) {
    return value.some(hasMongoOperator);
  }

  return Object.entries(value as Record<string, unknown>).some(
    ([key, nestedValue]) =>
      key.startsWith("$") || key.includes(".") || hasMongoOperator(nestedValue),
  );
};

export const mongoSanitizer = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (
    hasMongoOperator(req.body) ||
    hasMongoOperator(req.params) ||
    hasMongoOperator(req.query)
  ) {
    console.warn("NoSQL injection attempt blocked");
    res.status(400).json({ message: "Invalid request payload" });
    return;
  }

  next();
};

export const publicAnalyseLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  skip: () => process.env.NODE_ENV === "test", // ← ye add karo
  message: {
    message: "Free analysis limit reached — sign up for unlimited access",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const hppProtection = hpp();

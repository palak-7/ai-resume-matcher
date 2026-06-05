import "./config/env";
import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { randomUUID } from "crypto";
import authRoutes from "./routes/auth";
import resumeRoutes from "./routes/resume";
import aiRoutes from "./routes/ai";
import githubRoutes from "./routes/github";
import helmet from "helmet";
import {
  generalLimiter,
  hppProtection,
  mongoSanitizer,
} from "./middleware/securityMiddleware";
import cookieParser from "cookie-parser";
import morganMiddleware from "./middleware/morganMiddleware";
import logger from "./utils/logger";
import compression from "compression";

const app = express();
const PORT = process.env.PORT || 5000;
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
);

app.use(
  compression({
    level: 6, // compression level 1-9 (6 = balanced)
    threshold: 1024, // sirf 1KB se badi responses compress karo
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) return false;
      return compression.filter(req, res);
    },
  }),
);

if (process.env.NODE_ENV !== "test") {
  app.use(generalLimiter);
}
app.use(morganMiddleware);
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use((req, res, next) => {
  const requestId = randomUUID().slice(0, 8);
  const startedAt = Date.now();

  res.locals.requestId = requestId;
  console.log(`[${requestId}] --> ${req.method} ${req.originalUrl}`);

  res.on("finish", () => {
    console.log(
      `[${requestId}] <-- ${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - startedAt}ms`,
    );
  });

  res.on("close", () => {
    if (!res.writableEnded) {
      console.warn(
        `[${requestId}] xx> ${req.method} ${req.originalUrl} connection closed before response`,
      );
    }
  });

  next();
});
app.use(cookieParser());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(mongoSanitizer);
app.use(hppProtection);

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/github", githubRoutes);
if (process.env.NODE_ENV !== "test") {
  mongoose
    .connect(process.env.MONGODB_URI || "")
    .then(() => {
      logger.info("MongoDB connected");
      app.listen(process.env.PORT || 5000, () =>
        logger.info(`Server running on port ${PORT}`),
      );
    })
    .catch((err) => logger.error("MongoDB connection error:", err));
}
// Global error handler update karo:
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    if (err.type === "entity.too.large") {
      return res.status(413).json({
        message: "Payload too large",
      });
    }

    logger.error(`Unhandled error: ${err.message}`, {
      stack: err.stack,
    });

    return res.status(500).json({
      message: "Internal server error",
    });
  },
);
export default app;

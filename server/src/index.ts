import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { randomUUID } from "crypto";
import authRoutes from "./routes/auth";
import resumeRoutes from "./routes/resume";
import aiRoutes from "./routes/ai";
import githubRoutes from "./routes/github";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

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
app.use(express.json());

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
      console.log("MongoDB connected");
      app.listen(process.env.PORT || 5000, () =>
        console.log(`Server running on port ${process.env.PORT || 5000}`),
      );
    })
    .catch((err) => console.error("MongoDB connection error:", err));
}

export default app;

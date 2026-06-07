import { Request, Response } from "express";
import mongoose from "mongoose";
import { getCache, setCache } from "../utils/cache";
import logger from "../utils/logger";
import os from "os";

interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services: {
    database: ServiceStatus;
    redis: ServiceStatus;
    memory: MemoryStatus;
  };
}

interface ServiceStatus {
  status: "up" | "down" | "unknown";
  responseTimeMs?: number;
  message?: string;
}

interface MemoryStatus {
  used: string;
  total: string;
  percentage: number;
  status: "ok" | "warning" | "critical";
}

export const healthCheck = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const startTime = Date.now();

  // ── Database check
  let dbStatus: ServiceStatus = { status: "unknown" };
  try {
    const dbStart = Date.now();
    const state = mongoose.connection.readyState;
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    if (state === 1) {
      // Ping karo actually
      await mongoose.connection.db?.admin().ping();
      dbStatus = {
        status: "up",
        responseTimeMs: Date.now() - dbStart,
        message: "Connected",
      };
    } else {
      dbStatus = {
        status: "down",
        message: `Connection state: ${["disconnected", "connected", "connecting", "disconnecting"][state]}`,
      };
    }
  } catch (error) {
    dbStatus = { status: "down", message: "Ping failed" };
    logger.error("Health check DB error:", error);
  }

  // ── Redis check
  let redisStatus: ServiceStatus = { status: "unknown" };
  try {
    const redisStart = Date.now();
    const testKey = "health:ping";
    await setCache(testKey, "pong", 10);
    const result = await getCache<string>(testKey);

    if (result) {
      redisStatus = {
        status: "up",
        responseTimeMs: Date.now() - redisStart,
        message: "Connected",
      };
    } else {
      redisStatus = { status: "down", message: "Ping failed" };
    }
  } catch (error) {
    redisStatus = { status: "down", message: "Connection failed" };
  }

  // ── Memory check
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;
  const memoryPercentage = Math.round((usedMemory / totalMemory) * 100);

  const memoryStatus: MemoryStatus = {
    used: `${Math.round(usedMemory / 1024 / 1024)}MB`,
    total: `${Math.round(totalMemory / 1024 / 1024)}MB`,
    percentage: memoryPercentage,
    status:
      memoryPercentage > 90
        ? "critical"
        : memoryPercentage > 75
          ? "warning"
          : "ok",
  };

  // ── Overall status
  const allUp = dbStatus.status === "up" && redisStatus.status !== "down";
  const anyDown = dbStatus.status === "down";

  const overallStatus: HealthStatus["status"] = anyDown
    ? "unhealthy"
    : allUp
      ? "healthy"
      : "degraded";

  const health: HealthStatus = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    version: process.env.npm_package_version || "1.0.0",
    environment: process.env.NODE_ENV || "development",
    services: {
      database: dbStatus,
      redis: redisStatus,
      memory: memoryStatus,
    },
  };

  const statusCode = overallStatus === "unhealthy" ? 503 : 200;

  logger.info(`Health check: ${overallStatus} (${Date.now() - startTime}ms)`);
  res.status(statusCode).json(health);
};

// Lightweight ping — load balancers ke liye
export const ping = (req: Request, res: Response): void => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
};

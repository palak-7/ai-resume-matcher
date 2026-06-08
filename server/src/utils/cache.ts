import { Redis } from "@upstash/redis";
import logger from "./logger";
import config from "./config";

// Test environment mein Redis skip karo
const isTest = process.env.NODE_ENV === "test";

const redis = !config.isTest
  ? new Redis({
      url: config.redis.url,
      token: config.redis.token,
    })
  : null;
// Cache se data lo
export const getCache = async <T>(key: string): Promise<T | null> => {
  if (!redis) return null;
  try {
    const data = await redis.get<T>(key);
    if (data) logger.info(`Cache HIT: ${key}`);
    else logger.info(`Cache MISS: ${key}`);
    return data;
  } catch (error) {
    logger.error(`Cache get error for key ${key}:`, error);
    return null;
  }
};

// Cache mein data save karo
export const setCache = async (
  key: string,
  value: unknown,
  ttlSeconds: number = 3600, // default 1 hour
): Promise<void> => {
  if (!redis) return;
  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
    logger.info(`Cache SET: ${key} (TTL: ${ttlSeconds}s)`);
  } catch (error) {
    logger.error(`Cache set error for key ${key}:`, error);
  }
};

// Cache delete karo — jab data update ho
export const deleteCache = async (key: string): Promise<void> => {
  if (!redis) return;
  try {
    await redis.del(key);
    logger.info(`Cache DELETE: ${key}`);
  } catch (error) {
    logger.error(`Cache delete error for key ${key}:`, error);
  }
};

// Pattern se multiple keys delete karo
export const deleteCachePattern = async (pattern: string): Promise<void> => {
  if (!redis) return;
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await Promise.all(keys.map((key) => redis.del(key)));
      logger.info(`Cache DELETE pattern: ${pattern} (${keys.length} keys)`);
    }
  } catch (error) {
    logger.error(`Cache delete pattern error:`, error);
  }
};

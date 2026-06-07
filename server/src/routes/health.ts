import { Router } from "express";
import { healthCheck, ping } from "../controllers/healthController";

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Lightweight ping — always fast
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is running
 */
router.get("/", ping);

/**
 * @swagger
 * /health/detailed:
 *   get:
 *     summary: Detailed health — DB, Redis, memory, uptime
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: All services healthy
 *       503:
 *         description: One or more services down
 */
router.get("/detailed", healthCheck);

export default router;

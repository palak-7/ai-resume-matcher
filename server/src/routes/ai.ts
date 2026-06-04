import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import {
  rewriteBullet,
  generateInterviewQuestions,
  generateCoverLetter,
} from "../controllers/aiController";
import { aiLimiter } from "../middleware/securityMiddleware";

const router = Router();

router.post("/rewrite-bullet", protect, aiLimiter, rewriteBullet);
router.post(
  "/interview-questions",
  protect,
  aiLimiter,
  generateInterviewQuestions,
);
router.post("/cover-letter", protect, aiLimiter, generateCoverLetter);

export default router;

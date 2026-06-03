import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import {
  rewriteBullet,
  generateInterviewQuestions,
  generateCoverLetter,
} from "../controllers/aiController";

const router = Router();

router.post("/rewrite-bullet", protect, rewriteBullet);
router.post("/interview-questions", protect, generateInterviewQuestions);
router.post("/cover-letter", protect, generateCoverLetter);

export default router;

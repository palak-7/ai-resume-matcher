import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import {
  rewriteBullet,
  generateInterviewQuestions,
  generateCoverLetter,
} from "../controllers/aiController";
import { aiLimiter } from "../middleware/securityMiddleware";
import { bulletValidation, validate } from "../middleware/validationMiddleware";

const router = Router();

/**
 * @swagger
 * /api/ai/rewrite-bullet:
 *   post:
 *     summary: Rewrite a resume bullet point using AI
 *     tags: [AI Tools]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [bulletPoint]
 *             properties:
 *               bulletPoint:
 *                 type: string
 *                 example: Worked on React projects for the team
 *               jobDescription:
 *                 type: string
 *                 example: Senior React Developer role at a fintech startup
 *     responses:
 *       200:
 *         description: 3 stronger versions returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rewrites:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Led development of 3 React applications...", "Architected reusable component library..."]
 *       400:
 *         description: Validation failed
 *       429:
 *         description: AI rate limit exceeded
 */
router.post(
  "/rewrite-bullet",
  protect,
  aiLimiter,
  bulletValidation,
  validate,
  rewriteBullet,
);

/**
 * @swagger
 * /api/ai/interview-questions:
 *   post:
 *     summary: Generate predicted interview questions based on JD and skill gaps
 *     tags: [AI Tools]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [jobDescription]
 *             properties:
 *               jobDescription:
 *                 type: string
 *               missingSkills:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/MissingSkill'
 *     responses:
 *       200:
 *         description: 8 predicted questions with tips
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 questions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       question:
 *                         type: string
 *                       type:
 *                         type: string
 *                         enum: [technical, behavioral, situational]
 *                       tip:
 *                         type: string
 */
router.post(
  "/interview-questions",
  protect,
  aiLimiter,
  generateInterviewQuestions,
);

/**
 * @swagger
 * /api/ai/cover-letter:
 *   post:
 *     summary: Generate a cover letter from resume and JD
 *     tags: [AI Tools]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [resumeId, jobDescription]
 *             properties:
 *               resumeId:
 *                 type: string
 *               jobDescription:
 *                 type: string
 *               userName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cover letter text returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 coverLetter:
 *                   type: string
 *       404:
 *         description: Resume not found
 */
router.post("/cover-letter", protect, aiLimiter, generateCoverLetter);

export default router;

import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import { protect } from "../middleware/authMiddleware";
import {
  uploadResume,
  analyseResume,
  getMyResumes,
  getMyAnalyses,
} from "../controllers/resumeController";
import {
  analyseValidation,
  validate,
} from "../middleware/validationMiddleware";

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

// ← Multer error handler — ye naya add karo
const handleUpload = (req: Request, res: Response, next: NextFunction) => {
  upload.single("resume")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

const router = Router();
/**
 * @swagger
 * /api/resume/upload:
 *   post:
 *     summary: Upload a PDF resume
 *     tags: [Resume]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               resume:
 *                 type: string
 *                 format: binary
 *                 description: PDF file only, max 5MB
 *     responses:
 *       201:
 *         description: Resume uploaded and text extracted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 resume:
 *                   $ref: '#/components/schemas/Resume'
 *       400:
 *         description: No file, wrong format, or extraction failed
 *       401:
 *         description: Not authorized
 */
router.post("/upload", protect, handleUpload, uploadResume);

/**
 * @swagger
 * /api/resume/analyse:
 *   post:
 *     summary: Analyse resume against a job description using Groq AI
 *     tags: [Resume]
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
 *                 example: 507f1f77bcf86cd799439011
 *               jobDescription:
 *                 type: string
 *                 example: Looking for a React developer with TypeScript and Node.js experience
 *     responses:
 *       200:
 *         description: Analysis complete
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 analysis:
 *                   $ref: '#/components/schemas/Analysis'
 *                 fromCache:
 *                   type: boolean
 *       400:
 *         description: Validation failed
 *       404:
 *         description: Resume not found
 */
router.post("/analyse", protect, analyseValidation, validate, analyseResume);

/**
 * @swagger
 * /api/resume/my-resumes:
 *   get:
 *     summary: Get all resumes uploaded by current user
 *     tags: [Resume]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of resumes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resumes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Resume'
 *                 fromCache:
 *                   type: boolean
 */
router.get("/my-resumes", protect, getMyResumes);

/**
 * @swagger
 * /api/resume/analyses:
 *   get:
 *     summary: Get last 20 analyses for current user
 *     tags: [Resume]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of analyses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 analyses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Analysis'
 */
router.get("/analyses", protect, getMyAnalyses);

export default router;

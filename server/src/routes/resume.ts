import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import { protect } from "../middleware/authMiddleware";
import {
  uploadResume,
  analyseResume,
  getMyResumes,
  getMyAnalyses,
} from "../controllers/resumeController";

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

router.post("/upload", protect, handleUpload, uploadResume); // ← handleUpload use karo
router.post("/analyse", protect, analyseResume);
router.get("/my-resumes", protect, getMyResumes);
router.get("/analyses", protect, getMyAnalyses);

export default router;

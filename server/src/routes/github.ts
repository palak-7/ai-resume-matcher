import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import {
  githubAuth,
  githubCallback,
  getRepos,
  generateRepoBullets,
} from "../controllers/githubController";

const router = Router();

router.get("/auth", githubAuth);
router.get("/callback", githubCallback);
router.get("/repos", protect, getRepos);
router.post("/generate-bullets", protect, generateRepoBullets);

export default router;

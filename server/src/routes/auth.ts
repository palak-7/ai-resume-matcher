import { Router } from "express";
import { register, login, getMe } from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";
import { authLimiter } from "../middleware/securityMiddleware";

const router = Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.get("/me", protect, getMe); // protected route

export default router;

import { Router } from "express";
import {
  register,
  login,
  getMe,
  refreshAccessToken,
  logout,
} from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";
import { authLimiter } from "../middleware/securityMiddleware";
import {
  loginValidation,
  registerValidation,
  validate,
} from "../middleware/validationMiddleware";

const router = Router();

router.post("/register", authLimiter, registerValidation, validate, register);
router.post("/login", authLimiter, loginValidation, validate, login);
router.post("/refresh", refreshAccessToken);
router.post("/logout", logout);
router.get("/me", protect, getMe); // protected route

export default router;

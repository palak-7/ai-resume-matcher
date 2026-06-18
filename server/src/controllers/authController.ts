import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User";
import RefreshToken from "../models/RefreshToken";
import logger from "../utils/logger";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "../utils/emailService";
import config from "../utils/config";
import Resume from "../models/Resume";
import { deletePDFFromCloudinary } from "../utils/cloudinary";
import Analysis from "../models/Analysis";
import { deleteCache } from "../utils/cache";

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 30 * 60 * 1000; // 30 minutes

// Access token — 15 minutes
const generateAccessToken = (id: string): string => {
  return jwt.sign({ id }, config.auth.jwtSecret || "fallback_secret", {
    expiresIn: "15m",
  });
};

// Refresh token — random string, stored in DB
const generateRefreshToken = async (userId: string): Promise<string> => {
  const token = crypto.randomBytes(64).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await RefreshToken.create({ token, userId, expiresAt });
  return token;
};

// POST /api/auth/register
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    if (
      !name ||
      typeof name !== "string" ||
      !email ||
      typeof email !== "string" ||
      !password ||
      typeof password !== "string"
    ) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    const existingUser = await User.findOne({ email: String(email).trim() });
    if (existingUser) {
      res.status(400).json({ message: "User already exists with this email" });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Verification token generate karo
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpiry,
    });

    if (process.env.NODE_ENV !== "test") {
      sendVerificationEmail(email, name, verificationToken).catch((err) => {
        logger.error("Verification email failed (non-blocking):", err);
      });
    }

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = await generateRefreshToken(user._id.toString());

    // Refresh token httpOnly cookie mein set karo — JS access nahi kar sakta
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    logger.info(`New user registered: ${email}`);
    res.status(201).json({
      message: "Registration successful — please verify your email",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    logger.error("Register error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};
export const resendVerificationEmail = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const user = await User.findById((req as any).userId);
    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }
    if (user.isVerified) {
      res.status(400).json({
        message: "Email already verified",
      });
      return;
    }
    if (
      user.lastVerificationEmailSentAt &&
      Date.now() - user.lastVerificationEmailSentAt.getTime() < 60 * 1000
    ) {
      res.status(429).json({
        message: "Please wait 1 minute before requesting another email",
      });
      return;
    }
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.verificationToken = verificationToken;
    user.verificationTokenExpiry = verificationTokenExpiry;
    user.lastVerificationEmailSentAt = new Date();
    await user.save();

    await sendVerificationEmail(user.email, user.name, verificationToken);
    res.status(200).json({
      message: "Verification email sent successfully",
    });
  } catch (error) {
    logger.error("Resend verification error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};
// POST /api/auth/verify-email
export const verifyEmail = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { token } = req.body;
    if (!token) {
      res.status(400).json({ message: "Verification token is required" });
      return;
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      res
        .status(400)
        .json({ message: "Invalid or expired verification token" });
      return;
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;
    await user.save();

    logger.info(`Email verified: ${user.email}`);
    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    logger.error("Email verification error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }

    const user = await User.findOne({ email });

    // Security: always return success even if email not found
    if (!user) {
      res
        .status(200)
        .json({ message: "If that email exists, a reset link has been sent" });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = resetExpiry;
    await user.save();

    if (process.env.NODE_ENV !== "test") {
      await sendPasswordResetEmail(email, user.name, resetToken);
    }

    logger.info(`Password reset requested: ${email}`);
    res
      .status(200)
      .json({ message: "If that email exists, a reset link has been sent" });
  } catch (error) {
    logger.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/auth/reset-password
export const resetPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({ message: "Token and new password are required" });
      return;
    }

    if (newPassword.length < 6) {
      res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
      return;
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: new Date() },
    });

    if (!user) {
      res.status(400).json({ message: "Invalid or expired reset token" });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = null;
    user.resetPasswordExpiry = null;
    await user.save();

    // Sab refresh tokens delete karo — security
    await RefreshToken.deleteMany({ userId: user._id });

    logger.info(`Password reset successful: ${user.email}`);
    res
      .status(200)
      .json({ message: "Password reset successful — please login again" });
  } catch (error) {
    logger.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/auth/login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (
      !email ||
      typeof email !== "string" ||
      !password ||
      typeof password !== "string"
    ) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const user = await User.findOne({ email: String(email).trim() });
    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }
    // ── Check lockout
    if (user.lockUntil && user.lockUntil > new Date()) {
      const minutesLeft = Math.ceil(
        (user.lockUntil.getTime() - Date.now()) / 60000,
      );
      logger.warn(`Locked account login attempt: ${email}`);
      res.status(423).json({
        message: `Account locked — too many failed attempts. Try again in ${minutesLeft} minute${minutesLeft > 1 ? "s" : ""}.`,
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      user.failedLoginAttempts += 1;

      if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        // Lock the account
        user.lockUntil = new Date(Date.now() + LOCK_DURATION_MS);
        user.failedLoginAttempts = 0;
        await user.save();

        logger.warn(
          `Account locked after ${MAX_FAILED_ATTEMPTS} failed attempts: ${email}`,
        );
        res.status(423).json({
          message:
            "Account locked for 30 minutes due to too many failed login attempts.",
        });
        return;
      }
      await user.save();

      const attemptsLeft = MAX_FAILED_ATTEMPTS - user.failedLoginAttempts;
      logger.warn(
        `Failed login attempt ${user.failedLoginAttempts}/${MAX_FAILED_ATTEMPTS}: ${email}`,
      );

      res.status(401).json({
        message: `Invalid email or password. ${attemptsLeft} attempt${attemptsLeft > 1 ? "s" : ""} remaining before lockout.`,
      });
      return;
    }
    // ── Successful login — reset lockout fields
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = await generateRefreshToken(user._id.toString());

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    logger.info(`User logged in: ${email}`);
    res.status(200).json({
      message: "Login successful",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    logger.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// POST /api/auth/refresh — naya access token lo
export const refreshAccessToken = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      res.status(401).json({ message: "No refresh token" });
      return;
    }

    // DB mein check karo
    const storedToken = await RefreshToken.findOne({ token: refreshToken });
    if (!storedToken) {
      res.status(401).json({ message: "Invalid or expired refresh token" });
      return;
    }

    // Expired check
    if (storedToken.expiresAt < new Date()) {
      await RefreshToken.deleteOne({ token: refreshToken });
      res
        .status(401)
        .json({ message: "Refresh token expired — please login again" });
      return;
    }
    // ── ROTATION — purana token delete karo
    await RefreshToken.deleteOne({ token: refreshToken });

    // ── Naya refresh token generate karo
    const newRefreshToken = await generateRefreshToken(
      storedToken.userId.toString(),
    );

    // Naya access token generate karo
    const accessToken = generateAccessToken(storedToken.userId.toString());

    // ── Naya refresh token cookie mein set karo
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ accessToken });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/auth/logout — refresh token delete karo
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      await RefreshToken.deleteOne({ token: refreshToken });
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error during logout" });
  }
};

// GET /api/auth/me
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById((req as any).userId).select("-password");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/auth/delete-account
export const deleteAccount = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req as any).userId;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Cloudinary se saare PDFs delete karo
    const userResumes = await Resume.find({ userId });
    for (const resume of userResumes) {
      if (resume.cloudinaryPublicId) {
        await deletePDFFromCloudinary(resume.cloudinaryPublicId);
      }
    }

    // Saara user data delete karo — order matters
    await Promise.all([
      Resume.deleteMany({ userId }),
      Analysis.deleteMany({ userId }),
      RefreshToken.deleteMany({ userId }),
    ]);

    // User delete karo
    await User.findByIdAndDelete(userId);

    // Cookie clear karo
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: "strict",
    });

    // Cache invalidate karo
    await deleteCache(`resumes:${userId}`);
    await deleteCache(`analyses:${userId}`);

    logger.info(`Account deleted: ${user.email}`);

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    logger.error("Delete account error:", error);
    res.status(500).json({ message: "Server error during account deletion" });
  }
};

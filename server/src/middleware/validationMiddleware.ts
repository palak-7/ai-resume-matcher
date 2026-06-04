import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

// Validation errors check karo — har route mein use hoga
export const validate = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      message: "Validation failed",
      errors: errors.array().map((e) => e.msg),
    });
    return;
  }
  next();
};

// Register rules
export const registerValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be 2-50 characters")
    .escape(), // <script> tags strip karo

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(), // lowercase + trim

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must have uppercase, lowercase and a number"),
];

// Login rules
export const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),
];

// Analyse rules
export const analyseValidation = [
  body("resumeId")
    .notEmpty()
    .withMessage("resumeId is required")
    .isMongoId()
    .withMessage("Invalid resumeId format"),

  body("jobDescription")
    .trim()
    .notEmpty()
    .withMessage("Job description is required")
    .isLength({ min: 50, max: 5000 })
    .withMessage("JD must be between 50 and 5000 characters"),
];

// Bullet rewrite rules
export const bulletValidation = [
  body("bulletPoint")
    .trim()
    .notEmpty()
    .withMessage("Bullet point is required")
    .isLength({ min: 5, max: 500 })
    .withMessage("Bullet must be 5-500 characters")
    .escape(),
];

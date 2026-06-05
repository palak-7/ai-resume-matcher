import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  id: string;
}

export const protect = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const requestId = res.locals.requestId || "no-request-id";
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Not authorized — no token" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback_secret",
    ) as JwtPayload;

    (req as any).userId = decoded.id;
    next();
  } catch {
    console.warn(`[${requestId}] Auth rejected: token is invalid`);
    res.status(401).json({ message: "Not authorized — token invalid" });
  }
};

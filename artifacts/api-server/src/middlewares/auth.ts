import { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../lib/jwt.js";

export interface AuthRequest extends Request {
  userId?: number;
  userMobile?: string;
}

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res
      .status(401)
      .json({ error: "Missing or invalid Authorization header" });
    return;
  }

  try {
    const token = authHeader.slice(7);
    const payload = await verifyJwt(token);
    req.userId = payload.userId;
    req.userMobile = payload.mobile;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired session token" });
  }
}

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role } from "../models/User.model";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: Role;
  };
  file?: Express.Multer.File;
}

export const verifyToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401).json({ message: "Unauthorized, no token provided" });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET as string;
    const decoded = jwt.verify(token, secret) as { id: string; role: Role };
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Unauthorized, invalid or expired token" });
  }
};

export const authorizeRoles = (...roles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: "Forbidden, insufficient permissions" });
      return;
    }
    next();
  };
};

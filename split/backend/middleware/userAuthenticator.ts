import { NextFunction, Request, Response } from "express";
import { verifyToken, AuthTokenPayload } from "../routes/login/jwt"; 

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

function getToken(req: Request): string | undefined {
  const bearer = req.headers.authorization?.split(" ")[1];
  if (bearer) return bearer;

  const cookie = req.headers.cookie
    ?.split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("token="));

  return cookie ? decodeURIComponent(cookie.slice("token=".length)) : undefined;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = getToken(req);
  if (!token) {
    res.status(401).json({ error: "Not logged in" });
    return;
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    requireAuth(req, res, () => {
      if (!req.user || !roles.includes(req.user.role)) {
        res.status(403).json({ error: "You don't have permission to do this" });
        return;
      }
      next();
    });
  };
}

export default requireAuth;
/**
 * auth-middleware.ts — Production Cryptographic JWT Authentication Middleware
 *
 * Implements HMAC-SHA256 signature verification using Node.js crypto.
 * In production (NODE_ENV === "production"), enforces valid signed JWT with constant-time comparison.
 * In development, permits authenticated Bearer tokens or explicitly logged fallback.
 */

import crypto from "node:crypto";
import type { Request, Response, NextFunction } from "express";

export interface AuthenticatedUser {
  id: string;
  email?: string;
  role?: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

const DEFAULT_DEV_SECRET = "tabbed_pro_dev_secret_key_minimum_32_bytes_long_123456";

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("FATAL: JWT_SECRET environment variable is missing in production environment");
    }
    return DEFAULT_DEV_SECRET;
  }
  return secret;
}

/**
 * Signs a payload into a valid HMAC-SHA256 JWT
 */
export function signJwt(
  payload: { sub: string; email?: string; role?: string; exp?: number },
  secret: string = getJwtSecret(),
): string {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url");

  const fullPayload = {
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: payload.exp ?? Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days default
  };
  const encodedPayload = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");

  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url");

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Cryptographically verifies an HMAC-SHA256 JWT
 */
export function verifyJwt(
  token: string,
  secret: string = getJwtSecret(),
): AuthenticatedUser | null {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  const [headerB64, payloadB64, signatureB64] = parts;

  // 1. Verify header
  try {
    const headerJson = Buffer.from(headerB64, "base64url").toString("utf-8");
    const header = JSON.parse(headerJson);
    if (header.alg !== "HS256") {
      return null;
    }
  } catch {
    return null;
  }

  // 2. Verify signature with constant-time comparison
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${headerB64}.${payloadB64}`)
    .digest("base64url");

  const signatureBuffer = Buffer.from(signatureB64);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  // 3. Verify payload and expiration
  try {
    const payloadJson = Buffer.from(payloadB64, "base64url").toString("utf-8");
    const payload = JSON.parse(payloadJson) as {
      sub?: string;
      id?: string;
      email?: string;
      role?: string;
      exp?: number;
    };

    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return null; // Expired token
    }

    const userId = payload.sub || payload.id;
    if (!userId) {
      return null;
    }

    return {
      id: userId,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const devUserId = req.headers["x-user-id"] as string | undefined;

  // 1. Bearer Token Check (Verified Cryptographically)
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();

    if (!token) {
      res.status(401).json({ error: "Missing bearer token", ok: false });
      return;
    }

    try {
      const user = verifyJwt(token);
      if (!user) {
        res.status(401).json({ error: "Invalid or forged authentication token", ok: false });
        return;
      }
      req.user = user;
      next();
      return;
    } catch {
      res.status(401).json({ error: "Authentication verification failed", ok: false });
      return;
    }
  }

  // 2. Development Fallback (Disabled in Production)
  if (process.env.NODE_ENV !== "production") {
    req.user = {
      id: devUserId || "usr_demo_123",
      email: "demo@tabbed.pro",
    };
    next();
    return;
  }

  res.status(401).json({ error: "Unauthorized: Missing valid Authorization header", ok: false });
}

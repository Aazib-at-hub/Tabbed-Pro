/**
 * server.ts — Express Production API & Web Server
 *
 * Listens on PORT env var (default: 3001).
 * Serves API routes on /api and static production Vite build from dist/ with SPA fallback.
 */

import path from "node:path";
import fs from "node:fs";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import "dotenv/config";
import { createApiRouter } from "./api-routes.js";

const app = express();
const PORT = process.env.PORT ?? 3001;

// ─── Production Security Headers ─────────────────────────────────────────────

app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }
  next();
});

// ─── Production Rate Limiters (10k scale protection) ─────────────────────────

// Global API limiter: 120 reqs/min per IP
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later.", ok: false },
});

// Dedicated LLM Endpoint Limiter: 20 prompt optimizations/min per IP
export const llmLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "LLM optimization rate limit exceeded. Please wait a moment.", ok: false },
});

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN ?? "http://localhost:3000",
    credentials: true,
  }),
);

app.use("/api", globalLimiter);

// Stripe Webhook requires raw buffer for HMAC signature verification
app.use("/api/stripe/webhook", express.raw({ type: "application/json" }));

// Standard JSON body parser for other routes
app.use(express.json({ limit: "1mb" }));

// ─── Request logger ───────────────────────────────────────────────────────────

app.use((req, _res, next) => {
  if (!req.path.startsWith("/assets")) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  }
  next();
});

// ─── API Routes ───────────────────────────────────────────────────────────────

app.use("/api", createApiRouter());

// ─── Health check ─────────────────────────────────────────────────────────────

app.get("/health", (_req, res) => {
  res.json({ status: "ok", version: "1.0.0", timestamp: new Date().toISOString() });
});

// ─── Static Production SPA Serving & Fallback ─────────────────────────────────

const distPath = path.resolve(process.cwd(), "dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  app.use((req, res, next) => {
    if ((req.method === "GET" || req.method === "HEAD") && !req.path.startsWith("/api") && req.path !== "/health") {
      const indexFile = path.join(distPath, "index.html");
      if (fs.existsSync(indexFile)) {
        return res.sendFile(indexFile);
      }
    }
    next();
  });
}

// ─── 404 handler ─────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ error: "Not found", ok: false });
});

// ─── Error handler ────────────────────────────────────────────────────────────

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[API Error]", err.message);
  res.status(500).json({ error: "Internal server error" });
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`🚀 Tabbed Pro API & Web server running on http://localhost:${PORT}`);
});

export default app;

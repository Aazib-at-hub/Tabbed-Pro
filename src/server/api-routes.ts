/**
 * api-routes.ts — Full REST API route definitions
 *
 * Uses the Clean Architecture serverRepositories (Prisma ORM with PostgreSQL,
 * with automatic resilient fallback to local in-memory store in dev).
 */

import { Router, type Request, type Response } from "express";
import { getLLMProvider } from "./llm/index.js";
import { llmLimiter } from "./server.js";
import { serverRepositories } from "./repositories/index.js";
import {
  createCheckoutSession,
  createPortalSession,
  constructWebhookEvent,
  handleWebhookEvent,
  checkPromptLimit,
  PLAN_CONFIG,
  type SubscriptionTier,
} from "./stripe.js";

export function createApiRouter(): Router {
  const router = Router();

  function getUserId(req: Request): string {
    return req.user?.id ?? (req.headers["x-user-id"] as string) ?? "usr_demo_123";
  }

  function ok(res: Response, data: unknown) {
    return res.json({ data, ok: true });
  }

  function err(res: Response, status: number, message: string) {
    return res.status(status).json({ error: message, ok: false });
  }

  // ─── User Profile ──────────────────────────────────────────────────────────

  // GET /api/me
  router.get("/me", async (req, res) => {
    try {
      const userId = getUserId(req);
      const user = await serverRepositories.users.findById(userId);
      if (!user) {
        return ok(res, { id: userId, email: `${userId}@example.com`, name: "Demo User" });
      }
      ok(res, user);
    } catch (e: unknown) {
      err(res, 500, e instanceof Error ? e.message : "Failed to fetch user");
    }
  });

  // PUT /api/user/profile
  router.put("/user/profile", async (req, res) => {
    try {
      const userId = getUserId(req);
      const {
        profession,
        experience,
        mainDomain,
        platforms,
        responseStyle,
        techStack,
        customRules,
      } = req.body;
      const profile = await serverRepositories.profiles.upsert(userId, {
        profession,
        experience,
        mainDomain,
        platforms,
        responseStyle,
        techStack,
        customRules,
      });
      ok(res, profile);
    } catch (e: unknown) {
      err(res, 500, e instanceof Error ? e.message : "Failed to update profile");
    }
  });

  // ─── Folders ───────────────────────────────────────────────────────────────

  // GET /api/folders
  router.get("/folders", async (req, res) => {
    try {
      const userId = getUserId(req);
      const folders = await serverRepositories.folders.listByUserId(userId);
      ok(res, { userId, folders });
    } catch (e: unknown) {
      err(res, 500, e instanceof Error ? e.message : "Failed to list folders");
    }
  });

  // POST /api/folders
  router.post("/folders", async (req, res) => {
    try {
      const userId = getUserId(req);
      const { name, icon, color } = req.body;
      if (!name) return err(res, 400, "Folder name is required");
      const folder = await serverRepositories.folders.create(userId, { name, icon, color });
      ok(res, folder);
    } catch (e: unknown) {
      err(res, 500, e instanceof Error ? e.message : "Failed to create folder");
    }
  });

  // DELETE /api/folders/:id
  router.delete("/folders/:id", async (req, res) => {
    try {
      await serverRepositories.folders.delete(req.params.id);
      ok(res, { deleted: req.params.id });
    } catch (e: unknown) {
      err(res, 500, e instanceof Error ? e.message : "Failed to delete folder");
    }
  });

  // ─── Prompts ───────────────────────────────────────────────────────────────

  // GET /api/prompts
  router.get("/prompts", async (req, res) => {
    try {
      const userId = getUserId(req);
      const { folderId, category, search, favoritesOnly } = req.query;
      const prompts = await serverRepositories.prompts.list(userId, {
        folderId: folderId ? String(folderId) : undefined,
        category: category ? String(category) : undefined,
        search: search ? String(search) : undefined,
        favoritesOnly: favoritesOnly === "true",
      });
      ok(res, { prompts });
    } catch (e: unknown) {
      err(res, 500, e instanceof Error ? e.message : "Failed to list prompts");
    }
  });

  // GET /api/prompts/:id
  router.get("/prompts/:id", async (req, res) => {
    try {
      const prompt = await serverRepositories.prompts.findById(req.params.id);
      if (!prompt) return err(res, 404, "Prompt not found");
      ok(res, prompt);
    } catch (e: unknown) {
      err(res, 500, e instanceof Error ? e.message : "Failed to get prompt");
    }
  });

  // POST /api/prompts
  router.post("/prompts", async (req, res) => {
    const userId = getUserId(req);
    const { title, rawContent, category, mode, tags, aiPlatform, folderId, optimizedContent } =
      req.body;
    if (!title || !rawContent) return err(res, 400, "title and rawContent are required");

    try {
      const prompt = await serverRepositories.prompts.create(userId, {
        title,
        rawContent,
        category,
        mode,
        tags,
        aiPlatform,
        folderId,
        optimizedContent,
      });
      ok(res, prompt);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to create prompt";
      if (msg.includes("PLAN_LIMIT_REACHED")) {
        return res.status(403).json({
          ok: false,
          error: msg,
          code: "PLAN_LIMIT_REACHED",
        });
      }
      err(res, 500, msg);
    }
  });

  // PUT /api/prompts/:id
  router.put("/prompts/:id", async (req, res) => {
    try {
      const updated = await serverRepositories.prompts.update(req.params.id, req.body);
      if (!updated) return err(res, 404, "Prompt not found");
      ok(res, updated);
    } catch (e: unknown) {
      err(res, 500, e instanceof Error ? e.message : "Failed to update prompt");
    }
  });

  // POST /api/prompts/:id/favorite
  router.post("/prompts/:id/favorite", async (req, res) => {
    try {
      const toggled = await serverRepositories.prompts.toggleFavorite(req.params.id);
      if (!toggled) return err(res, 404, "Prompt not found");
      ok(res, toggled);
    } catch (e: unknown) {
      err(res, 500, e instanceof Error ? e.message : "Failed to toggle favorite");
    }
  });

  // DELETE /api/prompts/:id
  router.delete("/api/prompts/:id", async (req, res) => {
    try {
      await serverRepositories.prompts.delete(req.params.id);
      ok(res, { deleted: req.params.id });
    } catch (e: unknown) {
      err(res, 500, e instanceof Error ? e.message : "Failed to delete prompt");
    }
  });

  // POST /api/prompts/:id/optimize — trigger prompt optimization
  router.post("/prompts/:id/optimize", async (req, res) => {
    try {
      const { mode, profile } = req.body;
      const optimized = await serverRepositories.prompts.optimize(
        req.params.id,
        mode || "general",
        profile,
      );
      if (!optimized) return err(res, 404, "Prompt not found");
      ok(res, optimized);
    } catch (e: unknown) {
      err(res, 500, e instanceof Error ? e.message : "Optimization failed");
    }
  });

  // ─── Templates ─────────────────────────────────────────────────────────────

  // GET /api/templates
  router.get("/templates", async (req, res) => {
    try {
      const { category } = req.query;
      const templates = await serverRepositories.templates.list(
        category ? String(category) : undefined,
      );
      ok(res, { category, templates });
    } catch (e: unknown) {
      err(res, 500, e instanceof Error ? e.message : "Failed to list templates");
    }
  });

  // POST /api/templates/:id/save — save template to user's vault
  router.post("/templates/:id/save", async (req, res) => {
    try {
      const userId = getUserId(req);
      const prompt = await serverRepositories.templates.saveToVault(userId, req.params.id);
      if (!prompt) return err(res, 404, "Template not found");
      ok(res, prompt);
    } catch (e: unknown) {
      err(res, 500, e instanceof Error ? e.message : "Failed to save template to vault");
    }
  });

  // ─── Analytics ─────────────────────────────────────────────────────────────

  // GET /api/analytics/stats
  router.get("/analytics/stats", async (req, res) => {
    try {
      const userId = getUserId(req);
      const stats = await serverRepositories.analytics.getUserStats(userId);
      ok(res, { userId, ...stats });
    } catch (e: unknown) {
      err(res, 500, e instanceof Error ? e.message : "Failed to compute stats");
    }
  });

  // ─── Real LLM AI Engine Endpoints (Protected by Rate Limiter) ───────────

  // POST /api/llm/analyze — Real LLM evaluation of prompt quality
  router.post("/llm/analyze", llmLimiter, async (req, res) => {
    try {
      const { promptText, provider } = req.body;
      if (!promptText || typeof promptText !== "string") {
        return err(res, 400, "promptText string is required");
      }
      const llm = getLLMProvider(provider);
      const result = await llm.analyzePrompt(promptText);
      ok(res, result);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Analysis failed";
      err(res, 500, message);
    }
  });

  // POST /api/llm/optimize/stream — SSE Streaming endpoint for real-time prompt generation
  router.post("/llm/optimize/stream", llmLimiter, async (req, res) => {
    const { promptText, mode = "general", model = "ChatGPT", profile, provider } = req.body;

    if (!promptText || typeof promptText !== "string") {
      return err(res, 400, "promptText string is required");
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    let isClientConnected = true;
    req.on("close", () => {
      isClientConnected = false;
    });

    try {
      const llm = getLLMProvider(provider);
      await llm.optimizePromptStream(
        { promptText, mode, targetModel: model, profile, provider },
        (chunk: string) => {
          if (isClientConnected && !res.writableEnded) {
            res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
          }
        },
      );
      if (isClientConnected && !res.writableEnded) {
        res.write("data: [DONE]\n\n");
        res.end();
      }
    } catch (e: unknown) {
      if (isClientConnected && !res.writableEnded) {
        const message = e instanceof Error ? e.message : "Optimization failed";
        res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
        res.end();
      }
    }
  });

  // ─── Stripe & Subscription Billing Endpoints ──────────────────────────────

  // POST /api/stripe/checkout-session — Create Stripe checkout session
  router.post("/stripe/checkout-session", async (req, res) => {
    try {
      const userId = getUserId(req);
      const { tier = "pro", returnUrl = "http://localhost:3000/settings/billing" } = req.body;
      const session = await createCheckoutSession({
        userId,
        tier: tier === "teams" ? "teams" : "pro",
        returnUrl,
      });
      ok(res, session);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Checkout creation failed";
      err(res, 500, message);
    }
  });

  // POST /api/stripe/portal-session — Create Customer Portal session
  router.post("/stripe/portal-session", async (req, res) => {
    try {
      const { customerId, returnUrl = "http://localhost:3000/settings/billing" } = req.body;
      const portal = await createPortalSession(customerId, returnUrl);
      ok(res, portal);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Portal session failed";
      err(res, 500, message);
    }
  });

  // POST /api/stripe/webhook — Stripe Webhook listener (Fail-closed in production)
  router.post("/stripe/webhook", async (req, res) => {
    try {
      const sig = req.headers["stripe-signature"];

      // In production, missing Stripe configuration MUST fail closed
      if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
        if (process.env.NODE_ENV === "production") {
          return err(res, 500, "Stripe webhook configuration missing on server");
        }
        // Dev mock fallback (only active when NODE_ENV !== production)
        const event = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
        if (event?.type) {
          const result = await handleWebhookEvent(event);
          return res.json({ received: true, mock: true, ...result });
        }
        return res.json({ received: true, mock: true });
      }

      if (!sig || typeof sig !== "string") {
        return err(res, 400, "Missing Stripe signature");
      }
      const event = constructWebhookEvent(req.body, sig);
      const result = await handleWebhookEvent(event);
      return res.json({ received: true, ...result });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Webhook handling error";
      console.error("[Stripe Webhook Error]", message);
      res.status(400).send(`Webhook Error: ${message}`);
    }
  });

  // GET /api/subscription/status — Current user subscription details & quota
  router.get("/subscription/status", async (req, res) => {
    try {
      const userId = getUserId(req);
      const status = await serverRepositories.users.getSubscriptionStatus(userId);
      ok(res, {
        userId,
        ...status,
        maxSavedPrompts: status.maxPrompts,
        allowedModes: PLAN_CONFIG[status.tier]?.allowedModes ?? ["general"],
      });
    } catch (e: unknown) {
      err(res, 500, e instanceof Error ? e.message : "Failed to fetch subscription status");
    }
  });

  // POST /api/subscription/simulate-tier — Quick test mode tier switcher
  router.post("/subscription/simulate-tier", async (req, res) => {
    try {
      const userId = getUserId(req);
      const { tier = "pro" } = req.body;
      const updated = await serverRepositories.users.updateSubscription(userId, {
        subscriptionTier: tier,
        currentPeriodEnd:
          tier !== "free"
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            : undefined,
      });
      ok(res, updated);
    } catch (e: unknown) {
      err(res, 500, e instanceof Error ? e.message : "Failed to simulate tier");
    }
  });

  // ─── Workspaces & Teams REST Endpoints ────────────────────────────────────

  // GET /api/workspaces — List user's workspaces
  router.get("/workspaces", async (req, res) => {
    try {
      const userId = getUserId(req);
      const workspaces = await serverRepositories.workspaces.listByUserId(userId);
      ok(res, { userId, workspaces });
    } catch (e: unknown) {
      err(res, 500, e instanceof Error ? e.message : "Failed to list workspaces");
    }
  });

  // POST /api/workspaces — Create a new workspace
  router.post("/workspaces", async (req, res) => {
    try {
      const userId = getUserId(req);
      const { name, plan = "teams" } = req.body;
      if (!name) return err(res, 400, "Workspace name is required");
      const workspace = await serverRepositories.workspaces.create(userId, { name, plan });
      ok(res, workspace);
    } catch (e: unknown) {
      err(res, 500, e instanceof Error ? e.message : "Failed to create workspace");
    }
  });

  // GET /api/workspaces/:id — Workspace details
  router.get("/workspaces/:id", async (req, res) => {
    try {
      const workspace = await serverRepositories.workspaces.findById(req.params.id);
      if (!workspace) return err(res, 404, "Workspace not found");
      const members = await serverRepositories.workspaces.getMembers(req.params.id);
      const prompts = await serverRepositories.workspaces.getPrompts(req.params.id);
      ok(res, {
        ...workspace,
        membersCount: members.length,
        promptsCount: prompts.length,
      });
    } catch (e: unknown) {
      err(res, 500, e instanceof Error ? e.message : "Failed to get workspace");
    }
  });

  // GET /api/workspaces/:id/members — Workspace members & roles
  router.get("/workspaces/:id/members", async (req, res) => {
    try {
      const members = await serverRepositories.workspaces.getMembers(req.params.id);
      ok(res, { workspaceId: req.params.id, members });
    } catch (e: unknown) {
      err(res, 500, e instanceof Error ? e.message : "Failed to list workspace members");
    }
  });

  // POST /api/workspaces/:id/members/invite — Invite teammate
  router.post("/workspaces/:id/members/invite", async (req, res) => {
    try {
      const { email, role = "editor" } = req.body;
      if (!email) return err(res, 400, "Email is required");
      const invite = await serverRepositories.workspaces.inviteMember(req.params.id, email, role);
      ok(res, invite);
    } catch (e: unknown) {
      err(res, 500, e instanceof Error ? e.message : "Failed to invite member");
    }
  });

  // GET /api/workspaces/:id/standards — AI Standards & Guardrails
  router.get("/workspaces/:id/standards", async (req, res) => {
    try {
      const workspace = await serverRepositories.workspaces.findById(req.params.id);
      if (!workspace) return err(res, 404, "Workspace not found");
      ok(res, {
        workspaceId: req.params.id,
        standards: workspace.aiStandards,
      });
    } catch (e: unknown) {
      err(res, 500, e instanceof Error ? e.message : "Failed to get workspace standards");
    }
  });

  // PUT /api/workspaces/:id/standards — Update AI Standards
  router.put("/workspaces/:id/standards", async (req, res) => {
    try {
      const updated = await serverRepositories.workspaces.updateStandards(req.params.id, req.body);
      ok(res, {
        workspaceId: req.params.id,
        standards: updated,
        updatedAt: new Date().toISOString(),
      });
    } catch (e: unknown) {
      err(res, 500, e instanceof Error ? e.message : "Failed to update standards");
    }
  });

  // GET /api/workspaces/:id/analytics — Team adoption & usage analytics
  router.get("/workspaces/:id/analytics", async (req, res) => {
    try {
      const analytics = await serverRepositories.workspaces.getAnalytics(req.params.id);
      ok(res, {
        workspaceId: req.params.id,
        ...analytics,
      });
    } catch (e: unknown) {
      err(res, 500, e instanceof Error ? e.message : "Failed to get workspace analytics");
    }
  });

  return router;
}

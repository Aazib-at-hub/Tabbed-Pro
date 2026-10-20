/**
 * api-client.ts — Unified API client connected to Repository Layer
 *
 * All React components import from here.
 * Backed by the domain repository system (src/repositories/), enabling seamless
 * switching between LocalStorage engine and remote Express / Prisma endpoints.
 */

import {
  repositories,
  type DbFolder,
  type DbPrompt,
  type DbTemplate,
  type DbAIProfile,
  type DbWorkspace,
  type DbWorkspaceMember,
  type DbWorkspaceInvite,
  type DbAIStandards,
  type SubscriptionStatus,
  type AnalyticsStats,
  type WorkspaceAnalytics,
} from "../repositories/index.js";

// Re-export types so components only need one import
export type {
  DbFolder as Folder,
  DbPrompt as Prompt,
  DbTemplate as Template,
  DbAIProfile as AIProfile,
  DbWorkspace as Workspace,
  DbWorkspaceMember as WorkspaceMember,
  DbWorkspaceInvite as WorkspaceInvite,
  DbAIStandards as AIStandards,
  SubscriptionStatus,
  AnalyticsStats,
  WorkspaceAnalytics,
};

// ─── Folders ──────────────────────────────────────────────────────────────────

export const foldersApi = {
  list: (userId: string) => repositories.folders.listByUserId(userId),

  create: (userId: string, data: { name: string; icon?: string; color?: string }) =>
    repositories.folders.create(userId, data),

  update: (id: string, data: { name?: string; icon?: string; color?: string }) =>
    repositories.folders.update(id, data),

  delete: (id: string) => repositories.folders.delete(id),
};

// ─── Prompts ──────────────────────────────────────────────────────────────────

export const promptsApi = {
  list: (
    userId: string,
    opts: { folderId?: string; category?: string; search?: string; favoritesOnly?: boolean } = {},
  ) => repositories.prompts.list(userId, opts),

  get: (id: string) => repositories.prompts.findById(id),

  create: (
    userId: string,
    data: {
      title: string;
      rawContent: string;
      category?: string;
      mode?: string;
      tags?: string[];
      aiPlatform?: string;
      folderId?: string;
      optimizedContent?: string;
    },
  ) => repositories.prompts.create(userId, data),

  update: (
    id: string,
    data: Partial<{
      title: string;
      rawContent: string;
      optimizedContent: string;
      category: string;
      mode: string;
      tags: string[];
      aiPlatform: string;
      folderId: string;
      isFavorite: boolean;
      isArchived: boolean;
    }>,
  ) => repositories.prompts.update(id, data),

  toggleFavorite: (id: string) => repositories.prompts.toggleFavorite(id),

  delete: (id: string) => repositories.prompts.delete(id),

  optimize: (
    id: string,
    mode: string,
    profile?: { profession?: string; techStack?: string; responseStyle?: string },
  ) => repositories.prompts.optimize(id, mode, profile),
};

// ─── Templates ────────────────────────────────────────────────────────────────

export const templatesApi = {
  list: (category?: string) => repositories.templates.list(category),

  saveToVault: (userId: string, templateId: string) =>
    repositories.templates.saveToVault(userId, templateId),
};

// ─── AI Profile ───────────────────────────────────────────────────────────────

export const profileApi = {
  get: (userId: string) => repositories.profiles.findByUserId(userId),

  upsert: (
    userId: string,
    data: {
      profession?: string;
      experience?: string;
      mainDomain?: string;
      platforms?: string[];
      responseStyle?: string;
      techStack?: string;
      customRules?: string;
    },
  ) => repositories.profiles.upsert(userId, data),
};

// ─── Analytics / Stats ────────────────────────────────────────────────────────

export const analyticsApi = {
  getStats: (userId: string) => repositories.analytics.getUserStats(userId),
};

// ─── Subscription & Billing ──────────────────────────────────────────────────

export const subscriptionApi = {
  getStatus: (userId: string): Promise<SubscriptionStatus> => {
    return repositories.users.getSubscriptionStatus(userId);
  },

  createCheckoutSession: async (
    userId: string,
    tier: "pro" | "teams",
  ): Promise<{ url: string; sessionId?: string }> => {
    try {
      const res = await fetch("/api/stripe/checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": userId },
        body: JSON.stringify({
          tier,
          returnUrl: `${window.location.origin}/settings/billing`,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data?.url) return json.data;
      }
    } catch {
      // Backend not running / fallback
    }
    return {
      url: `/settings/billing?checkout_success=true&tier=${tier}`,
      sessionId: `cs_sim_${Date.now()}`,
    };
  },

  createPortalSession: async (userId: string): Promise<{ url: string }> => {
    try {
      const res = await fetch("/api/stripe/portal-session", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": userId },
        body: JSON.stringify({ returnUrl: `${window.location.origin}/settings/billing` }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data?.url) return json.data;
      }
    } catch {
      // Backend not running
    }
    return { url: `/settings/billing?portal_simulated=true` };
  },

  simulateTier: (
    userId: string,
    tier: "free" | "pro" | "teams",
    status: "active" | "trialing" | "past_due" | "canceled" = "active",
  ) => {
    return repositories.users.updateSubscription(userId, {
      subscriptionTier: tier,
      subscriptionStatus: status,
      currentPeriodEnd:
        tier !== "free" ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
    });
  },
};

// ─── Workspaces & Teams ──────────────────────────────────────────────────────

export const workspacesApi = {
  list: (userId: string) => repositories.workspaces.listByUserId(userId),
  get: (id: string) => repositories.workspaces.findById(id),
  create: (userId: string, data: { name: string; slug?: string; plan?: "teams" | "enterprise" }) =>
    repositories.workspaces.create(userId, data),
  update: (id: string, data: Partial<DbWorkspace>) => repositories.workspaces.update(id, data),
  getMembers: (workspaceId: string) => repositories.workspaces.getMembers(workspaceId),
  inviteMember: (workspaceId: string, email: string, role: "admin" | "editor" | "viewer") =>
    repositories.workspaces.inviteMember(workspaceId, email, role),
  getInvites: (workspaceId: string) => repositories.workspaces.getInvites(workspaceId),
  removeMember: (workspaceId: string, memberId: string) =>
    repositories.workspaces.removeMember(workspaceId, memberId),
  updateRole: (workspaceId: string, memberId: string, role: "admin" | "editor" | "viewer") =>
    repositories.workspaces.updateMemberRole(workspaceId, memberId, role),
  updateStandards: (workspaceId: string, standards: Partial<DbAIStandards>) =>
    repositories.workspaces.updateStandards(workspaceId, standards),
  getPrompts: (workspaceId: string, opts?: { category?: string; search?: string }) =>
    repositories.workspaces.getPrompts(workspaceId, opts),
  createPrompt: (
    workspaceId: string,
    userId: string,
    data: {
      title: string;
      rawContent: string;
      optimizedContent?: string;
      category?: string;
      mode?: string;
      tags?: string[];
      aiPlatform?: string;
    },
  ) => repositories.workspaces.createPrompt(workspaceId, userId, data),
  getTemplates: (workspaceId: string) => repositories.workspaces.getTemplates(workspaceId),
  createTemplate: (
    workspaceId: string,
    authorId: string,
    data: {
      title: string;
      description: string;
      category: string;
      promptTemplate: string;
      tags?: string[];
    },
  ) => repositories.workspaces.createTemplate(workspaceId, authorId, data),
  getAnalytics: (workspaceId: string) => repositories.workspaces.getAnalytics(workspaceId),
};

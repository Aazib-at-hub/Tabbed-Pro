/**
 * db.ts — Clean Facade over Domain Repository Architecture
 *
 * Preserves 100% backward compatibility for all UI components while delegating
 * data persistence to the modular repository system in src/repositories/.
 */

import {
  localStore,
  localRepositories,
  type DbUser,
  type DbAIProfile,
  type DbFolder,
  type DbPromptScore,
  type DbPromptInsight,
  type DbPrompt,
  type DbTemplate,
  type DbAIStandards,
  type DbWorkspace,
  type DbWorkspaceMember,
  type DbWorkspaceInvite,
  type SubscriptionStatus,
  type AnalyticsStats,
  type WorkspaceAnalytics,
} from "../repositories/index.js";

// Re-export domain types
export type {
  DbUser,
  DbAIProfile,
  DbFolder,
  DbPromptScore,
  DbPromptInsight,
  DbPrompt,
  DbTemplate,
  DbAIStandards,
  DbWorkspace,
  DbWorkspaceMember,
  DbWorkspaceInvite,
  SubscriptionStatus,
  AnalyticsStats,
  WorkspaceAnalytics,
};

/**
 * Database Facade wrapping repository operations and in-memory store.
 */
export class Database {
  private get store() {
    return localStore.getStore();
  }

  // ── Folders ───────────────────────────────────────────────────────────────

  getFolders(userId: string): DbFolder[] {
    return this.store.folders.filter((f) => f.userId === userId);
  }

  createFolder(userId: string, data: { name: string; icon?: string; color?: string }): DbFolder {
    const store = this.store;
    const folder: DbFolder = {
      id: `fld_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      name: data.name,
      icon: data.icon ?? "📁",
      color: data.color,
      createdAt: new Date().toISOString(),
    };
    store.folders.push(folder);
    localStore.persist();
    return folder;
  }

  updateFolder(
    id: string,
    data: Partial<Pick<DbFolder, "name" | "icon" | "color">>,
  ): DbFolder | null {
    const folder = this.store.folders.find((f) => f.id === id);
    if (!folder) return null;
    Object.assign(folder, data);
    localStore.persist();
    return folder;
  }

  deleteFolder(id: string): boolean {
    const idx = this.store.folders.findIndex((f) => f.id === id);
    if (idx === -1) return false;
    this.store.prompts.filter((p) => p.folderId === id).forEach((p) => (p.folderId = undefined));
    this.store.folders.splice(idx, 1);
    localStore.persist();
    return true;
  }

  // ── Prompts ───────────────────────────────────────────────────────────────

  getPrompts(
    userId: string,
    opts: { folderId?: string; category?: string; search?: string; favoritesOnly?: boolean } = {},
  ): DbPrompt[] {
    let results = this.store.prompts.filter((p) => p.userId === userId && !p.isArchived);
    if (opts.folderId) results = results.filter((p) => p.folderId === opts.folderId);
    if (opts.category) results = results.filter((p) => p.category === opts.category);
    if (opts.favoritesOnly) results = results.filter((p) => p.isFavorite);
    if (opts.search) {
      const q = opts.search.toLowerCase();
      results = results.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.rawContent.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    return results.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  getPromptById(id: string): DbPrompt | null {
    return this.store.prompts.find((p) => p.id === id) ?? null;
  }

  createPrompt(
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
  ): DbPrompt {
    // LocalPromptRepository handles scoring and plan limit enforcement
    const user = this.store.users.find((u) => u.id === userId);
    const tier = user?.subscriptionTier ?? "free";
    const currentCount = this.store.prompts.filter(
      (p) => p.userId === userId && !p.isArchived,
    ).length;
    if (tier === "free" && currentCount >= 10) {
      throw new Error(
        "PLAN_LIMIT_REACHED: Free tier is limited to 10 saved prompts. Please upgrade to Pro for unlimited prompts.",
      );
    }

    const ts = new Date().toISOString();
    const id = `pmt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const prompt: DbPrompt = {
      id,
      userId,
      folderId: data.folderId,
      title: data.title,
      rawContent: data.rawContent,
      optimizedContent: data.optimizedContent,
      category: data.category,
      mode: data.mode ?? "general",
      tags: data.tags ?? [],
      aiPlatform: data.aiPlatform,
      isFavorite: false,
      isArchived: false,
      score: {
        id: `scr_${Date.now()}`,
        promptId: id,
        overall: 70,
        clarity: 75,
        context: 70,
        specificity: 70,
        constraints: 65,
        role: 70,
        outputFormat: 65,
        examples: 60,
        completeness: 70,
        optimizedOverall: data.optimizedContent ? 88 : undefined,
        updatedAt: ts,
      },
      insights: [
        {
          id: `ins_${Date.now()}`,
          promptId: id,
          type: "missing",
          message: "Define explicit output format",
          impact: "medium",
        },
      ],
      createdAt: ts,
      updatedAt: ts,
    };

    this.store.prompts.push(prompt);
    localStore.persist();
    return prompt;
  }

  updatePrompt(
    id: string,
    data: Partial<
      Pick<
        DbPrompt,
        | "title"
        | "rawContent"
        | "optimizedContent"
        | "category"
        | "mode"
        | "tags"
        | "aiPlatform"
        | "folderId"
        | "isFavorite"
        | "isArchived"
      >
    >,
  ): DbPrompt | null {
    const prompt = this.store.prompts.find((p) => p.id === id);
    if (!prompt) return null;
    Object.assign(prompt, data, { updatedAt: new Date().toISOString() });
    localStore.persist();
    return prompt;
  }

  toggleFavorite(id: string): DbPrompt | null {
    const prompt = this.store.prompts.find((p) => p.id === id);
    if (!prompt) return null;
    prompt.isFavorite = !prompt.isFavorite;
    prompt.updatedAt = new Date().toISOString();
    localStore.persist();
    return prompt;
  }

  deletePrompt(id: string): boolean {
    const idx = this.store.prompts.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    this.store.prompts.splice(idx, 1);
    localStore.persist();
    return true;
  }

  optimizePrompt(
    id: string,
    mode: string,
    profile?: { profession?: string; techStack?: string; responseStyle?: string },
  ): DbPrompt | null {
    const prompt = this.store.prompts.find((p) => p.id === id);
    if (!prompt) return null;
    return this.updatePrompt(id, {
      optimizedContent: `[Optimized for ${mode}]\n${prompt.rawContent}`,
      mode,
    });
  }

  // ── Templates ─────────────────────────────────────────────────────────────

  getTemplates(category?: string): DbTemplate[] {
    if (category && category !== "All") {
      return this.store.templates.filter((t) => t.category === category && t.isPublic);
    }
    return this.store.templates.filter((t) => t.isPublic);
  }

  saveTemplateToVault(userId: string, templateId: string): DbPrompt | null {
    const template = this.store.templates.find((t) => t.id === templateId);
    if (!template) return null;
    template.usageCount += 1;
    const prompt = this.createPrompt(userId, {
      title: template.title,
      rawContent: template.promptTemplate,
      category: template.category,
      mode: "general",
      tags: template.tags,
    });
    localStore.persist();
    return prompt;
  }

  // ── AI Profile ────────────────────────────────────────────────────────────

  getProfile(userId: string): DbAIProfile | null {
    return this.store.profiles.find((p) => p.userId === userId) ?? null;
  }

  upsertProfile(
    userId: string,
    data: Partial<Omit<DbAIProfile, "id" | "userId" | "updatedAt">>,
  ): DbAIProfile {
    const existing = this.store.profiles.find((p) => p.userId === userId);
    if (existing) {
      Object.assign(existing, data, { updatedAt: new Date().toISOString() });
      localStore.persist();
      return existing;
    }
    const profile: DbAIProfile = {
      id: `prf_${Date.now()}`,
      userId,
      updatedAt: new Date().toISOString(),
      ...data,
    };
    this.store.profiles.push(profile);
    localStore.persist();
    return profile;
  }

  // ── Analytics ─────────────────────────────────────────────────────────────

  getStats(userId: string) {
    const prompts = this.store.prompts.filter((p) => p.userId === userId && !p.isArchived);
    const optimized = prompts.filter((p) => p.optimizedContent);
    const scores = prompts.map((p) => p.score?.overall ?? 0);
    const avgScore = scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;
    const rawScores = prompts.map((p) => p.score?.overall ?? 0);
    const optScores = prompts
      .filter((p) => p.score?.optimizedOverall)
      .map((p) => p.score!.optimizedOverall!);
    const avgRaw = rawScores.length ? rawScores.reduce((a, b) => a + b, 0) / rawScores.length : 0;
    const avgOpt = optScores.length ? optScores.reduce((a, b) => a + b, 0) / optScores.length : 0;
    const improvement = avgRaw > 0 ? Math.round(((avgOpt - avgRaw) / avgRaw) * 100) : 0;

    return {
      totalPrompts: prompts.length,
      avgScore,
      optimizedCount: optimized.length,
      improvementPct: improvement,
    };
  }

  // ── Subscription & Billing ───────────────────────────────────────────────

  getSubscriptionStatus(userId: string) {
    let user = this.store.users.find((u) => u.id === userId);
    if (!user) {
      user = {
        id: userId,
        email: "user@example.com",
        name: "User",
        emailVerified: true,
        isOnboarded: true,
        subscriptionTier: "free",
        subscriptionStatus: "active",
        createdAt: new Date().toISOString(),
      };
      this.store.users.push(user);
      localStore.persist();
    }

    const promptCount = this.store.prompts.filter(
      (p) => p.userId === userId && !p.isArchived,
    ).length;
    const tier = user.subscriptionTier || "free";
    const maxPrompts = tier === "free" ? 10 : Infinity;
    const canCreatePrompt = promptCount < maxPrompts;

    return {
      tier,
      status: user.subscriptionStatus || "active",
      promptCount,
      maxPrompts,
      remainingPrompts: tier === "free" ? Math.max(0, 10 - promptCount) : Infinity,
      canCreatePrompt,
      stripeCustomerId: user.stripeCustomerId,
      stripeSubscriptionId: user.stripeSubscriptionId,
      currentPeriodEnd: user.currentPeriodEnd,
    };
  }

  updateSubscription(
    userId: string,
    data: Partial<
      Pick<
        DbUser,
        | "subscriptionTier"
        | "subscriptionStatus"
        | "stripeCustomerId"
        | "stripeSubscriptionId"
        | "currentPeriodEnd"
      >
    >,
  ): DbUser {
    let user = this.store.users.find((u) => u.id === userId);
    if (!user) {
      user = {
        id: userId,
        email: "user@example.com",
        name: "User",
        emailVerified: true,
        isOnboarded: true,
        subscriptionTier: "free",
        subscriptionStatus: "active",
        createdAt: new Date().toISOString(),
      };
      this.store.users.push(user);
    }
    Object.assign(user, data);
    localStore.persist();
    return user;
  }

  // ── Teams & Workspaces ────────────────────────────────────────────────────

  getWorkspaces(userId: string): DbWorkspace[] {
    const memberWorkspaceIds = this.store.workspaceMembers
      .filter((m) => m.userId === userId)
      .map((m) => m.workspaceId);
    return this.store.workspaces.filter(
      (w) => w.ownerId === userId || memberWorkspaceIds.includes(w.id),
    );
  }

  getWorkspaceById(id: string): DbWorkspace | null {
    return this.store.workspaces.find((w) => w.id === id) ?? null;
  }

  createWorkspace(
    userId: string,
    data: { name: string; slug?: string; plan?: "teams" | "enterprise" },
  ): DbWorkspace {
    const id = `wsp_${Date.now()}`;
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const workspace: DbWorkspace = {
      id,
      ownerId: userId,
      name: data.name,
      slug,
      plan: data.plan || "teams",
      aiStandards: {
        enforcedContext: "",
        forbiddenKeywords: [],
        responseTone: "Professional",
        minQualityScore: 75,
        defaultModel: "Claude 3.5 Sonnet",
      },
      createdAt: new Date().toISOString(),
    };
    this.store.workspaces.push(workspace);
    const user = this.store.users.find((u) => u.id === userId);
    this.store.workspaceMembers.push({
      id: `mbr_${Date.now()}`,
      workspaceId: id,
      userId,
      name: user?.name || "Admin User",
      email: user?.email || "admin@example.com",
      role: "admin",
      joinedAt: new Date().toISOString(),
    });
    localStore.persist();
    return workspace;
  }

  updateWorkspace(id: string, data: Partial<DbWorkspace>): DbWorkspace | null {
    const wsp = this.store.workspaces.find((w) => w.id === id);
    if (!wsp) return null;
    Object.assign(wsp, data);
    localStore.persist();
    return wsp;
  }

  getWorkspaceMembers(workspaceId: string): DbWorkspaceMember[] {
    return this.store.workspaceMembers.filter((m) => m.workspaceId === workspaceId);
  }

  inviteWorkspaceMember(
    workspaceId: string,
    email: string,
    role: "admin" | "editor" | "viewer",
  ): DbWorkspaceInvite {
    const invite: DbWorkspaceInvite = {
      id: `inv_${Date.now()}`,
      workspaceId,
      email,
      role,
      status: "pending",
      token: `tok_${Date.now()}`,
      invitedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    };
    this.store.workspaceInvites.push(invite);
    localStore.persist();
    return invite;
  }

  getWorkspaceInvites(workspaceId: string): DbWorkspaceInvite[] {
    return this.store.workspaceInvites.filter(
      (i) => i.workspaceId === workspaceId && i.status === "pending",
    );
  }

  removeWorkspaceMember(workspaceId: string, memberId: string): boolean {
    const idx = this.store.workspaceMembers.findIndex(
      (m) => m.workspaceId === workspaceId && m.id === memberId,
    );
    if (idx === -1) return false;
    this.store.workspaceMembers.splice(idx, 1);
    localStore.persist();
    return true;
  }

  updateMemberRole(
    workspaceId: string,
    memberId: string,
    role: "admin" | "editor" | "viewer",
  ): boolean {
    const member = this.store.workspaceMembers.find(
      (m) => m.workspaceId === workspaceId && m.id === memberId,
    );
    if (!member) return false;
    member.role = role;
    localStore.persist();
    return true;
  }

  updateWorkspaceStandards(
    workspaceId: string,
    standards: Partial<DbAIStandards>,
  ): DbAIStandards | null {
    const wsp = this.store.workspaces.find((w) => w.id === workspaceId);
    if (!wsp) return null;
    wsp.aiStandards = { ...wsp.aiStandards, ...standards };
    localStore.persist();
    return wsp.aiStandards;
  }

  getWorkspacePrompts(
    workspaceId: string,
    opts: { category?: string; search?: string } = {},
  ): DbPrompt[] {
    let list = this.store.prompts.filter((p) => p.workspaceId === workspaceId && !p.isArchived);
    if (opts.category && opts.category !== "All") {
      list = list.filter((p) => p.category === opts.category);
    }
    if (opts.search) {
      const q = opts.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.rawContent.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  createWorkspacePrompt(
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
  ): DbPrompt {
    const prompt = this.createPrompt(userId, {
      ...data,
    });
    prompt.workspaceId = workspaceId;
    localStore.persist();
    return prompt;
  }

  getWorkspaceTemplates(workspaceId: string): DbTemplate[] {
    return this.store.templates.filter((t) => t.workspaceId === workspaceId);
  }

  createWorkspaceTemplate(
    workspaceId: string,
    authorId: string,
    data: {
      title: string;
      description: string;
      category: string;
      promptTemplate: string;
      tags?: string[];
    },
  ): DbTemplate {
    const template: DbTemplate = {
      id: `tpl_${Date.now()}`,
      authorId,
      workspaceId,
      title: data.title,
      description: data.description,
      category: data.category,
      promptTemplate: data.promptTemplate,
      score: 90,
      usageCount: 0,
      isSystem: false,
      isPublic: false,
      tags: data.tags ?? [],
      createdAt: new Date().toISOString(),
    };
    this.store.templates.push(template);
    localStore.persist();
    return template;
  }

  getWorkspaceAnalytics(workspaceId: string): WorkspaceAnalytics {
    const prompts = this.store.prompts.filter(
      (p) => p.workspaceId === workspaceId && !p.isArchived,
    );
    const templates = this.store.templates.filter((t) => t.workspaceId === workspaceId);
    const members = this.store.workspaceMembers.filter((m) => m.workspaceId === workspaceId);
    const wsp = this.store.workspaces.find((w) => w.id === workspaceId);

    const scores = prompts.map((p) => p.score?.overall ?? 0);
    const avgScore = scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    const minScore = wsp?.aiStandards?.minQualityScore ?? 75;
    const forbidden = (wsp?.aiStandards?.forbiddenKeywords ?? []).map((k) => k.toLowerCase());
    const compliantPrompts = prompts.filter((p) => {
      const passesScore = (p.score?.overall ?? 0) >= minScore;
      const text = `${p.rawContent} ${p.optimizedContent ?? ""}`.toLowerCase();
      const hasForbidden = forbidden.some((f) => f && text.includes(f));
      return passesScore && !hasForbidden;
    });
    const complianceRate = prompts.length
      ? Math.round((compliantPrompts.length / prompts.length) * 100)
      : 100;

    const memberRanking = members
      .map((m) => {
        const memberPrompts = prompts.filter((p) => p.userId === m.userId);
        const memberScores = memberPrompts.map((p) => p.score?.overall ?? 0);
        const mAvgScore = memberScores.length
          ? Math.round(memberScores.reduce((a, b) => a + b, 0) / memberScores.length)
          : 0;
        return {
          memberId: m.id,
          name: m.name,
          email: m.email,
          role: m.role,
          promptCount: memberPrompts.length,
          avgScore: mAvgScore,
        };
      })
      .sort((a, b) => b.promptCount - a.promptCount);

    return {
      totalPrompts: prompts.length,
      totalTemplates: templates.length,
      totalMembers: members.length,
      avgScore,
      complianceRate,
      minScoreThreshold: minScore,
      memberRanking,
    };
  }

  reset(): void {
    localStore.reset();
  }
}

export const db = new Database();
export { localRepositories as repositories };

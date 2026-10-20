import type { IWorkspaceRepository } from "../interfaces/IWorkspaceRepository.js";
import type {
  DbWorkspace,
  DbWorkspaceMember,
  DbWorkspaceInvite,
  DbAIStandards,
  DbPrompt,
  DbPromptScore,
  DbTemplate,
  WorkspaceAnalytics,
  CreateWorkspaceInput,
  CreatePromptInput,
  CreateTemplateInput,
  WorkspaceRole,
} from "../types.js";
import { localStore, uid, now } from "./local-store.js";
import { analysePrompt } from "../../lib/tabbed-data.js";

export class LocalWorkspaceRepository implements IWorkspaceRepository {
  async listByUserId(userId: string): Promise<DbWorkspace[]> {
    const store = localStore.getStore();
    const memberWorkspaceIds = store.workspaceMembers
      .filter((m) => m.userId === userId)
      .map((m) => m.workspaceId);
    return store.workspaces.filter(
      (w) => w.ownerId === userId || memberWorkspaceIds.includes(w.id),
    );
  }

  async findById(id: string): Promise<DbWorkspace | null> {
    const store = localStore.getStore();
    return store.workspaces.find((w) => w.id === id) ?? null;
  }

  async create(userId: string, data: CreateWorkspaceInput): Promise<DbWorkspace> {
    const store = localStore.getStore();
    const id = uid("wsp");
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
      createdAt: now(),
    };
    store.workspaces.push(workspace);

    const user = store.users.find((u) => u.id === userId);
    store.workspaceMembers.push({
      id: uid("mbr"),
      workspaceId: id,
      userId,
      name: user?.name || "Admin User",
      email: user?.email || "admin@example.com",
      role: "admin",
      joinedAt: now(),
    });

    localStore.persist();
    return workspace;
  }

  async update(id: string, data: Partial<DbWorkspace>): Promise<DbWorkspace | null> {
    const store = localStore.getStore();
    const wsp = store.workspaces.find((w) => w.id === id);
    if (!wsp) return null;
    Object.assign(wsp, data);
    localStore.persist();
    return wsp;
  }

  async getMembers(workspaceId: string): Promise<DbWorkspaceMember[]> {
    const store = localStore.getStore();
    return store.workspaceMembers.filter((m) => m.workspaceId === workspaceId);
  }

  async addMember(
    workspaceId: string,
    userId: string,
    role: WorkspaceRole = "viewer",
  ): Promise<DbWorkspaceMember> {
    const store = localStore.getStore();
    const user = store.users.find((u) => u.id === userId);
    const member: DbWorkspaceMember = {
      id: uid("mbr"),
      workspaceId,
      userId,
      name: user?.name || "Team Member",
      email: user?.email || "member@example.com",
      role,
      joinedAt: now(),
    };
    store.workspaceMembers.push(member);
    localStore.persist();
    return member;
  }

  async updateMemberRole(
    workspaceId: string,
    memberId: string,
    role: WorkspaceRole,
  ): Promise<boolean> {
    const store = localStore.getStore();
    const member = store.workspaceMembers.find(
      (m) => m.workspaceId === workspaceId && m.id === memberId,
    );
    if (!member) return false;
    member.role = role;
    localStore.persist();
    return true;
  }

  async removeMember(workspaceId: string, memberId: string): Promise<boolean> {
    const store = localStore.getStore();
    const idx = store.workspaceMembers.findIndex(
      (m) => m.workspaceId === workspaceId && m.id === memberId,
    );
    if (idx === -1) return false;
    store.workspaceMembers.splice(idx, 1);
    localStore.persist();
    return true;
  }

  async inviteMember(
    workspaceId: string,
    email: string,
    role: WorkspaceRole,
  ): Promise<DbWorkspaceInvite> {
    const store = localStore.getStore();
    const invite: DbWorkspaceInvite = {
      id: uid("inv"),
      workspaceId,
      email,
      role,
      status: "pending",
      token: uid("tok"),
      invitedAt: now(),
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    };
    store.workspaceInvites.push(invite);
    localStore.persist();
    return invite;
  }

  async getInvites(workspaceId: string): Promise<DbWorkspaceInvite[]> {
    const store = localStore.getStore();
    return store.workspaceInvites.filter(
      (i) => i.workspaceId === workspaceId && i.status === "pending",
    );
  }

  async updateStandards(
    workspaceId: string,
    standards: Partial<DbAIStandards>,
  ): Promise<DbAIStandards | null> {
    const store = localStore.getStore();
    const wsp = store.workspaces.find((w) => w.id === workspaceId);
    if (!wsp) return null;
    wsp.aiStandards = { ...wsp.aiStandards, ...standards };
    localStore.persist();
    return wsp.aiStandards;
  }

  async getPrompts(
    workspaceId: string,
    opts: { category?: string; search?: string } = {},
  ): Promise<DbPrompt[]> {
    const store = localStore.getStore();
    let list = store.prompts.filter((p) => p.workspaceId === workspaceId && !p.isArchived);

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

  async createPrompt(
    workspaceId: string,
    userId: string,
    data: CreatePromptInput,
  ): Promise<DbPrompt> {
    const store = localStore.getStore();
    const id = uid("pmt");
    const analysis = analysePrompt(data.rawContent);
    const breakdown = analysis.breakdown;
    const ts = now();

    let optScore: number | undefined;
    if (data.optimizedContent) {
      const optAnalysis = analysePrompt(data.optimizedContent);
      optScore = optAnalysis.overall;
    }

    const score: DbPromptScore = {
      id: uid("scr"),
      promptId: id,
      overall: analysis.overall,
      clarity: breakdown.clarity,
      context: breakdown.context,
      specificity: breakdown.specificity,
      constraints: breakdown.constraints,
      role: breakdown.role,
      outputFormat: breakdown.outputFormat,
      examples: breakdown.examples,
      completeness: breakdown.completeness,
      optimizedOverall: optScore,
      updatedAt: ts,
    };

    const prompt: DbPrompt = {
      id,
      userId,
      workspaceId,
      title: data.title,
      rawContent: data.rawContent,
      optimizedContent: data.optimizedContent,
      category: data.category,
      mode: data.mode ?? "general",
      tags: data.tags ?? [],
      aiPlatform: data.aiPlatform,
      isFavorite: false,
      isArchived: false,
      score,
      insights: [],
      createdAt: ts,
      updatedAt: ts,
    };

    store.prompts.push(prompt);
    localStore.persist();
    return prompt;
  }

  async getTemplates(workspaceId: string): Promise<DbTemplate[]> {
    const store = localStore.getStore();
    return store.templates.filter((t) => t.workspaceId === workspaceId);
  }

  async createTemplate(
    workspaceId: string,
    authorId: string,
    data: CreateTemplateInput,
  ): Promise<DbTemplate> {
    const store = localStore.getStore();
    const analysis = analysePrompt(data.promptTemplate);
    const template: DbTemplate = {
      id: uid("tpl"),
      authorId,
      workspaceId,
      title: data.title,
      description: data.description,
      category: data.category,
      promptTemplate: data.promptTemplate,
      score: analysis.overall,
      usageCount: 0,
      isSystem: false,
      isPublic: false,
      tags: data.tags ?? [],
      createdAt: now(),
    };
    store.templates.push(template);
    localStore.persist();
    return template;
  }

  async getAnalytics(workspaceId: string): Promise<WorkspaceAnalytics> {
    const store = localStore.getStore();
    const prompts = store.prompts.filter((p) => p.workspaceId === workspaceId && !p.isArchived);
    const templates = store.templates.filter((t) => t.workspaceId === workspaceId);
    const members = store.workspaceMembers.filter((m) => m.workspaceId === workspaceId);
    const wsp = store.workspaces.find((w) => w.id === workspaceId);

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
}

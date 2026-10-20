import type { PrismaClient } from "@prisma/client";
import type { IWorkspaceRepository } from "../../../repositories/interfaces/IWorkspaceRepository.js";
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
} from "../../../repositories/types.js";
import { analysePrompt } from "../../../lib/tabbed-data.js";

export class PrismaWorkspaceRepository implements IWorkspaceRepository {
  constructor(private prisma: PrismaClient) {}

  private mapWorkspace(raw: any): DbWorkspace {
    return {
      id: raw.id,
      ownerId: raw.ownerId,
      name: raw.name,
      slug: raw.slug,
      logoUrl: raw.logoUrl ?? undefined,
      plan: raw.plan as any,
      aiStandards: {
        enforcedContext: raw.enforcedContext ?? "",
        forbiddenKeywords: raw.forbiddenKeywords ?? [],
        responseTone: raw.responseTone ?? "Professional",
        minQualityScore: raw.minQualityScore ?? 75,
        defaultModel: raw.defaultModel ?? "Claude 3.5 Sonnet",
      },
      createdAt: raw.createdAt.toISOString(),
    };
  }

  async listByUserId(userId: string): Promise<DbWorkspace[]> {
    const workspaces = await this.prisma.workspace.findMany({
      where: {
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
      orderBy: { createdAt: "desc" },
    });
    return workspaces.map((w) => this.mapWorkspace(w));
  }

  async findById(id: string): Promise<DbWorkspace | null> {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id },
    });
    return workspace ? this.mapWorkspace(workspace) : null;
  }

  async create(userId: string, data: CreateWorkspaceInput): Promise<DbWorkspace> {
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    const created = await this.prisma.workspace.create({
      data: {
        ownerId: userId,
        name: data.name,
        slug,
        plan: data.plan || "teams",
        members: {
          create: {
            userId,
            role: "admin",
          },
        },
      },
    });

    return this.mapWorkspace(created);
  }

  async update(id: string, data: Partial<DbWorkspace>): Promise<DbWorkspace | null> {
    const updated = await this.prisma.workspace.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        logoUrl: data.logoUrl,
        plan: data.plan,
      },
    });
    return this.mapWorkspace(updated);
  }

  async getMembers(workspaceId: string): Promise<DbWorkspaceMember[]> {
    const members = await this.prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: { user: true },
      orderBy: { joinedAt: "asc" },
    });

    return members.map((m) => ({
      id: m.id,
      workspaceId: m.workspaceId,
      userId: m.userId,
      name: m.user?.name ?? "Team Member",
      email: m.user?.email ?? "member@example.com",
      avatarUrl: m.user?.avatarUrl ?? undefined,
      role: m.role as WorkspaceRole,
      joinedAt: m.joinedAt.toISOString(),
    }));
  }

  async addMember(
    workspaceId: string,
    userId: string,
    role: WorkspaceRole = "viewer",
  ): Promise<DbWorkspaceMember> {
    const member = await this.prisma.workspaceMember.create({
      data: {
        workspaceId,
        userId,
        role,
      },
      include: { user: true },
    });

    return {
      id: member.id,
      workspaceId: member.workspaceId,
      userId: member.userId,
      name: member.user?.name ?? "Team Member",
      email: member.user?.email ?? "member@example.com",
      avatarUrl: member.user?.avatarUrl ?? undefined,
      role: member.role as WorkspaceRole,
      joinedAt: member.joinedAt.toISOString(),
    };
  }

  async updateMemberRole(
    workspaceId: string,
    memberId: string,
    role: WorkspaceRole,
  ): Promise<boolean> {
    await this.prisma.workspaceMember.update({
      where: { id: memberId },
      data: { role },
    });
    return true;
  }

  async removeMember(workspaceId: string, memberId: string): Promise<boolean> {
    await this.prisma.workspaceMember.delete({
      where: { id: memberId },
    });
    return true;
  }

  async inviteMember(
    workspaceId: string,
    email: string,
    role: WorkspaceRole,
  ): Promise<DbWorkspaceInvite> {
    const token = `inv_tok_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    const invite = await this.prisma.workspaceInvite.create({
      data: {
        workspaceId,
        email: email.toLowerCase(),
        role,
        status: "pending",
        token,
        expiresAt,
      },
    });

    return {
      id: invite.id,
      workspaceId: invite.workspaceId,
      email: invite.email,
      role: invite.role as WorkspaceRole,
      status: invite.status as any,
      token: invite.token,
      invitedAt: invite.invitedAt.toISOString(),
      expiresAt: invite.expiresAt.toISOString(),
    };
  }

  async getInvites(workspaceId: string): Promise<DbWorkspaceInvite[]> {
    const invites = await this.prisma.workspaceInvite.findMany({
      where: { workspaceId, status: "pending" },
    });

    return invites.map((inv) => ({
      id: inv.id,
      workspaceId: inv.workspaceId,
      email: inv.email,
      role: inv.role as WorkspaceRole,
      status: inv.status as any,
      token: inv.token,
      invitedAt: inv.invitedAt.toISOString(),
      expiresAt: inv.expiresAt.toISOString(),
    }));
  }

  async updateStandards(
    workspaceId: string,
    standards: Partial<DbAIStandards>,
  ): Promise<DbAIStandards | null> {
    const updated = await this.prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        enforcedContext: standards.enforcedContext,
        forbiddenKeywords: standards.forbiddenKeywords,
        responseTone: standards.responseTone,
        minQualityScore: standards.minQualityScore,
        defaultModel: standards.defaultModel,
      },
    });

    return {
      enforcedContext: updated.enforcedContext ?? "",
      forbiddenKeywords: updated.forbiddenKeywords ?? [],
      responseTone: updated.responseTone ?? "Professional",
      minQualityScore: updated.minQualityScore ?? 75,
      defaultModel: updated.defaultModel ?? "Claude 3.5 Sonnet",
    };
  }

  async getPrompts(
    workspaceId: string,
    opts: { category?: string; search?: string } = {},
  ): Promise<DbPrompt[]> {
    const where: any = { workspaceId, isArchived: false };
    if (opts.category && opts.category !== "All") {
      where.category = opts.category;
    }
    if (opts.search) {
      where.OR = [
        { title: { contains: opts.search, mode: "insensitive" } },
        { rawContent: { contains: opts.search, mode: "insensitive" } },
      ];
    }

    const prompts = await this.prisma.prompt.findMany({
      where,
      include: { score: true, insights: true },
      orderBy: { createdAt: "desc" },
    });

    return prompts.map((p) => {
      let score: DbPromptScore | undefined;
      if (p.score) {
        score = {
          id: p.score.id,
          promptId: p.score.promptId,
          overall: p.score.overall,
          clarity: p.score.clarity,
          context: p.score.context,
          specificity: p.score.specificity,
          constraints: p.score.constraints,
          role: p.score.role,
          outputFormat: p.score.outputFormat,
          examples: p.score.examples,
          completeness: p.score.completeness,
          optimizedOverall: p.score.optimizedOverall ?? undefined,
          updatedAt: p.score.updatedAt.toISOString(),
        };
      }
      return {
        id: p.id,
        userId: p.userId,
        workspaceId: p.workspaceId ?? undefined,
        title: p.title,
        rawContent: p.rawContent,
        optimizedContent: p.optimizedContent ?? undefined,
        category: p.category ?? undefined,
        mode: p.mode,
        tags: p.tags ?? [],
        aiPlatform: p.aiPlatform ?? undefined,
        isFavorite: p.isFavorite,
        isArchived: p.isArchived,
        score,
        insights: [],
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      };
    });
  }

  async createPrompt(
    workspaceId: string,
    userId: string,
    data: CreatePromptInput,
  ): Promise<DbPrompt> {
    const analysis = analysePrompt(data.rawContent);
    const breakdown = analysis.breakdown;

    let optScore: number | undefined;
    if (data.optimizedContent) {
      const optAnalysis = analysePrompt(data.optimizedContent);
      optScore = optAnalysis.overall;
    }

    const created = await this.prisma.prompt.create({
      data: {
        userId,
        workspaceId,
        title: data.title,
        rawContent: data.rawContent,
        optimizedContent: data.optimizedContent,
        category: data.category || "general",
        mode: data.mode || "general",
        tags: Array.isArray(data.tags) ? data.tags : [],
        aiPlatform: data.aiPlatform,
        score: {
          create: {
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
          },
        },
      },
      include: { score: true },
    });

    return {
      id: created.id,
      userId: created.userId,
      workspaceId: created.workspaceId ?? undefined,
      title: created.title,
      rawContent: created.rawContent,
      optimizedContent: created.optimizedContent ?? undefined,
      category: created.category ?? undefined,
      mode: created.mode,
      tags: created.tags ?? [],
      aiPlatform: created.aiPlatform ?? undefined,
      isFavorite: created.isFavorite,
      isArchived: created.isArchived,
      score: created.score
        ? {
            id: created.score.id,
            promptId: created.score.promptId,
            overall: created.score.overall,
            clarity: created.score.clarity,
            context: created.score.context,
            specificity: created.score.specificity,
            constraints: created.score.constraints,
            role: created.score.role,
            outputFormat: created.score.outputFormat,
            examples: created.score.examples,
            completeness: created.score.completeness,
            optimizedOverall: created.score.optimizedOverall ?? undefined,
            updatedAt: created.score.updatedAt.toISOString(),
          }
        : undefined,
      insights: [],
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };
  }

  async getTemplates(workspaceId: string): Promise<DbTemplate[]> {
    const templates = await this.prisma.template.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
    });

    return templates.map((t) => ({
      id: t.id,
      authorId: t.authorId ?? undefined,
      workspaceId: t.workspaceId ?? undefined,
      title: t.title,
      description: t.description,
      category: t.category,
      promptTemplate: t.promptTemplate,
      score: t.score,
      usageCount: t.usageCount,
      isSystem: t.isSystem,
      isPublic: t.isPublic,
      tags: t.tags ?? [],
      createdAt: t.createdAt.toISOString(),
    }));
  }

  async createTemplate(
    workspaceId: string,
    authorId: string,
    data: CreateTemplateInput,
  ): Promise<DbTemplate> {
    const analysis = analysePrompt(data.promptTemplate);
    const created = await this.prisma.template.create({
      data: {
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
      },
    });

    return {
      id: created.id,
      authorId: created.authorId ?? undefined,
      workspaceId: created.workspaceId ?? undefined,
      title: created.title,
      description: created.description,
      category: created.category,
      promptTemplate: created.promptTemplate,
      score: created.score,
      usageCount: created.usageCount,
      isSystem: created.isSystem,
      isPublic: created.isPublic,
      tags: created.tags ?? [],
      createdAt: created.createdAt.toISOString(),
    };
  }

  async getAnalytics(workspaceId: string): Promise<WorkspaceAnalytics> {
    const wsp = await this.findById(workspaceId);
    const prompts = await this.prisma.prompt.findMany({
      where: { workspaceId, isArchived: false },
      include: { score: true },
    });
    const templatesCount = await this.prisma.template.count({
      where: { workspaceId },
    });
    const members = await this.getMembers(workspaceId);

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
      totalTemplates: templatesCount,
      totalMembers: members.length,
      avgScore,
      complianceRate,
      minScoreThreshold: minScore,
      memberRanking,
    };
  }
}

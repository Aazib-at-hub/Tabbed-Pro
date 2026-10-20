import type { PrismaClient } from "@prisma/client";
import type { IPromptRepository } from "../../../repositories/interfaces/IPromptRepository.js";
import type {
  DbPrompt,
  DbPromptScore,
  DbPromptInsight,
  PromptQueryOptions,
  CreatePromptInput,
  UpdatePromptInput,
} from "../../../repositories/types.js";
import {
  analysePrompt,
  buildOptimizedPrompt,
  type OptimizationMode,
} from "../../../lib/tabbed-data.js";

export class PrismaPromptRepository implements IPromptRepository {
  constructor(private prisma: PrismaClient) {}

  private mapPrompt(raw: any): DbPrompt {
    let score: DbPromptScore | undefined;
    if (raw.score) {
      score = {
        id: raw.score.id,
        promptId: raw.score.promptId,
        overall: raw.score.overall,
        clarity: raw.score.clarity,
        context: raw.score.context,
        specificity: raw.score.specificity,
        constraints: raw.score.constraints,
        role: raw.score.role,
        outputFormat: raw.score.outputFormat,
        examples: raw.score.examples,
        completeness: raw.score.completeness,
        optimizedOverall: raw.score.optimizedOverall ?? undefined,
        updatedAt: raw.score.updatedAt.toISOString(),
      };
    }

    const insights: DbPromptInsight[] = (raw.insights ?? []).map((ins: any) => ({
      id: ins.id,
      promptId: ins.promptId,
      type: ins.type as any,
      message: ins.message,
      dimension: ins.dimension ?? undefined,
      impact: ins.impact ?? undefined,
    }));

    return {
      id: raw.id,
      userId: raw.userId,
      folderId: raw.folderId ?? undefined,
      workspaceId: raw.workspaceId ?? undefined,
      title: raw.title,
      rawContent: raw.rawContent,
      optimizedContent: raw.optimizedContent ?? undefined,
      category: raw.category ?? undefined,
      mode: raw.mode,
      tags: raw.tags ?? [],
      aiPlatform: raw.aiPlatform ?? undefined,
      isFavorite: raw.isFavorite,
      isArchived: raw.isArchived,
      score,
      insights,
      createdAt: raw.createdAt.toISOString(),
      updatedAt: raw.updatedAt.toISOString(),
    };
  }

  async list(userId: string, opts: PromptQueryOptions = {}): Promise<DbPrompt[]> {
    const where: any = {
      userId,
      isArchived: false,
      ...(opts.folderId ? { folderId: opts.folderId } : {}),
      ...(opts.category ? { category: opts.category } : {}),
      ...(opts.favoritesOnly ? { isFavorite: true } : {}),
    };

    if (opts.search) {
      where.OR = [
        { title: { contains: opts.search, mode: "insensitive" } },
        { rawContent: { contains: opts.search, mode: "insensitive" } },
      ];
    }

    const prompts = await this.prisma.prompt.findMany({
      where,
      include: { score: true, insights: true },
      orderBy: { updatedAt: "desc" },
    });

    return prompts.map((p) => this.mapPrompt(p));
  }

  async findById(id: string): Promise<DbPrompt | null> {
    const prompt = await this.prisma.prompt.findUnique({
      where: { id },
      include: { score: true, insights: true },
    });
    return prompt ? this.mapPrompt(prompt) : null;
  }

  async countByUserId(userId: string): Promise<number> {
    return this.prisma.prompt.count({
      where: { userId, isArchived: false },
    });
  }

  async create(userId: string, data: CreatePromptInput): Promise<DbPrompt> {
    // Plan limit check
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const tier = user?.subscriptionTier ?? "free";
    const currentCount = await this.countByUserId(userId);
    if (tier === "free" && currentCount >= 10) {
      throw new Error(
        "PLAN_LIMIT_REACHED: Free tier is limited to 10 saved prompts. Please upgrade to Pro for unlimited prompts.",
      );
    }

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
        folderId: data.folderId,
        workspaceId: data.workspaceId,
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
        insights: {
          create: analysis.missing.map((m) => ({
            type: "missing",
            message: `Missing: ${m}`,
            impact: "high",
          })),
        },
      },
      include: { score: true, insights: true },
    });

    return this.mapPrompt(created);
  }

  async update(id: string, data: UpdatePromptInput): Promise<DbPrompt | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    // Check if re-scoring is needed
    if (data.rawContent && data.rawContent !== existing.rawContent) {
      const analysis = analysePrompt(data.rawContent);
      const breakdown = analysis.breakdown;

      await this.prisma.promptScore.upsert({
        where: { promptId: id },
        update: {
          overall: analysis.overall,
          clarity: breakdown.clarity,
          context: breakdown.context,
          specificity: breakdown.specificity,
          constraints: breakdown.constraints,
          role: breakdown.role,
          outputFormat: breakdown.outputFormat,
          examples: breakdown.examples,
          completeness: breakdown.completeness,
        },
        create: {
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
        },
      });

      // Refresh insights
      await this.prisma.promptInsight.deleteMany({ where: { promptId: id } });
      await this.prisma.promptInsight.createMany({
        data: analysis.missing.map((m) => ({
          promptId: id,
          type: "missing",
          message: `Missing: ${m}`,
          impact: "high",
        })),
      });
    }

    if (data.optimizedContent) {
      const optAnalysis = analysePrompt(data.optimizedContent);
      await this.prisma.promptScore.update({
        where: { promptId: id },
        data: { optimizedOverall: optAnalysis.overall },
      });
    }

    const updated = await this.prisma.prompt.update({
      where: { id },
      data: {
        title: data.title,
        rawContent: data.rawContent,
        optimizedContent: data.optimizedContent,
        category: data.category,
        mode: data.mode,
        tags: data.tags,
        aiPlatform: data.aiPlatform,
        folderId: data.folderId,
        isFavorite: data.isFavorite,
        isArchived: data.isArchived,
      },
      include: { score: true, insights: true },
    });

    return this.mapPrompt(updated);
  }

  async toggleFavorite(id: string): Promise<DbPrompt | null> {
    const prompt = await this.findById(id);
    if (!prompt) return null;

    const updated = await this.prisma.prompt.update({
      where: { id },
      data: { isFavorite: !prompt.isFavorite },
      include: { score: true, insights: true },
    });
    return this.mapPrompt(updated);
  }

  async delete(id: string): Promise<boolean> {
    await this.prisma.prompt.delete({ where: { id } });
    return true;
  }

  async optimize(
    id: string,
    mode: string,
    profile?: { profession?: string; techStack?: string; responseStyle?: string },
  ): Promise<DbPrompt | null> {
    const prompt = await this.findById(id);
    if (!prompt) return null;

    const optProfile = {
      profession: profile?.profession ?? "Software Engineer",
      experience: "Senior",
      stack: profile?.techStack ?? "React, TypeScript",
      style: profile?.responseStyle ?? "Concise & Structured",
    };

    const optimized = buildOptimizedPrompt(prompt.rawContent, mode as OptimizationMode, optProfile);

    return this.update(id, { optimizedContent: optimized, mode });
  }
}

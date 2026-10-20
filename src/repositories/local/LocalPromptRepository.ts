import type { IPromptRepository } from "../interfaces/IPromptRepository.js";
import type {
  DbPrompt,
  DbPromptScore,
  DbPromptInsight,
  PromptQueryOptions,
  CreatePromptInput,
  UpdatePromptInput,
} from "../types.js";
import { localStore, uid, now } from "./local-store.js";
import {
  analysePrompt,
  buildOptimizedPrompt,
  type OptimizationMode,
} from "../../lib/tabbed-data.js";

export class LocalPromptRepository implements IPromptRepository {
  async list(userId: string, opts: PromptQueryOptions = {}): Promise<DbPrompt[]> {
    const store = localStore.getStore();
    let results = store.prompts.filter((p) => p.userId === userId && !p.isArchived);

    if (opts.folderId) {
      results = results.filter((p) => p.folderId === opts.folderId);
    }
    if (opts.category) {
      results = results.filter((p) => p.category === opts.category);
    }
    if (opts.favoritesOnly) {
      results = results.filter((p) => p.isFavorite);
    }
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

  async findById(id: string): Promise<DbPrompt | null> {
    const store = localStore.getStore();
    return store.prompts.find((p) => p.id === id) ?? null;
  }

  async countByUserId(userId: string): Promise<number> {
    const store = localStore.getStore();
    return store.prompts.filter((p) => p.userId === userId && !p.isArchived).length;
  }

  async create(userId: string, data: CreatePromptInput): Promise<DbPrompt> {
    const store = localStore.getStore();

    // Plan limit enforcement: Free tier max 10 prompts
    const user = store.users.find((u) => u.id === userId);
    const tier = user?.subscriptionTier ?? "free";
    const currentCount = await this.countByUserId(userId);
    if (tier === "free" && currentCount >= 10) {
      throw new Error(
        "PLAN_LIMIT_REACHED: Free tier is limited to 10 saved prompts. Please upgrade to Pro for unlimited prompts.",
      );
    }

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

    const insights: DbPromptInsight[] = analysis.missing.map((m) => ({
      id: uid("ins"),
      promptId: id,
      type: "missing" as const,
      message: `Missing: ${m}`,
      impact: "high" as const,
    }));

    const prompt: DbPrompt = {
      id,
      userId,
      folderId: data.folderId,
      workspaceId: data.workspaceId,
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
      insights,
      createdAt: ts,
      updatedAt: ts,
    };

    store.prompts.push(prompt);
    localStore.persist();
    return prompt;
  }

  async update(id: string, data: UpdatePromptInput): Promise<DbPrompt | null> {
    const store = localStore.getStore();
    const prompt = store.prompts.find((p) => p.id === id);
    if (!prompt) return null;

    Object.assign(prompt, data, { updatedAt: now() });

    // Re-score if raw content changed
    if (data.rawContent) {
      const analysis = analysePrompt(data.rawContent);
      if (prompt.score) {
        Object.assign(prompt.score, {
          overall: analysis.overall,
          ...analysis.breakdown,
          updatedAt: now(),
        });
        prompt.insights = analysis.missing.map((m) => ({
          id: uid("ins"),
          promptId: id,
          type: "missing" as const,
          message: `Missing: ${m}`,
          impact: "high" as const,
        }));
      }
    }

    // Re-score optimized content if changed
    if (data.optimizedContent && prompt.score) {
      const optAnalysis = analysePrompt(data.optimizedContent);
      prompt.score.optimizedOverall = optAnalysis.overall;
    }

    localStore.persist();
    return prompt;
  }

  async toggleFavorite(id: string): Promise<DbPrompt | null> {
    const store = localStore.getStore();
    const prompt = store.prompts.find((p) => p.id === id);
    if (!prompt) return null;
    prompt.isFavorite = !prompt.isFavorite;
    prompt.updatedAt = now();
    localStore.persist();
    return prompt;
  }

  async delete(id: string): Promise<boolean> {
    const store = localStore.getStore();
    const idx = store.prompts.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    store.prompts.splice(idx, 1);
    localStore.persist();
    return true;
  }

  async optimize(
    id: string,
    mode: string,
    profile?: { profession?: string; techStack?: string; responseStyle?: string },
  ): Promise<DbPrompt | null> {
    const store = localStore.getStore();
    const prompt = store.prompts.find((p) => p.id === id);
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

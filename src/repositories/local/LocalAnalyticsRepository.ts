import type { IAnalyticsRepository } from "../interfaces/IAnalyticsRepository.js";
import type { AnalyticsStats } from "../types.js";
import { localStore } from "./local-store.js";

export class LocalAnalyticsRepository implements IAnalyticsRepository {
  async getUserStats(userId: string): Promise<AnalyticsStats> {
    const store = localStore.getStore();
    const prompts = store.prompts.filter((p) => p.userId === userId && !p.isArchived);
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
}

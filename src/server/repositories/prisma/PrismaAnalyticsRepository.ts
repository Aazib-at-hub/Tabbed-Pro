import type { PrismaClient } from "@prisma/client";
import type { IAnalyticsRepository } from "../../../repositories/interfaces/IAnalyticsRepository.js";
import type { AnalyticsStats } from "../../../repositories/types.js";

export class PrismaAnalyticsRepository implements IAnalyticsRepository {
  constructor(private prisma: PrismaClient) {}

  async getUserStats(userId: string): Promise<AnalyticsStats> {
    const prompts = await this.prisma.prompt.findMany({
      where: { userId, isArchived: false },
      include: { score: true },
    });

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

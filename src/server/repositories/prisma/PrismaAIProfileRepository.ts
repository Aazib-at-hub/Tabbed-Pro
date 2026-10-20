import type { PrismaClient } from "@prisma/client";
import type { IAIProfileRepository } from "../../../repositories/interfaces/IAIProfileRepository.js";
import type { DbAIProfile } from "../../../repositories/types.js";

export class PrismaAIProfileRepository implements IAIProfileRepository {
  constructor(private prisma: PrismaClient) {}

  private mapProfile(raw: any): DbAIProfile {
    return {
      id: raw.id,
      userId: raw.userId,
      profession: raw.profession ?? undefined,
      experience: raw.experience ?? undefined,
      mainDomain: raw.mainDomain ?? undefined,
      platforms: raw.platforms ?? [],
      responseStyle: raw.responseStyle ?? undefined,
      techStack: raw.techStack ?? undefined,
      customRules: raw.customRules ?? undefined,
      updatedAt: raw.updatedAt.toISOString(),
    };
  }

  async findByUserId(userId: string): Promise<DbAIProfile | null> {
    const profile = await this.prisma.aIProfile.findUnique({
      where: { userId },
    });
    return profile ? this.mapProfile(profile) : null;
  }

  async upsert(
    userId: string,
    data: Partial<Omit<DbAIProfile, "id" | "userId" | "updatedAt">>,
  ): Promise<DbAIProfile> {
    const upserted = await this.prisma.aIProfile.upsert({
      where: { userId },
      update: {
        ...data,
      },
      create: {
        userId,
        ...data,
      },
    });
    return this.mapProfile(upserted);
  }
}

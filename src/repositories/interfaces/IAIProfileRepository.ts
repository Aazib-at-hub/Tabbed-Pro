import type { DbAIProfile } from "../types.js";

export interface IAIProfileRepository {
  findByUserId(userId: string): Promise<DbAIProfile | null>;
  upsert(
    userId: string,
    data: Partial<Omit<DbAIProfile, "id" | "userId" | "updatedAt">>,
  ): Promise<DbAIProfile>;
}

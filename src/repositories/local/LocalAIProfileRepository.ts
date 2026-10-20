import type { IAIProfileRepository } from "../interfaces/IAIProfileRepository.js";
import type { DbAIProfile } from "../types.js";
import { localStore, uid, now } from "./local-store.js";

export class LocalAIProfileRepository implements IAIProfileRepository {
  async findByUserId(userId: string): Promise<DbAIProfile | null> {
    const store = localStore.getStore();
    return store.profiles.find((p) => p.userId === userId) ?? null;
  }

  async upsert(
    userId: string,
    data: Partial<Omit<DbAIProfile, "id" | "userId" | "updatedAt">>,
  ): Promise<DbAIProfile> {
    const store = localStore.getStore();
    const existing = store.profiles.find((p) => p.userId === userId);
    if (existing) {
      Object.assign(existing, data, { updatedAt: now() });
      localStore.persist();
      return existing;
    }

    const profile: DbAIProfile = {
      id: uid("prf"),
      userId,
      updatedAt: now(),
      ...data,
    };
    store.profiles.push(profile);
    localStore.persist();
    return profile;
  }
}

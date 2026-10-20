import type { IUserRepository } from "../interfaces/IUserRepository.js";
import type { DbUser, SubscriptionStatus } from "../types.js";
import { localStore, uid, now } from "./local-store.js";

export class LocalUserRepository implements IUserRepository {
  async findById(id: string): Promise<DbUser | null> {
    const store = localStore.getStore();
    return store.users.find((u) => u.id === id) ?? null;
  }

  async findByEmail(email: string): Promise<DbUser | null> {
    const store = localStore.getStore();
    return store.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
  }

  async create(data: Omit<DbUser, "id" | "createdAt"> & { id?: string }): Promise<DbUser> {
    const store = localStore.getStore();
    const user: DbUser = {
      id: data.id ?? uid("usr"),
      email: data.email,
      name: data.name,
      avatarUrl: data.avatarUrl,
      emailVerified: data.emailVerified ?? false,
      isOnboarded: data.isOnboarded ?? false,
      subscriptionTier: data.subscriptionTier ?? "free",
      subscriptionStatus: data.subscriptionStatus ?? "active",
      stripeCustomerId: data.stripeCustomerId,
      stripeSubscriptionId: data.stripeSubscriptionId,
      currentPeriodEnd: data.currentPeriodEnd,
      createdAt: now(),
    };
    store.users.push(user);
    localStore.persist();
    return user;
  }

  async update(
    id: string,
    data: Partial<Omit<DbUser, "id" | "createdAt">>,
  ): Promise<DbUser | null> {
    const store = localStore.getStore();
    const user = store.users.find((u) => u.id === id);
    if (!user) return null;
    Object.assign(user, data);
    localStore.persist();
    return user;
  }

  async getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
    const store = localStore.getStore();
    let user = store.users.find((u) => u.id === userId);
    if (!user) {
      user = await this.create({
        id: userId,
        email: "user@example.com",
        name: "User",
        emailVerified: true,
        isOnboarded: true,
        subscriptionTier: "free",
        subscriptionStatus: "active",
      });
    }

    const promptCount = store.prompts.filter((p) => p.userId === userId && !p.isArchived).length;
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

  async updateSubscription(
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
  ): Promise<DbUser> {
    const store = localStore.getStore();
    let user = store.users.find((u) => u.id === userId);
    if (!user) {
      user = await this.create({
        id: userId,
        email: "user@example.com",
        name: "User",
        emailVerified: true,
        isOnboarded: true,
        subscriptionTier: "free",
        subscriptionStatus: "active",
      });
    }
    Object.assign(user, data);
    localStore.persist();
    return user;
  }
}

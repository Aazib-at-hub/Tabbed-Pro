import type { PrismaClient } from "@prisma/client";
import type { IUserRepository } from "../../../repositories/interfaces/IUserRepository.js";
import type { DbUser, SubscriptionStatus } from "../../../repositories/types.js";

export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  private mapUser(raw: any): DbUser {
    return {
      id: raw.id,
      email: raw.email,
      name: raw.name,
      avatarUrl: raw.avatarUrl ?? undefined,
      emailVerified: raw.emailVerified,
      isOnboarded: raw.isOnboarded,
      subscriptionTier: (raw.subscriptionTier as any) ?? "free",
      subscriptionStatus: (raw.subscriptionStatus as any) ?? "active",
      stripeCustomerId: raw.stripeCustomerId ?? undefined,
      stripeSubscriptionId: raw.stripeSubscriptionId ?? undefined,
      currentPeriodEnd: raw.currentPeriodEnd ? raw.currentPeriodEnd.toISOString() : undefined,
      createdAt: raw.createdAt.toISOString(),
    };
  }

  async findById(id: string): Promise<DbUser | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? this.mapUser(user) : null;
  }

  async findByEmail(email: string): Promise<DbUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    return user ? this.mapUser(user) : null;
  }

  async create(data: Omit<DbUser, "id" | "createdAt"> & { id?: string }): Promise<DbUser> {
    const created = await this.prisma.user.create({
      data: {
        ...(data.id ? { id: data.id } : {}),
        email: data.email.toLowerCase(),
        name: data.name,
        avatarUrl: data.avatarUrl,
        emailVerified: data.emailVerified ?? false,
        isOnboarded: data.isOnboarded ?? false,
        subscriptionTier: data.subscriptionTier ?? "free",
        subscriptionStatus: data.subscriptionStatus ?? "active",
        stripeCustomerId: data.stripeCustomerId,
        stripeSubscriptionId: data.stripeSubscriptionId,
        currentPeriodEnd: data.currentPeriodEnd ? new Date(data.currentPeriodEnd) : undefined,
      },
    });
    return this.mapUser(created);
  }

  async update(
    id: string,
    data: Partial<Omit<DbUser, "id" | "createdAt">>,
  ): Promise<DbUser | null> {
    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        ...data,
        currentPeriodEnd: data.currentPeriodEnd ? new Date(data.currentPeriodEnd) : undefined,
      },
    });
    return this.mapUser(updated);
  }

  async getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
    let user = await this.findById(userId);
    if (!user) {
      user = await this.create({
        id: userId,
        email: `${userId}@example.com`,
        name: "User",
        emailVerified: true,
        isOnboarded: true,
        subscriptionTier: "free",
        subscriptionStatus: "active",
      });
    }

    const promptCount = await this.prisma.prompt.count({
      where: { userId, isArchived: false },
    });

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
    const updated = await this.prisma.user.upsert({
      where: { id: userId },
      update: {
        ...data,
        currentPeriodEnd: data.currentPeriodEnd ? new Date(data.currentPeriodEnd) : undefined,
      },
      create: {
        id: userId,
        email: `${userId}@example.com`,
        name: "User",
        emailVerified: true,
        isOnboarded: true,
        subscriptionTier: data.subscriptionTier ?? "free",
        subscriptionStatus: data.subscriptionStatus ?? "active",
        stripeCustomerId: data.stripeCustomerId,
        stripeSubscriptionId: data.stripeSubscriptionId,
        currentPeriodEnd: data.currentPeriodEnd ? new Date(data.currentPeriodEnd) : undefined,
      },
    });
    return this.mapUser(updated);
  }
}

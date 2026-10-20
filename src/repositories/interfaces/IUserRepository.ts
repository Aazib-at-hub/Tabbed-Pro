import type { DbUser, SubscriptionStatus } from "../types.js";

export interface IUserRepository {
  findById(id: string): Promise<DbUser | null>;
  findByEmail(email: string): Promise<DbUser | null>;
  create(data: Omit<DbUser, "id" | "createdAt"> & { id?: string }): Promise<DbUser>;
  update(id: string, data: Partial<Omit<DbUser, "id" | "createdAt">>): Promise<DbUser | null>;
  getSubscriptionStatus(userId: string): Promise<SubscriptionStatus>;
  updateSubscription(
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
  ): Promise<DbUser>;
}

import type { AnalyticsStats } from "../types.js";

export interface IAnalyticsRepository {
  getUserStats(userId: string): Promise<AnalyticsStats>;
}

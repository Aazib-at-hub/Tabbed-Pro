/**
 * types.ts — Pure Domain Types for Tabbed Pro
 *
 * Represents the authoritative domain models shared across client and server,
 * mirroring prisma/schema.prisma and supporting both LocalStorage and PostgreSQL engines.
 */

export type SubscriptionTier = "free" | "pro" | "teams";
export type SubscriptionStatusType = "active" | "trialing" | "past_due" | "canceled";
export type WorkspaceRole = "admin" | "editor" | "viewer";
export type InviteStatus = "pending" | "accepted" | "declined";
export type InsightType = "missing" | "suggestion" | "strength";
export type InsightImpact = "high" | "medium" | "low";

export interface DbUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  emailVerified: boolean;
  isOnboarded: boolean;
  subscriptionTier: SubscriptionTier;
  subscriptionStatus: SubscriptionStatusType;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodEnd?: string;
  createdAt: string;
}

export interface DbAIProfile {
  id: string;
  userId: string;
  profession?: string;
  experience?: string;
  mainDomain?: string;
  platforms?: string[];
  responseStyle?: string;
  techStack?: string;
  customRules?: string;
  updatedAt: string;
}

export interface DbFolder {
  id: string;
  userId: string;
  name: string;
  icon: string;
  color?: string;
  createdAt: string;
}

export interface DbPromptScore {
  id: string;
  promptId: string;
  overall: number;
  clarity: number;
  context: number;
  specificity: number;
  constraints: number;
  role: number;
  outputFormat: number;
  examples: number;
  completeness: number;
  optimizedOverall?: number;
  updatedAt: string;
}

export interface DbPromptInsight {
  id: string;
  promptId: string;
  type: InsightType;
  message: string;
  dimension?: string;
  impact?: InsightImpact;
}

export interface DbPrompt {
  id: string;
  userId: string;
  workspaceId?: string;
  folderId?: string;
  title: string;
  rawContent: string;
  optimizedContent?: string;
  category?: string;
  mode: string;
  tags: string[];
  aiPlatform?: string;
  isFavorite: boolean;
  isArchived: boolean;
  score?: DbPromptScore;
  insights?: DbPromptInsight[];
  createdAt: string;
  updatedAt: string;
}

export interface DbTemplate {
  id: string;
  authorId?: string;
  workspaceId?: string;
  title: string;
  description: string;
  category: string;
  promptTemplate: string;
  score: number;
  usageCount: number;
  isSystem: boolean;
  isPublic: boolean;
  tags: string[];
  createdAt: string;
}

export interface DbAIStandards {
  enforcedContext?: string;
  forbiddenKeywords: string[];
  responseTone?: string;
  minQualityScore: number;
  defaultModel?: string;
}

export interface DbWorkspace {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  logoUrl?: string;
  plan: "teams" | "enterprise";
  aiStandards: DbAIStandards;
  createdAt: string;
}

export interface DbWorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: WorkspaceRole;
  joinedAt: string;
}

export interface DbWorkspaceInvite {
  id: string;
  workspaceId: string;
  email: string;
  role: WorkspaceRole;
  status: InviteStatus;
  token: string;
  invitedAt: string;
  expiresAt: string;
}

export interface SubscriptionStatus {
  tier: SubscriptionTier;
  status: SubscriptionStatusType;
  promptCount: number;
  maxPrompts: number;
  remainingPrompts: number;
  canCreatePrompt: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodEnd?: string;
}

export interface AnalyticsStats {
  totalPrompts: number;
  avgScore: number;
  optimizedCount: number;
  improvementPct: number;
}

export interface WorkspaceAnalytics {
  totalPrompts: number;
  totalTemplates: number;
  totalMembers: number;
  avgScore: number;
  complianceRate: number;
  minScoreThreshold: number;
  memberRanking: Array<{
    memberId: string;
    name: string;
    email: string;
    role: WorkspaceRole;
    promptCount: number;
    avgScore: number;
  }>;
}

export interface PromptQueryOptions {
  folderId?: string;
  category?: string;
  search?: string;
  favoritesOnly?: boolean;
}

export interface CreatePromptInput {
  title: string;
  rawContent: string;
  category?: string;
  mode?: string;
  tags?: string[];
  aiPlatform?: string;
  folderId?: string;
  optimizedContent?: string;
  workspaceId?: string;
}

export interface UpdatePromptInput {
  title?: string;
  rawContent?: string;
  optimizedContent?: string;
  category?: string;
  mode?: string;
  tags?: string[];
  aiPlatform?: string;
  folderId?: string;
  isFavorite?: boolean;
  isArchived?: boolean;
}

export interface CreateWorkspaceInput {
  name: string;
  slug?: string;
  plan?: "teams" | "enterprise";
}

export interface CreateTemplateInput {
  title: string;
  description: string;
  category: string;
  promptTemplate: string;
  tags?: string[];
  isPublic?: boolean;
  isSystem?: boolean;
}

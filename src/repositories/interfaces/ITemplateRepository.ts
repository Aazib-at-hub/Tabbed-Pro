import type { DbPrompt, DbTemplate, CreateTemplateInput } from "../types.js";

export interface ITemplateRepository {
  list(category?: string): Promise<DbTemplate[]>;
  findById(id: string): Promise<DbTemplate | null>;
  create(authorId: string | undefined, data: CreateTemplateInput): Promise<DbTemplate>;
  saveToVault(userId: string, templateId: string): Promise<DbPrompt | null>;
  incrementUsage(id: string): Promise<void>;
}

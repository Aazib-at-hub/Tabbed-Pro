import type {
  DbPrompt,
  PromptQueryOptions,
  CreatePromptInput,
  UpdatePromptInput,
} from "../types.js";

export interface IPromptRepository {
  list(userId: string, opts?: PromptQueryOptions): Promise<DbPrompt[]>;
  findById(id: string): Promise<DbPrompt | null>;
  create(userId: string, data: CreatePromptInput): Promise<DbPrompt>;
  update(id: string, data: UpdatePromptInput): Promise<DbPrompt | null>;
  toggleFavorite(id: string): Promise<DbPrompt | null>;
  delete(id: string): Promise<boolean>;
  optimize(
    id: string,
    mode: string,
    profile?: { profession?: string; techStack?: string; responseStyle?: string },
  ): Promise<DbPrompt | null>;
  countByUserId(userId: string): Promise<number>;
}

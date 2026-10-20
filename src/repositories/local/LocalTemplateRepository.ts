import type { ITemplateRepository } from "../interfaces/ITemplateRepository.js";
import type { DbTemplate, DbPrompt, CreateTemplateInput } from "../types.js";
import { localStore, uid, now } from "./local-store.js";
import { LocalPromptRepository } from "./LocalPromptRepository.js";
import { analysePrompt } from "../../lib/tabbed-data.js";

export class LocalTemplateRepository implements ITemplateRepository {
  private promptRepo: LocalPromptRepository;

  constructor(promptRepo?: LocalPromptRepository) {
    this.promptRepo = promptRepo ?? new LocalPromptRepository();
  }

  async list(category?: string): Promise<DbTemplate[]> {
    const store = localStore.getStore();
    if (category && category !== "All") {
      return store.templates.filter((t) => t.category === category && t.isPublic);
    }
    return store.templates.filter((t) => t.isPublic);
  }

  async findById(id: string): Promise<DbTemplate | null> {
    const store = localStore.getStore();
    return store.templates.find((t) => t.id === id) ?? null;
  }

  async create(authorId: string | undefined, data: CreateTemplateInput): Promise<DbTemplate> {
    const store = localStore.getStore();
    const analysis = analysePrompt(data.promptTemplate);
    const template: DbTemplate = {
      id: uid("tpl"),
      authorId,
      title: data.title,
      description: data.description,
      category: data.category,
      promptTemplate: data.promptTemplate,
      score: analysis.overall,
      usageCount: 0,
      isSystem: data.isSystem ?? false,
      isPublic: data.isPublic ?? true,
      tags: data.tags ?? [],
      createdAt: now(),
    };
    store.templates.push(template);
    localStore.persist();
    return template;
  }

  async incrementUsage(id: string): Promise<void> {
    const store = localStore.getStore();
    const template = store.templates.find((t) => t.id === id);
    if (template) {
      template.usageCount += 1;
      localStore.persist();
    }
  }

  async saveToVault(userId: string, templateId: string): Promise<DbPrompt | null> {
    const template = await this.findById(templateId);
    if (!template) return null;

    await this.incrementUsage(templateId);

    return this.promptRepo.create(userId, {
      title: template.title,
      rawContent: template.promptTemplate,
      category: template.category,
      mode: "general",
      tags: template.tags,
    });
  }
}

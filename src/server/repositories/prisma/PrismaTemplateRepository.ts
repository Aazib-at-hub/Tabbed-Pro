import type { PrismaClient } from "@prisma/client";
import type { ITemplateRepository } from "../../../repositories/interfaces/ITemplateRepository.js";
import type { DbTemplate, DbPrompt, CreateTemplateInput } from "../../../repositories/types.js";
import { PrismaPromptRepository } from "./PrismaPromptRepository.js";
import { analysePrompt } from "../../../lib/tabbed-data.js";

export class PrismaTemplateRepository implements ITemplateRepository {
  private promptRepo: PrismaPromptRepository;

  constructor(
    private prisma: PrismaClient,
    promptRepo?: PrismaPromptRepository,
  ) {
    this.promptRepo = promptRepo ?? new PrismaPromptRepository(prisma);
  }

  private mapTemplate(raw: any): DbTemplate {
    return {
      id: raw.id,
      authorId: raw.authorId ?? undefined,
      workspaceId: raw.workspaceId ?? undefined,
      title: raw.title,
      description: raw.description,
      category: raw.category,
      promptTemplate: raw.promptTemplate,
      score: raw.score,
      usageCount: raw.usageCount,
      isSystem: raw.isSystem,
      isPublic: raw.isPublic,
      tags: raw.tags ?? [],
      createdAt: raw.createdAt.toISOString(),
    };
  }

  async list(category?: string): Promise<DbTemplate[]> {
    const where: any = { isPublic: true };
    if (category && category !== "All") {
      where.category = category;
    }
    const templates = await this.prisma.template.findMany({
      where,
      orderBy: { usageCount: "desc" },
    });
    return templates.map((t) => this.mapTemplate(t));
  }

  async findById(id: string): Promise<DbTemplate | null> {
    const template = await this.prisma.template.findUnique({
      where: { id },
    });
    return template ? this.mapTemplate(template) : null;
  }

  async create(authorId: string | undefined, data: CreateTemplateInput): Promise<DbTemplate> {
    const analysis = analysePrompt(data.promptTemplate);
    const created = await this.prisma.template.create({
      data: {
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
      },
    });
    return this.mapTemplate(created);
  }

  async incrementUsage(id: string): Promise<void> {
    await this.prisma.template.update({
      where: { id },
      data: { usageCount: { increment: 1 } },
    });
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

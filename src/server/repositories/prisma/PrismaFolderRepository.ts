import type { PrismaClient } from "@prisma/client";
import type { IFolderRepository } from "../../../repositories/interfaces/IFolderRepository.js";
import type { DbFolder } from "../../../repositories/types.js";

export class PrismaFolderRepository implements IFolderRepository {
  constructor(private prisma: PrismaClient) {}

  private mapFolder(raw: any): DbFolder {
    return {
      id: raw.id,
      userId: raw.userId,
      name: raw.name,
      icon: raw.icon,
      color: raw.color ?? undefined,
      createdAt: raw.createdAt.toISOString(),
    };
  }

  async listByUserId(userId: string): Promise<DbFolder[]> {
    const folders = await this.prisma.folder.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return folders.map((f) => this.mapFolder(f));
  }

  async findById(id: string): Promise<DbFolder | null> {
    const folder = await this.prisma.folder.findUnique({
      where: { id },
    });
    return folder ? this.mapFolder(folder) : null;
  }

  async create(
    userId: string,
    data: { name: string; icon?: string; color?: string },
  ): Promise<DbFolder> {
    const created = await this.prisma.folder.create({
      data: {
        userId,
        name: data.name,
        icon: data.icon ?? "📁",
        color: data.color,
      },
    });
    return this.mapFolder(created);
  }

  async update(
    id: string,
    data: Partial<Pick<DbFolder, "name" | "icon" | "color">>,
  ): Promise<DbFolder | null> {
    const updated = await this.prisma.folder.update({
      where: { id },
      data,
    });
    return this.mapFolder(updated);
  }

  async delete(id: string): Promise<boolean> {
    // Unassign prompts in folder
    await this.prisma.prompt.updateMany({
      where: { folderId: id },
      data: { folderId: null },
    });

    await this.prisma.folder.delete({
      where: { id },
    });
    return true;
  }
}

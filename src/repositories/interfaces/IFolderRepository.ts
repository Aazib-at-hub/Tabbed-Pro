import type { DbFolder } from "../types.js";

export interface IFolderRepository {
  listByUserId(userId: string): Promise<DbFolder[]>;
  findById(id: string): Promise<DbFolder | null>;
  create(userId: string, data: { name: string; icon?: string; color?: string }): Promise<DbFolder>;
  update(
    id: string,
    data: Partial<Pick<DbFolder, "name" | "icon" | "color">>,
  ): Promise<DbFolder | null>;
  delete(id: string): Promise<boolean>;
}

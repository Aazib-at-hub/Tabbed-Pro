import type { IFolderRepository } from "../interfaces/IFolderRepository.js";
import type { DbFolder } from "../types.js";
import { localStore, uid, now } from "./local-store.js";

export class LocalFolderRepository implements IFolderRepository {
  async listByUserId(userId: string): Promise<DbFolder[]> {
    const store = localStore.getStore();
    return store.folders.filter((f) => f.userId === userId);
  }

  async findById(id: string): Promise<DbFolder | null> {
    const store = localStore.getStore();
    return store.folders.find((f) => f.id === id) ?? null;
  }

  async create(
    userId: string,
    data: { name: string; icon?: string; color?: string },
  ): Promise<DbFolder> {
    const store = localStore.getStore();
    const folder: DbFolder = {
      id: uid("fld"),
      userId,
      name: data.name,
      icon: data.icon ?? "📁",
      color: data.color,
      createdAt: now(),
    };
    store.folders.push(folder);
    localStore.persist();
    return folder;
  }

  async update(
    id: string,
    data: Partial<Pick<DbFolder, "name" | "icon" | "color">>,
  ): Promise<DbFolder | null> {
    const store = localStore.getStore();
    const folder = store.folders.find((f) => f.id === id);
    if (!folder) return null;
    Object.assign(folder, data);
    localStore.persist();
    return folder;
  }

  async delete(id: string): Promise<boolean> {
    const store = localStore.getStore();
    const idx = store.folders.findIndex((f) => f.id === id);
    if (idx === -1) return false;

    // Unassign prompts in this folder
    store.prompts
      .filter((p) => p.folderId === id)
      .forEach((p) => {
        p.folderId = undefined;
      });

    store.folders.splice(idx, 1);
    localStore.persist();
    return true;
  }
}

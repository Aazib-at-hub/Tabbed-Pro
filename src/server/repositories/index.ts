import type { PrismaClient } from "@prisma/client";
import type { IRepositoryContainer } from "../../repositories/interfaces/IRepositoryContainer.js";
import { localRepositories } from "../../repositories/local/index.js";
import { prisma } from "../prisma.js";
import { PrismaUserRepository } from "./prisma/PrismaUserRepository.js";
import { PrismaAIProfileRepository } from "./prisma/PrismaAIProfileRepository.js";
import { PrismaFolderRepository } from "./prisma/PrismaFolderRepository.js";
import { PrismaPromptRepository } from "./prisma/PrismaPromptRepository.js";
import { PrismaTemplateRepository } from "./prisma/PrismaTemplateRepository.js";
import { PrismaWorkspaceRepository } from "./prisma/PrismaWorkspaceRepository.js";
import { PrismaAnalyticsRepository } from "./prisma/PrismaAnalyticsRepository.js";

export * from "./prisma/PrismaUserRepository.js";
export * from "./prisma/PrismaAIProfileRepository.js";
export * from "./prisma/PrismaFolderRepository.js";
export * from "./prisma/PrismaPromptRepository.js";
export * from "./prisma/PrismaTemplateRepository.js";
export * from "./prisma/PrismaWorkspaceRepository.js";
export * from "./prisma/PrismaAnalyticsRepository.js";

export function createPrismaRepositories(client: PrismaClient = prisma): IRepositoryContainer {
  const users = new PrismaUserRepository(client);
  const profiles = new PrismaAIProfileRepository(client);
  const folders = new PrismaFolderRepository(client);
  const prompts = new PrismaPromptRepository(client);
  const templates = new PrismaTemplateRepository(client, prompts);
  const workspaces = new PrismaWorkspaceRepository(client);
  const analytics = new PrismaAnalyticsRepository(client);

  return {
    users,
    profiles,
    folders,
    prompts,
    templates,
    workspaces,
    analytics,
  };
}

/**
 * Resilient server repository container:
 * Uses Prisma when DATABASE_URL is set, falls back to local in-memory store in dev/offline mode.
 */
export const serverRepositories: IRepositoryContainer = (() => {
  if (process.env.DATABASE_URL) {
    try {
      return createPrismaRepositories(prisma);
    } catch (e) {
      console.warn(
        "[Repositories] Could not initialize Prisma repository, falling back to local:",
        e,
      );
      return localRepositories;
    }
  }
  return localRepositories;
})();

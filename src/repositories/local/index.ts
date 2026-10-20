import type { IRepositoryContainer } from "../interfaces/IRepositoryContainer.js";
import { localStore } from "./local-store.js";
import { LocalUserRepository } from "./LocalUserRepository.js";
import { LocalAIProfileRepository } from "./LocalAIProfileRepository.js";
import { LocalFolderRepository } from "./LocalFolderRepository.js";
import { LocalPromptRepository } from "./LocalPromptRepository.js";
import { LocalTemplateRepository } from "./LocalTemplateRepository.js";
import { LocalWorkspaceRepository } from "./LocalWorkspaceRepository.js";
import { LocalAnalyticsRepository } from "./LocalAnalyticsRepository.js";

export * from "./local-store.js";
export * from "./LocalUserRepository.js";
export * from "./LocalAIProfileRepository.js";
export * from "./LocalFolderRepository.js";
export * from "./LocalPromptRepository.js";
export * from "./LocalTemplateRepository.js";
export * from "./LocalWorkspaceRepository.js";
export * from "./LocalAnalyticsRepository.js";

export function createLocalRepositories(): IRepositoryContainer {
  const users = new LocalUserRepository();
  const profiles = new LocalAIProfileRepository();
  const folders = new LocalFolderRepository();
  const prompts = new LocalPromptRepository();
  const templates = new LocalTemplateRepository(prompts);
  const workspaces = new LocalWorkspaceRepository();
  const analytics = new LocalAnalyticsRepository();

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

export const localRepositories = createLocalRepositories();

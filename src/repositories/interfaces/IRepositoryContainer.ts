import type { IUserRepository } from "./IUserRepository.js";
import type { IAIProfileRepository } from "./IAIProfileRepository.js";
import type { IFolderRepository } from "./IFolderRepository.js";
import type { IPromptRepository } from "./IPromptRepository.js";
import type { ITemplateRepository } from "./ITemplateRepository.js";
import type { IWorkspaceRepository } from "./IWorkspaceRepository.js";
import type { IAnalyticsRepository } from "./IAnalyticsRepository.js";

export interface IRepositoryContainer {
  users: IUserRepository;
  profiles: IAIProfileRepository;
  folders: IFolderRepository;
  prompts: IPromptRepository;
  templates: ITemplateRepository;
  workspaces: IWorkspaceRepository;
  analytics: IAnalyticsRepository;
}

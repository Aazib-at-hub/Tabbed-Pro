import type {
  DbWorkspace,
  DbWorkspaceMember,
  DbWorkspaceInvite,
  DbAIStandards,
  DbPrompt,
  DbTemplate,
  WorkspaceAnalytics,
  CreateWorkspaceInput,
  CreatePromptInput,
  CreateTemplateInput,
  WorkspaceRole,
} from "../types.js";

export interface IWorkspaceRepository {
  listByUserId(userId: string): Promise<DbWorkspace[]>;
  findById(id: string): Promise<DbWorkspace | null>;
  create(userId: string, data: CreateWorkspaceInput): Promise<DbWorkspace>;
  update(id: string, data: Partial<DbWorkspace>): Promise<DbWorkspace | null>;

  // Members
  getMembers(workspaceId: string): Promise<DbWorkspaceMember[]>;
  addMember(workspaceId: string, userId: string, role?: WorkspaceRole): Promise<DbWorkspaceMember>;
  updateMemberRole(workspaceId: string, memberId: string, role: WorkspaceRole): Promise<boolean>;
  removeMember(workspaceId: string, memberId: string): Promise<boolean>;

  // Invites
  inviteMember(workspaceId: string, email: string, role: WorkspaceRole): Promise<DbWorkspaceInvite>;
  getInvites(workspaceId: string): Promise<DbWorkspaceInvite[]>;

  // Standards
  updateStandards(
    workspaceId: string,
    standards: Partial<DbAIStandards>,
  ): Promise<DbAIStandards | null>;

  // Team Prompts & Templates
  getPrompts(
    workspaceId: string,
    opts?: { category?: string; search?: string },
  ): Promise<DbPrompt[]>;
  createPrompt(workspaceId: string, userId: string, data: CreatePromptInput): Promise<DbPrompt>;
  getTemplates(workspaceId: string): Promise<DbTemplate[]>;
  createTemplate(
    workspaceId: string,
    authorId: string,
    data: CreateTemplateInput,
  ): Promise<DbTemplate>;

  // Analytics
  getAnalytics(workspaceId: string): Promise<WorkspaceAnalytics>;
}

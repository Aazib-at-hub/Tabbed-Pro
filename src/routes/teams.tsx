import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  Building2,
  Shield,
  Plus,
  Mail,
  Copy,
  Check,
  Sparkles,
  BarChart3,
  BookMarked,
  Library,
  Trash2,
  Search,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  ChevronDown,
  Layers,
  Award,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth-context";
import {
  workspacesApi,
  type Workspace,
  type WorkspaceMember,
  type WorkspaceInvite,
  type Prompt,
  type Template,
  type AIStandards,
} from "@/lib/api-client";
import { scoreTone } from "@/lib/tabbed-data";
import { cn } from "@/lib/utils";

interface WorkspaceAnalytics {
  totalPrompts: number;
  totalTemplates: number;
  totalMembers: number;
  avgScore: number;
  complianceRate: number;
  minScoreThreshold: number;
  memberRanking: Array<{
    memberId: string;
    name: string;
    email: string;
    role: string;
    promptCount: number;
    avgScore: number;
  }>;
}

export default function Teams() {
  const { user } = useAuth();
  const userId = user?.id ?? "usr_demo_123";
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Team Workspace & Standards — Tabbed";
  }, []);

  // ─── Workspace state ───────────────────────────────────────────────────────
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [invites, setInvites] = useState<WorkspaceInvite[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [analytics, setAnalytics] = useState<WorkspaceAnalytics | null>(null);
  const [standards, setStandards] = useState<AIStandards | null>(null);

  // ─── Filter & Form states ──────────────────────────────────────────────────
  const [promptSearch, setPromptSearch] = useState("");
  const [newKeyword, setNewKeyword] = useState("");
  const [standardsSaving, setStandardsSaving] = useState(false);

  // Invite modal
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "editor" | "viewer">("editor");

  // Create team prompt modal
  const [newPromptOpen, setNewPromptOpen] = useState(false);
  const [newPromptTitle, setNewPromptTitle] = useState("");
  const [newPromptContent, setNewPromptContent] = useState("");
  const [newPromptCategory, setNewPromptCategory] = useState("Engineering");

  // Create team template modal
  const [newTemplateOpen, setNewTemplateOpen] = useState(false);
  const [newTemplateTitle, setNewTemplateTitle] = useState("");
  const [newTemplateDesc, setNewTemplateDesc] = useState("");
  const [newTemplateBody, setNewTemplateBody] = useState("");
  const [newTemplateCategory, setNewTemplateCategory] = useState("Engineering");

  // Create workspace modal
  const [newOrgOpen, setNewOrgOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");

  // Load active workspace data
  const loadWorkspaceData = async (wspId: string) => {
    try {
      const [wsp, mbrs, invs, pms, tpls, anl] = await Promise.all([
        workspacesApi.get(wspId),
        workspacesApi.getMembers(wspId),
        workspacesApi.getInvites(wspId),
        workspacesApi.getPrompts(wspId),
        workspacesApi.getTemplates(wspId),
        workspacesApi.getAnalytics(wspId),
      ]);
      setCurrentWorkspace(wsp);
      setMembers(mbrs);
      setInvites(invs);
      setPrompts(pms);
      setTemplates(tpls);
      setAnalytics(anl);
      if (wsp?.aiStandards) {
        setStandards(wsp.aiStandards);
      }
    } catch {
      toast.error("Failed to load workspace data");
    }
  };

  useEffect(() => {
    void workspacesApi.list(userId).then((wsps) => {
      setWorkspaces(wsps);
      if (wsps.length > 0) {
        void loadWorkspaceData(wsps[0].id);
      }
    });
  }, [userId]);

  // Current user's member role in the active workspace
  const currentUserRole = useMemo(() => {
    if (!currentWorkspace) return "viewer";
    const m = members.find((mem) => mem.userId === userId);
    return m?.role ?? (currentWorkspace.ownerId === userId ? "admin" : "viewer");
  }, [members, currentWorkspace, userId]);

  const canEdit = currentUserRole === "admin" || currentUserRole === "editor";
  const isAdmin = currentUserRole === "admin";

  // ─── Actions ───────────────────────────────────────────────────────────────
  const handleInvite = async () => {
    if (!inviteEmail.trim() || !currentWorkspace) return;
    try {
      await workspacesApi.inviteMember(currentWorkspace.id, inviteEmail.trim(), inviteRole);
      toast.success(`Invitation sent to ${inviteEmail}`, {
        description: `Role assigned: ${inviteRole.toUpperCase()}`,
      });
      setInviteOpen(false);
      setInviteEmail("");
      void loadWorkspaceData(currentWorkspace.id);
    } catch {
      toast.error("Failed to send invitation");
    }
  };

  const handleRoleChange = async (memberId: string, newRole: "admin" | "editor" | "viewer") => {
    if (!currentWorkspace) return;
    await workspacesApi.updateRole(currentWorkspace.id, memberId, newRole);
    toast.success("Member role updated");
    void loadWorkspaceData(currentWorkspace.id);
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!currentWorkspace) return;
    await workspacesApi.removeMember(currentWorkspace.id, memberId);
    toast.success("Member removed from workspace");
    void loadWorkspaceData(currentWorkspace.id);
  };

  const handleSaveStandards = async () => {
    if (!currentWorkspace || !standards) return;
    setStandardsSaving(true);
    try {
      await workspacesApi.updateStandards(currentWorkspace.id, standards);
      toast.success("Organization AI Standards saved", {
        description: "Standards will be injected into all team optimizations.",
      });
      void loadWorkspaceData(currentWorkspace.id);
    } catch {
      toast.error("Failed to update AI standards");
    } finally {
      setStandardsSaving(false);
    }
  };

  const handleAddKeyword = () => {
    if (!newKeyword.trim() || !standards) return;
    const clean = newKeyword.trim().toLowerCase();
    if (standards.forbiddenKeywords.includes(clean)) return;
    setStandards({
      ...standards,
      forbiddenKeywords: [...standards.forbiddenKeywords, clean],
    });
    setNewKeyword("");
  };

  const handleRemoveKeyword = (kw: string) => {
    if (!standards) return;
    setStandards({
      ...standards,
      forbiddenKeywords: standards.forbiddenKeywords.filter((k) => k !== kw),
    });
  };

  const handleCreatePrompt = async () => {
    if (!newPromptTitle.trim() || !newPromptContent.trim() || !currentWorkspace) return;
    try {
      await workspacesApi.createPrompt(currentWorkspace.id, userId, {
        title: newPromptTitle.trim(),
        rawContent: newPromptContent.trim(),
        category: newPromptCategory,
        mode: "general",
      });
      toast.success("Shared Team Prompt created!");
      setNewPromptOpen(false);
      setNewPromptTitle("");
      setNewPromptContent("");
      void loadWorkspaceData(currentWorkspace.id);
    } catch {
      toast.error("Failed to save team prompt");
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplateTitle.trim() || !newTemplateBody.trim() || !currentWorkspace) return;
    try {
      await workspacesApi.createTemplate(currentWorkspace.id, userId, {
        title: newTemplateTitle.trim(),
        description: newTemplateDesc.trim(),
        category: newTemplateCategory,
        promptTemplate: newTemplateBody.trim(),
      });
      toast.success("Shared Team Template created!");
      setNewTemplateOpen(false);
      setNewTemplateTitle("");
      setNewTemplateDesc("");
      setNewTemplateBody("");
      void loadWorkspaceData(currentWorkspace.id);
    } catch {
      toast.error("Failed to create team template");
    }
  };

  const handleCreateOrg = async () => {
    if (!newOrgName.trim()) return;
    try {
      const created = await workspacesApi.create(userId, { name: newOrgName.trim() });
      toast.success(`Created workspace "${created.name}"`);
      setNewOrgOpen(false);
      setNewOrgName("");
      const list = await workspacesApi.list(userId);
      setWorkspaces(list);
      void loadWorkspaceData(created.id);
    } catch {
      toast.error("Failed to create workspace");
    }
  };

  const filteredPrompts = useMemo(() => {
    if (!promptSearch.trim()) return prompts;
    const q = promptSearch.toLowerCase();
    return prompts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.rawContent.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [prompts, promptSearch]);

  return (
    <AppShell
      title="Team Workspace"
      description="Shared prompt vault, team templates, and org-wide AI standards"
      actions={
        <div className="flex items-center gap-2">
          {canEdit && (
            <Button
              size="sm"
              onClick={() => setNewPromptOpen(true)}
              className="gap-1.5 hidden sm:inline-flex"
            >
              <Plus className="size-4" /> New Team Prompt
            </Button>
          )}
          {isAdmin && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setInviteOpen(true)}
              className="gap-1.5"
            >
              <Mail className="size-4" /> Invite Member
            </Button>
          )}
        </div>
      }
    >
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Workspace Organization Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-5 elevate">
          <div className="flex items-center gap-3.5">
            <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary font-display font-bold text-lg">
              <Building2 className="size-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl font-bold">
                  {currentWorkspace?.name ?? "Acme AI Labs"}
                </h2>
                <Badge variant="default" className="text-[0.65rem] uppercase font-semibold">
                  {currentWorkspace?.plan ?? "Teams"} Plan
                </Badge>
                <Badge variant="secondary" className="text-[0.65rem]">
                  My Role: <strong className="capitalize ml-1">{currentUserRole}</strong>
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                slug: <code>{currentWorkspace?.slug ?? "acme-ai-labs"}</code> · {members.length}{" "}
                members · {prompts.length} shared prompts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={currentWorkspace?.id}
              onValueChange={(val) => {
                void loadWorkspaceData(val);
              }}
            >
              <SelectTrigger className="w-44 text-xs h-9">
                <SelectValue placeholder="Switch workspace" />
              </SelectTrigger>
              <SelectContent>
                {workspaces.map((w) => (
                  <SelectItem key={w.id} value={w.id} className="text-xs">
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setNewOrgOpen(true)}
              className="gap-1 text-xs h-9"
            >
              <Plus className="size-3.5" /> New Team
            </Button>
          </div>
        </div>

        {/* Workspace Navigation Tabs */}
        <Tabs defaultValue="vault" className="space-y-6">
          <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full max-w-3xl">
            <TabsTrigger value="vault" className="gap-1.5 text-xs">
              <BookMarked className="size-3.5" /> Team Vault
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-1.5 text-xs">
              <Library className="size-3.5" /> Templates
            </TabsTrigger>
            <TabsTrigger value="standards" className="gap-1.5 text-xs">
              <Shield className="size-3.5" /> AI Standards
            </TabsTrigger>
            <TabsTrigger value="members" className="gap-1.5 text-xs">
              <Users className="size-3.5" /> Members ({members.length})
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-1.5 text-xs">
              <BarChart3 className="size-3.5" /> Analytics
            </TabsTrigger>
          </TabsList>

          {/* ─── TAB 1: Team Vault ────────────────────────────────────────────────── */}
          <TabsContent value="vault" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search team prompts by title or keyword..."
                  value={promptSearch}
                  onChange={(e) => setPromptSearch(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>

              {canEdit && (
                <Button size="sm" onClick={() => setNewPromptOpen(true)} className="gap-1.5">
                  <Plus className="size-3.5" /> Share Prompt
                </Button>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {filteredPrompts.map((p) => {
                const isCompliant = (p.score?.overall ?? 0) >= (standards?.minQualityScore ?? 75);
                return (
                  <Card
                    key={p.id}
                    className="elevate hover:border-primary/50 transition-all flex flex-col justify-between"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-base font-semibold">{p.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-[0.65rem]">
                              {p.category ?? "General"}
                            </Badge>
                            <Badge variant="secondary" className="text-[0.65rem]">
                              {p.aiPlatform ?? "ChatGPT"}
                            </Badge>
                            {isCompliant ? (
                              <Badge className="bg-success/15 text-success hover:bg-success/15 text-[0.65rem] gap-1">
                                <ShieldCheck className="size-3" /> Standards Approved
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="text-[0.65rem] gap-1">
                                <AlertCircle className="size-3" /> Needs Review
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <span
                            className={cn(
                              "text-lg font-bold font-mono",
                              scoreTone(p.score?.overall ?? 0),
                            )}
                          >
                            {p.score?.overall ?? 0}
                          </span>
                          <span className="text-[0.65rem] text-muted-foreground block">/100</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-0">
                      <div className="rounded-lg bg-muted/40 p-3 text-xs font-mono text-muted-foreground line-clamp-3">
                        {p.rawContent}
                      </div>

                      {p.optimizedContent && (
                        <div className="rounded-lg bg-primary/5 border border-primary/15 p-2.5 text-xs text-foreground/90 line-clamp-2">
                          <span className="text-[0.65rem] font-bold text-primary uppercase block mb-0.5">
                            Optimized:
                          </span>
                          {p.optimizedContent}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[0.65rem] text-muted-foreground">
                          Shared by team member · {new Date(p.createdAt).toLocaleDateString()}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs gap-1"
                            onClick={() => {
                              void navigator.clipboard.writeText(
                                p.optimizedContent || p.rawContent,
                              );
                              toast.success("Prompt copied to clipboard!");
                            }}
                          >
                            <Copy className="size-3" /> Copy
                          </Button>
                          <Button variant="outline" size="sm" className="h-7 text-xs gap-1" asChild>
                            <Link to={`/optimize?q=${encodeURIComponent(p.rawContent)}`}>
                              <Sparkles className="size-3" /> Optimize
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {filteredPrompts.length === 0 && (
                <div className="col-span-2 text-center py-12 rounded-xl border border-dashed border-border bg-card">
                  <BookMarked className="size-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm font-semibold">No team prompts found</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Share your first enterprise prompt with {currentWorkspace?.name}.
                  </p>
                  {canEdit && (
                    <Button
                      size="sm"
                      onClick={() => setNewPromptOpen(true)}
                      className="mt-4 gap-1.5"
                    >
                      <Plus className="size-3.5" /> Share Prompt
                    </Button>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ─── TAB 2: Shared Templates ────────────────────────────────────────── */}
          <TabsContent value="templates" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold">Organization Prompt Templates</h3>
                <p className="text-xs text-muted-foreground">
                  Standardized, audited templates approved for enterprise teams.
                </p>
              </div>
              {canEdit && (
                <Button size="sm" onClick={() => setNewTemplateOpen(true)} className="gap-1.5">
                  <Plus className="size-3.5" /> Add Team Template
                </Button>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {templates.map((tpl) => (
                <Card key={tpl.id} className="elevate flex flex-col justify-between">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base font-semibold">{tpl.title}</CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {tpl.description}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="font-mono text-xs">
                        ★ {tpl.score}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    <pre className="rounded-lg bg-muted/40 p-3 text-xs font-mono text-muted-foreground whitespace-pre-wrap max-h-36 overflow-y-auto">
                      {tpl.promptTemplate}
                    </pre>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex gap-1.5 flex-wrap">
                        {tpl.tags.map((t) => (
                          <span
                            key={t}
                            className="text-[0.65rem] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs gap-1.5"
                        onClick={() => {
                          void navigator.clipboard.writeText(tpl.promptTemplate);
                          toast.success("Template copied to clipboard!");
                        }}
                      >
                        <Copy className="size-3" /> Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ─── TAB 3: AI Standards & Guardrails ─────────────────────────────────── */}
          <TabsContent value="standards" className="space-y-6">
            <Card className="elevate">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <Shield className="size-5 text-primary" />
                      Organization-Wide AI Standards
                    </CardTitle>
                    <CardDescription>
                      These rules and guardrails are injected into all prompt evaluations and
                      optimization streams for {currentWorkspace?.name}.
                    </CardDescription>
                  </div>
                  {!isAdmin && (
                    <Badge variant="secondary" className="text-xs">
                      View-Only (Admin Access Required)
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Enforced System Context */}
                <div className="space-y-2">
                  <Label htmlFor="enforcedContext" className="text-sm font-semibold">
                    Enforced Corporate Context
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Injected automatically into prompt optimization context to ensure accurate
                    domain terminology and guidelines.
                  </p>
                  <Textarea
                    id="enforcedContext"
                    rows={4}
                    disabled={!isAdmin}
                    value={standards?.enforcedContext ?? ""}
                    onChange={(e) =>
                      setStandards((prev) =>
                        prev ? { ...prev, enforcedContext: e.target.value } : null,
                      )
                    }
                    placeholder="Describe your company, architecture guidelines, coding rules, compliance policies..."
                  />
                </div>

                {/* Forbidden Keywords / Data Leak Prevention */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
                    Forbidden Keywords & Leak Prevention
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Prompts containing these terms will be flagged during quality scoring and
                    rejected before cloud sync.
                  </p>

                  <div className="flex flex-wrap gap-2 mb-2">
                    {standards?.forbiddenKeywords.map((kw) => (
                      <span
                        key={kw}
                        className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20 px-2.5 py-0.5 text-xs font-mono"
                      >
                        {kw}
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => handleRemoveKeyword(kw)}
                            className="hover:text-destructive/80"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))}
                  </div>

                  {isAdmin && (
                    <div className="flex gap-2 max-w-sm">
                      <Input
                        placeholder="e.g. secret_token, ssn, internal_db"
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddKeyword();
                          }
                        }}
                        className="text-xs h-8"
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={handleAddKeyword}
                        className="text-xs h-8"
                      >
                        Add
                      </Button>
                    </div>
                  )}
                </div>

                {/* Tone & Quality Score Threshold */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Mandatory Response Tone</Label>
                    <Select
                      disabled={!isAdmin}
                      value={standards?.responseTone ?? "Technical & Rigorous"}
                      onValueChange={(val) =>
                        setStandards((prev) => (prev ? { ...prev, responseTone: val } : null))
                      }
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Technical & Rigorous">Technical & Rigorous</SelectItem>
                        <SelectItem value="Executive & High-Level">
                          Executive & High-Level
                        </SelectItem>
                        <SelectItem value="Concise & Bulleted">Concise & Bulleted</SelectItem>
                        <SelectItem value="Security & Compliance First">
                          Security & Compliance First
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">
                      Minimum Quality Score Gate: {standards?.minQualityScore ?? 75}/100
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Prompts scoring below this threshold are flagged in the shared team
                      repository.
                    </p>
                    <input
                      type="range"
                      min={50}
                      max={90}
                      step={5}
                      disabled={!isAdmin}
                      value={standards?.minQualityScore ?? 75}
                      onChange={(e) =>
                        setStandards((prev) =>
                          prev ? { ...prev, minQualityScore: Number(e.target.value) } : null,
                        )
                      }
                      className="w-full accent-primary cursor-pointer"
                    />
                  </div>
                </div>

                {isAdmin && (
                  <div className="pt-2">
                    <Button
                      onClick={handleSaveStandards}
                      disabled={standardsSaving}
                      className="gap-2"
                    >
                      <ShieldCheck className="size-4" /> Save Standards
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── TAB 4: Team Members & RBAC ───────────────────────────────────────── */}
          <TabsContent value="members" className="space-y-6">
            <Card className="elevate">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">Workspace Members</CardTitle>
                  <CardDescription>
                    Manage team seats and assign permissions (Admin, Editor, Viewer).
                  </CardDescription>
                </div>
                {isAdmin && (
                  <Button size="sm" onClick={() => setInviteOpen(true)} className="gap-1.5">
                    <Mail className="size-3.5" /> Invite Member
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="divide-y divide-border/60">
                  {members.map((m) => {
                    const isSelf = m.userId === userId;
                    return (
                      <div
                        key={m.id}
                        className="flex flex-wrap items-center justify-between gap-3 py-3.5"
                      >
                        <div className="flex items-center gap-3">
                          <span className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                            {m.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .substring(0, 2)}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-sm">{m.name}</p>
                              {isSelf && (
                                <Badge variant="secondary" className="text-[0.65rem]">
                                  You
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{m.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {isAdmin && !isSelf ? (
                            <Select
                              value={m.role}
                              onValueChange={(val: "admin" | "editor" | "viewer") =>
                                handleRoleChange(m.id, val)
                              }
                            >
                              <SelectTrigger className="w-28 text-xs h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="editor">Editor</SelectItem>
                                <SelectItem value="viewer">Viewer</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge variant="outline" className="text-xs capitalize">
                              {m.role}
                            </Badge>
                          )}

                          {isAdmin && !isSelf && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-destructive hover:bg-destructive/10"
                              onClick={() => handleRemoveMember(m.id)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pending Invites */}
                {invites.length > 0 && (
                  <div className="pt-4 border-t border-border">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Pending Invitations
                    </h4>
                    <div className="divide-y divide-border/40">
                      {invites.map((inv) => (
                        <div
                          key={inv.id}
                          className="flex items-center justify-between py-2 text-xs"
                        >
                          <div>
                            <span className="font-medium">{inv.email}</span>
                            <span className="text-muted-foreground ml-2">({inv.role})</span>
                          </div>
                          <Badge
                            variant="outline"
                            className="text-[0.65rem] text-warning border-warning/40"
                          >
                            Pending Invite
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── TAB 5: Team Analytics ────────────────────────────────────────────── */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="elevate">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs font-medium">
                    Team Average Score
                  </CardDescription>
                  <CardTitle className="text-2xl font-bold font-mono text-primary">
                    {analytics?.avgScore ?? 91}/100
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  Across all shared team prompt evaluations
                </CardContent>
              </Card>

              <Card className="elevate">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs font-medium">
                    Standards Compliance
                  </CardDescription>
                  <CardTitle className="text-2xl font-bold font-mono text-success">
                    {analytics?.complianceRate ?? 93}%
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  Passed min quality score & forbidden term checks
                </CardContent>
              </Card>

              <Card className="elevate">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs font-medium">Shared Prompts</CardDescription>
                  <CardTitle className="text-2xl font-bold font-mono">
                    {analytics?.totalPrompts ?? 12}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  Created and indexed in the team vault
                </CardContent>
              </Card>

              <Card className="elevate">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs font-medium">
                    Active Contributors
                  </CardDescription>
                  <CardTitle className="text-2xl font-bold font-mono">{members.length}</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  Engineers & PMs using workspace guardrails
                </CardContent>
              </Card>
            </div>

            {/* Member Leaderboard */}
            <Card className="elevate">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Award className="size-4 text-warning" /> Team Adoption Leaderboard
                </CardTitle>
                <CardDescription>
                  Contributors ranking by prompts shared and prompt score quality.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="divide-y divide-border/60">
                  {(analytics?.memberRanking ?? []).map((m, idx) => (
                    <div
                      key={m.memberId}
                      className="flex items-center justify-between py-3 text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-muted-foreground w-4">
                          #{idx + 1}
                        </span>
                        <div>
                          <p className="font-medium">{m.name}</p>
                          <p className="text-xs text-muted-foreground">{m.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-xs font-mono">
                        <div>
                          <span className="text-muted-foreground">Prompts: </span>
                          <strong className="text-foreground">{m.promptCount}</strong>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Avg Score: </span>
                          <strong className={scoreTone(m.avgScore)}>{m.avgScore}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* ─── MODAL: Invite Member ───────────────────────────────────────────── */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Teammate</DialogTitle>
            <DialogDescription>
              Add a colleague to {currentWorkspace?.name} with specific access rights.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label htmlFor="email">Work Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@acme.corp"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role Permission</Label>
              <Select
                value={inviteRole}
                onValueChange={(val: "admin" | "editor" | "viewer") => setInviteRole(val)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="editor">
                    Editor (Can create, edit & use team prompts)
                  </SelectItem>
                  <SelectItem value="viewer">Viewer (Can search & use prompts only)</SelectItem>
                  <SelectItem value="admin">
                    Admin (Full access to standards, members & billing)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite} className="gap-1.5">
              <Mail className="size-3.5" /> Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── MODAL: New Team Prompt ─────────────────────────────────────────── */}
      <Dialog open={newPromptOpen} onOpenChange={setNewPromptOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Share Prompt with Team</DialogTitle>
            <DialogDescription>
              Prompt will be indexed in {currentWorkspace?.name} and evaluated against organization
              guardrails.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label htmlFor="pTitle">Prompt Title</Label>
              <Input
                id="pTitle"
                placeholder="e.g. Terraform AWS ECS Cluster Module"
                value={newPromptTitle}
                onChange={(e) => setNewPromptTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pCat">Category</Label>
              <Input
                id="pCat"
                placeholder="Engineering, Security, Marketing..."
                value={newPromptCategory}
                onChange={(e) => setNewPromptCategory(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pContent">Prompt Text</Label>
              <Textarea
                id="pContent"
                rows={5}
                placeholder="Type or paste the instruction..."
                value={newPromptContent}
                onChange={(e) => setNewPromptContent(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewPromptOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePrompt}>Share in Vault</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── MODAL: New Team Template ───────────────────────────────────────── */}
      <Dialog open={newTemplateOpen} onOpenChange={setNewTemplateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Team Template</DialogTitle>
            <DialogDescription>
              Add a reusable template with variables like {"{{feature_name}}"} for team adoption.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label htmlFor="tTitle">Template Title</Label>
              <Input
                id="tTitle"
                placeholder="e.g. Security Vulnerability Triage"
                value={newTemplateTitle}
                onChange={(e) => setNewTemplateTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tDesc">Description</Label>
              <Input
                id="tDesc"
                placeholder="Brief purpose of the template..."
                value={newTemplateDesc}
                onChange={(e) => setNewTemplateDesc(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tBody">Template Pattern</Label>
              <Textarea
                id="tBody"
                rows={5}
                placeholder="Write template with {{variables}}..."
                value={newTemplateBody}
                onChange={(e) => setNewTemplateBody(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewTemplateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTemplate}>Save Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── MODAL: New Organization / Workspace ────────────────────────────── */}
      <Dialog open={newOrgOpen} onOpenChange={setNewOrgOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Organization</DialogTitle>
            <DialogDescription>
              Start a new workspace for another team or client engagement.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label htmlFor="orgName">Organization Name</Label>
              <Input
                id="orgName"
                placeholder="e.g. Nexus Security Team"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewOrgOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateOrg}>Create Workspace</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

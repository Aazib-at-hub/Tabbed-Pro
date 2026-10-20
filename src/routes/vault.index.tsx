import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Filter,
  FolderOpen,
  Heart,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { promptsApi, foldersApi, type Prompt, type Folder } from "@/lib/api-client";
import { CATEGORIES, scoreTone } from "@/lib/tabbed-data";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

const FOLDER_EMOJIS = ["📁", "💻", "📣", "🔬", "💼", "🎬", "📝", "🎓", "🌐", "🏆"];

export default function VaultIndex() {
  const { user } = useAuth();
  const userId = user?.id ?? "usr_demo_123";
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Prompt Vault — Tabbed";
  }, []);

  // ── Data state ──────────────────────────────────────────────────────────────
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Filters ─────────────────────────────────────────────────────────────────
  const [query, setQuery] = useState("");
  const [activeFolderId, setActiveFolderId] = useState<string | undefined>(undefined);
  const [category, setCategory] = useState<string>("All");
  const [favOnly, setFavOnly] = useState(false);

  // ── New prompt dialog ───────────────────────────────────────────────────────
  const [newOpen, setNewOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("Coding");
  const [creating, setCreating] = useState(false);

  // ── Load data ───────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [ps, fs] = await Promise.all([
        promptsApi.list(userId, {
          folderId: activeFolderId,
          category: category === "All" ? undefined : category,
          search: query,
          favoritesOnly: favOnly,
        }),
        foldersApi.list(userId),
      ]);
      setPrompts(ps);
      setFolders(fs);
    } catch {
      toast.error("Failed to load vault data");
    } finally {
      setLoading(false);
    }
  }, [userId, activeFolderId, category, query, favOnly]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // ── Computed folder badge counts ────────────────────────────────────────────
  const folderCounts = useMemo(() => {
    const map: Record<string, number> = {};
    prompts.forEach((p) => {
      if (p.folderId) map[p.folderId] = (map[p.folderId] ?? 0) + 1;
    });
    return map;
  }, [prompts]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleFavorite = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const updated = await promptsApi.toggleFavorite(id);
    if (updated) {
      setPrompts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isFavorite: updated.isFavorite } : p)),
      );
      toast.success(updated.isFavorite ? "Added to favourites" : "Removed from favourites");
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const ok = await promptsApi.delete(id);
    if (ok) {
      setPrompts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Prompt deleted");
    }
  };

  const handleCreate = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error("Title and content are required");
      return;
    }
    setCreating(true);
    try {
      const prompt = await promptsApi.create(userId, {
        title: newTitle.trim(),
        rawContent: newContent.trim(),
        category: newCategory,
        mode: "general",
        tags: [],
      });
      toast.success("Prompt created!", { description: "Auto-scored and saved to your vault." });
      setNewOpen(false);
      setNewTitle("");
      setNewContent("");
      navigate(`/vault/${prompt.id}`);
    } catch (e: unknown) {
      const err = e instanceof Error ? e : new Error(String(e));
      if (err.message.includes("PLAN_LIMIT_REACHED")) {
        toast.error("Free Plan Limit Reached (10 Prompts)", {
          description: "Upgrade to Tabbed Pro for unlimited storage.",
          action: {
            label: "Upgrade",
            onClick: () => navigate("/pricing"),
          },
        });
      } else {
        toast.error("Failed to create prompt");
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <AppShell
      title="Prompt Vault"
      description={`${prompts.length} prompts · ${folders.length} folders`}
      actions={
        <Button size="sm" className="hidden sm:inline-flex" onClick={() => setNewOpen(true)}>
          <Plus className="size-4" /> New Prompt
        </Button>
      }
    >
      <div className="mx-auto max-w-7xl space-y-5">
        {/* Free Plan Quota Warning Banner */}
        {user?.subscriptionTier === "free" && prompts.length >= 10 && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4 text-warning">
            <div className="flex items-center gap-2.5">
              <span className="text-base">⚠️</span>
              <div>
                <p className="font-semibold text-sm">
                  Free Vault Limit Reached (10 of 10 prompts used)
                </p>
                <p className="text-xs text-muted-foreground">
                  Upgrade to Tabbed Pro to store unlimited prompts and unlock all 7 AI optimization
                  modes.
                </p>
              </div>
            </div>
            <Button size="sm" asChild>
              <Link to="/pricing">Upgrade to Pro ($12/mo)</Link>
            </Button>
          </div>
        )}

        {/* Folders Row */}
        <section className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
          <button
            onClick={() => {
              setActiveFolderId(undefined);
              setCategory("All");
            }}
            className={cn(
              "elevate elevate-hover flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left",
              !activeFolderId && category === "All" && "border-primary/60 bg-primary/5",
            )}
          >
            <span className="text-lg">📂</span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">All Prompts</span>
              <span className="block text-xs text-muted-foreground">{prompts.length} prompts</span>
            </span>
          </button>
          {folders.map((f) => (
            <button
              key={f.id}
              onClick={() => {
                setActiveFolderId(f.id);
                setCategory("All");
              }}
              className={cn(
                "elevate elevate-hover flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left",
                activeFolderId === f.id && "border-primary/60 bg-primary/5",
              )}
            >
              <span className="text-lg">{f.icon}</span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{f.name}</span>
                <span className="block text-xs text-muted-foreground">
                  {folderCounts[f.id] ?? 0} prompts
                </span>
              </span>
            </button>
          ))}
        </section>

        {/* Filters Bar */}
        <section className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px] flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search prompts, tags or content…"
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Filter className="mr-1 size-3.5 text-muted-foreground" />
            {["All", ...CATEGORIES].map((c) => (
              <button
                key={c}
                onClick={() => {
                  setCategory(c);
                  setActiveFolderId(undefined);
                }}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition-colors",
                  category === c && !activeFolderId
                    ? "border-primary bg-primary/15 font-medium text-primary"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {c}
              </button>
            ))}
            <button
              onClick={() => setFavOnly((v) => !v)}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition-colors",
                favOnly
                  ? "border-amber-500/60 bg-amber-500/15 text-amber-400"
                  : "border-border text-muted-foreground",
              )}
            >
              <Star className={cn("size-3", favOnly && "fill-current")} /> Favourites
            </button>
          </div>
        </section>

        {/* Prompt Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : prompts.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
              <FolderOpen className="size-7 text-muted-foreground" />
              <p className="text-sm font-medium">No prompts match those filters</p>
              <p className="text-xs text-muted-foreground">
                Try clearing the search or picking a different folder.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  setQuery("");
                  setCategory("All");
                  setFavOnly(false);
                  setActiveFolderId(undefined);
                }}
              >
                Reset filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {prompts.map((p) => {
              const origScore = p.score?.overall ?? 0;
              const optScore = p.score?.optimizedOverall ?? origScore;
              return (
                <div key={p.id} className="group relative">
                  <Link to={`/vault/${p.id}`}>
                    <Card className="elevate elevate-hover h-full">
                      <CardContent className="space-y-3 p-5">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-display text-sm font-semibold leading-snug">
                            {p.title}
                          </h3>
                          {p.isFavorite && (
                            <Star className="size-4 shrink-0 fill-amber-400 text-amber-400" />
                          )}
                        </div>
                        <p className="line-clamp-2 text-xs text-muted-foreground">{p.rawContent}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {p.category && (
                            <Badge variant="secondary" className="text-[0.65rem]">
                              {p.category}
                            </Badge>
                          )}
                          {p.tags.slice(0, 3).map((t) => (
                            <Badge
                              key={t}
                              variant="outline"
                              className="text-[0.65rem] text-muted-foreground"
                            >
                              #{t}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center justify-between border-t border-border pt-3 text-xs">
                          <span className="flex items-center gap-1.5 font-mono">
                            <span
                              className={cn(
                                scoreTone(origScore) === "destructive" && "text-destructive",
                              )}
                            >
                              {origScore}
                            </span>
                            <ArrowRight className="size-3 text-muted-foreground" />
                            <span className="font-semibold text-emerald-400">{optScore}</span>
                          </span>
                          <span className="text-muted-foreground">
                            {p.aiPlatform ?? "General"} ·{" "}
                            {new Date(p.createdAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>

                  {/* Card action menu */}
                  <div className="absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 rounded-full bg-card/80 backdrop-blur-sm"
                        >
                          <MoreHorizontal className="size-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onClick={(e) => handleFavorite(e, p.id)}
                          className="gap-2 cursor-pointer"
                        >
                          <Star className="size-3.5" /> {p.isFavorite ? "Unfavourite" : "Favourite"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => handleDelete(e, p.id)}
                          className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                        >
                          <Trash2 className="size-3.5" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </section>
        )}
      </div>

      {/* New Prompt Dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Create New Prompt</DialogTitle>
            <DialogDescription className="text-xs">
              Enter your raw prompt below. Tabbed will automatically score it across 8 dimensions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="new-title" className="text-xs">
                Prompt Title
              </Label>
              <Input
                id="new-title"
                placeholder="e.g. Debug React performance issue"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-category" className="text-xs">
                Category
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewCategory(c)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs transition-colors",
                      newCategory === c
                        ? "border-primary bg-primary/15 font-medium text-primary"
                        : "border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-content" className="text-xs">
                Raw Prompt
              </Label>
              <Textarea
                id="new-content"
                placeholder="Write your prompt here. Don't worry if it's rough — Tabbed will analyse and suggest improvements."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="min-h-[120px] text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating} className="gap-2">
              {creating && <Loader2 className="size-4 animate-spin" />}
              {creating ? "Scoring & Saving…" : "Create & Score Prompt"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

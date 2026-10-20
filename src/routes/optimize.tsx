import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Check,
  Copy,
  Loader2,
  Pencil,
  Plus,
  Save,
  Sparkles,
  UserCog,
  Cpu,
  Shield,
  ShieldAlert,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { PromptComposer } from "@/components/prompt-composer";
import { ScoreBar } from "@/components/score-ring";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { OPTIMIZATION_MODES, SCORE_DIMENSIONS, type OptimizationMode } from "@/lib/tabbed-data";
import { MODELS } from "@/lib/copy";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import {
  profileApi,
  type AIProfile,
  promptsApi,
  workspacesApi,
  type Workspace,
} from "@/lib/api-client";
import { analyzePromptLLM, streamOptimizePrompt, type LLMAnalysisResponse } from "@/lib/llm-client";

const STRENGTH_LABELS: Record<string, string> = {
  clarity: "Clear objective",
  context: "Relevant context",
  specificity: "Concrete details",
  constraints: "Strong constraints",
  role: "Role defined",
  outputFormat: "Defined output",
  examples: "Example provided",
  completeness: "Nothing important missing",
};

export default function Optimizer() {
  useEffect(() => {
    document.title = "Improve with Tabbed — Real LLM Optimizer";
  }, []);

  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";

  const [raw, setRaw] = useState(q);
  const [mode, setMode] = useState<OptimizationMode>("general");
  const [model, setModel] = useState<(typeof MODELS)[number]>("ChatGPT");
  const [provider, setProvider] = useState<
    "openai" | "anthropic" | "gemini" | "mock" | "local" | "ollama"
  >("mock");
  const [optimized, setOptimized] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [profile, setProfile] = useState<AIProfile | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [enforceStandards, setEnforceStandards] = useState(true);

  // Real LLM Evaluation state
  const [analysis, setAnalysis] = useState<LLMAnalysisResponse | null>(null);
  const [optAnalysis, setOptAnalysis] = useState<LLMAnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Load User AI Profile and Workspace
  useEffect(() => {
    if (user?.id) {
      void profileApi.get(user.id).then((p) => {
        if (p) setProfile(p);
      });
      void workspacesApi.list(user.id).then((wsps) => {
        if (wsps.length > 0) setWorkspace(wsps[0]);
      });
    }
  }, [user?.id]);

  // Forbidden keywords guardrail check
  const matchedForbidden = useMemo(() => {
    if (!workspace?.aiStandards?.forbiddenKeywords?.length || !raw.trim()) return [];
    const lower = raw.toLowerCase();
    return workspace.aiStandards.forbiddenKeywords.filter(
      (kw) => kw && lower.includes(kw.toLowerCase()),
    );
  }, [workspace, raw]);

  // Debounced Real LLM Prompt Evaluation
  useEffect(() => {
    if (!raw.trim()) {
      setAnalysis(null);
      return;
    }

    setIsAnalyzing(true);
    const timer = setTimeout(() => {
      void analyzePromptLLM(raw, provider)
        .then((res) => setAnalysis(res))
        .finally(() => setIsAnalyzing(false));
    }, 400);

    return () => clearTimeout(timer);
  }, [raw, provider]);

  // Debounced Real LLM Evaluation for Optimized Prompt
  useEffect(() => {
    if (!optimized?.trim()) {
      setOptAnalysis(null);
      return;
    }

    const timer = setTimeout(() => {
      void analyzePromptLLM(optimized, provider).then((res) => setOptAnalysis(res));
    }, 300);

    return () => clearTimeout(timer);
  }, [optimized, provider]);

  const active = optAnalysis ?? analysis;
  const strengths = active
    ? SCORE_DIMENSIONS.filter((d) => (active.breakdown?.[d.key] ?? 0) >= 70).slice(0, 4)
    : [];

  const handleOptimize = () => {
    if (!raw.trim()) {
      toast.error("Tell Tabbed what you want first", {
        description: "A rough one-liner is enough.",
      });
      return;
    }

    setBusy(true);
    setIsStreaming(true);
    setOptimized("");

    const effectiveProfile: AIProfile = {
      id: profile?.id ?? "temp",
      userId: user?.id ?? "usr",
      profession: profile?.profession,
      techStack: profile?.techStack,
      responseStyle: profile?.responseStyle,
      customRules: profile?.customRules,
      updatedAt: new Date().toISOString(),
    };

    if (enforceStandards && workspace?.aiStandards) {
      const std = workspace.aiStandards;
      const stdText = `[ORG AI STANDARDS: ${workspace.name}]\n- Context: ${std.enforcedContext || "N/A"}\n- Tone: ${std.responseTone || "Technical & Rigorous"}`;
      effectiveProfile.customRules = effectiveProfile.customRules
        ? `${effectiveProfile.customRules}\n\n${stdText}`
        : stdText;
    }

    void streamOptimizePrompt({
      promptText: raw,
      mode,
      model,
      profile: effectiveProfile,
      provider,
      onChunk: (_chunkText, accumulated) => {
        setOptimized(accumulated);
      },
      onComplete: (fullText) => {
        setOptimized(fullText);
        setBusy(false);
        setIsStreaming(false);
        toast.success("Prompt optimized via LLM Engine", {
          description:
            enforceStandards && workspace
              ? `Injected ${workspace.name} AI Standards & Persona`
              : profile?.profession
                ? `Injected AI Profile (${profile.profession})`
                : "Dynamic persona applied.",
        });
      },
      onError: (err) => {
        setBusy(false);
        setIsStreaming(false);
        toast.error("LLM Generation Error", { description: err.message });
      },
    });
  };

  const handleSaveToVault = async () => {
    if (!user || !raw || !optimized) return;
    try {
      await promptsApi.create(user.id, {
        title: raw.slice(0, 40) + "...",
        rawContent: raw,
        optimizedContent: optimized,
        category: mode,
        mode,
        aiPlatform: model,
      });
      toast.success("Saved prompt to your Vault!");
    } catch (e: unknown) {
      const err = e instanceof Error ? e : new Error(String(e));
      if (err.message.includes("PLAN_LIMIT_REACHED")) {
        toast.error("Free Plan Limit Reached (10 Prompts)", {
          description: "Upgrade to Tabbed Pro to store unlimited prompts.",
          action: {
            label: "Upgrade",
            onClick: () => navigate("/pricing"),
          },
        });
      } else {
        toast.error("Failed to save prompt to vault");
      }
    }
  };

  const copy = (text: string) => {
    void navigator.clipboard.writeText(text);
    toast.success("Copied — paste it into " + model);
  };

  return (
    <AppShell
      title="Optimize"
      description="Real LLM Engine with SSE Streaming & AI Profile context injection."
    >
      <div className="mx-auto max-w-5xl space-y-6">
        {!optimized && (
          <div className="space-y-2 pt-2 text-center">
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              What are you trying to get AI to do?
            </h2>
            <p className="text-sm text-muted-foreground">
              Write it out in plain language. Real LLM scoring and SSE streaming handle the rest.
            </p>
          </div>
        )}

        {matchedForbidden.length > 0 && enforceStandards && (
          <div className="flex items-center gap-2.5 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
            <ShieldAlert className="size-4 shrink-0" />
            <div className="flex-1">
              <span className="font-semibold">Org Standards Violation:</span> Contains prohibited
              term(s):{" "}
              <span className="font-mono font-medium underline">{matchedForbidden.join(", ")}</span>
              . Remove before deploying or sharing with team.
            </div>
          </div>
        )}

        <PromptComposer
          value={raw}
          onChange={setRaw}
          onSubmit={handleOptimize}
          busy={busy}
          autoFocus
          footer={
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                <UserCog className="size-3.5 text-primary" />
                AI Profile: {profile?.profession ?? "General Practitioner"}
              </span>

              {workspace && (
                <button
                  type="button"
                  onClick={() => setEnforceStandards((prev) => !prev)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 transition-colors font-medium",
                    enforceStandards
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "border-border bg-muted/40 text-muted-foreground hover:text-foreground",
                  )}
                  title={
                    enforceStandards
                      ? "Injecting org tone & corporate context"
                      : "Org standards disabled"
                  }
                >
                  <Building2 className="size-3.5" />
                  <span>{workspace.name}:</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider">
                    {enforceStandards ? "Standards Active" : "Standards Paused"}
                  </span>
                </button>
              )}

              <span className="inline-flex items-center gap-1.5">
                <Cpu className="size-3.5 text-accent" /> LLM Provider:
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value as typeof provider)}
                  className="rounded-md border border-border bg-background px-2 py-0.5 text-xs text-foreground focus:outline-none"
                >
                  <option value="mock">Tabbed Local Engine (In-Browser)</option>
                  <option value="local">Local LLM (Ollama / Localhost)</option>
                  <option value="openai">OpenAI (GPT-4o)</option>
                  <option value="anthropic">Anthropic (Claude 3.5)</option>
                  <option value="gemini">Google (Gemini 1.5)</option>
                </select>
              </span>

              <span className="inline-flex items-center gap-1.5">
                Target Model:
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value as (typeof MODELS)[number])}
                  className="rounded-md border border-border bg-background px-1.5 py-0.5 text-foreground focus:outline-none"
                >
                  {MODELS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </span>

              <span className="flex flex-wrap items-center gap-1.5">
                Mode:
                {OPTIMIZATION_MODES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    title={m.blurb}
                    className={cn(
                      "rounded-full border px-2.5 py-0.5 transition-colors",
                      mode === m.id
                        ? "border-primary bg-primary/15 font-medium text-primary"
                        : "border-border hover:border-primary/50 hover:text-foreground",
                    )}
                  >
                    {m.label}
                  </button>
                ))}
              </span>
            </div>
          }
        />

        {(raw.trim() || optimized !== null) && (
          <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
            <div className="space-y-5">
              {optimized !== null ? (
                <Card className="elevate border-primary/40">
                  <CardHeader className="flex-row items-start justify-between space-y-0">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Sparkles
                          className={cn("size-4 text-primary", isStreaming && "animate-spin")}
                        />
                        Tabbed Enhanced{" "}
                        {isStreaming && (
                          <Badge variant="secondary" className="animate-pulse text-[0.65rem]">
                            Streaming SSE...
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        Optimized prompt streamed live with profile context applied.
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" disabled={isStreaming} onClick={() => copy(optimized)}>
                        <Copy className="size-3.5" /> Copy & Use
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toast.info("Editing the enhanced version")}
                      >
                        <Pencil className="size-3.5" /> Edit
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Original
                      </p>
                      <pre className="max-h-[360px] min-h-[160px] overflow-auto whitespace-pre-wrap rounded-xl border border-border bg-muted/40 p-4 font-mono text-xs leading-relaxed">
                        {raw}
                      </pre>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center justify-between">
                        <span>Tabbed Enhanced</span>
                        {isStreaming && <Loader2 className="size-3 animate-spin" />}
                      </p>
                      <pre className="max-h-[360px] min-h-[160px] overflow-auto whitespace-pre-wrap rounded-xl border border-primary/40 bg-primary/5 p-4 font-mono text-xs leading-relaxed">
                        {optimized}
                        {isStreaming && (
                          <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse" />
                        )}
                      </pre>
                    </div>
                  </CardContent>
                  <CardContent className="pt-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isStreaming || !optimized}
                      onClick={handleSaveToVault}
                    >
                      <Save className="size-3.5" /> Save to Vault
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="elevate border-dashed">
                  <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
                    <Sparkles className="size-5 text-muted-foreground" />
                    <p className="text-sm font-medium">LLM Engine is ready</p>
                    <p className="max-w-sm text-xs text-muted-foreground">
                      Your instruction is evaluated in real-time by LLM analysis. Hit Improve with
                      Tabbed to stream the optimized prompt live.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            <Card className="elevate h-fit lg:sticky lg:top-24">
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-base">Prompt Intelligence</CardTitle>
                  <CardDescription>Live LLM Quality Score</CardDescription>
                </div>
                {isAnalyzing && <Loader2 className="size-4 animate-spin text-primary" />}
              </CardHeader>
              <CardContent className="space-y-5">
                {active ? (
                  <>
                    <div>
                      <p className="font-display text-4xl font-semibold tabular-nums">
                        {optAnalysis && analysis ? (
                          <>
                            <span className="text-muted-foreground line-through decoration-1">
                              {analysis.overall}
                            </span>
                            <span className="ml-2 text-success">{optAnalysis.overall}</span>
                          </>
                        ) : (
                          active.overall
                        )}
                        <span className="ml-1 text-base font-normal text-muted-foreground">
                          / 100
                        </span>
                      </p>
                      <p className="mt-1 text-sm font-medium">
                        {active.overall >= 80
                          ? "Strong LLM Prompt"
                          : active.overall >= 60
                            ? "Understandable, but leaky"
                            : "AI will have to guess"}
                      </p>
                    </div>

                    {strengths.length > 0 && (
                      <div className="space-y-1.5">
                        {strengths.map((d) => (
                          <p key={d.key} className="flex items-center gap-2 text-xs text-success">
                            <Check className="size-3.5" /> {STRENGTH_LABELS[d.key]}
                          </p>
                        ))}
                      </div>
                    )}

                    {active.missing && active.missing.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-xs font-medium text-muted-foreground">
                          Missing Elements
                        </p>
                        {active.missing.slice(0, 4).map((m) => (
                          <p
                            key={m}
                            className="flex items-start gap-2 text-xs text-muted-foreground"
                          >
                            <Plus className="mt-0.5 size-3 shrink-0 text-primary" /> {m}
                          </p>
                        ))}
                      </div>
                    )}

                    {active.evaluatedBy && (
                      <Badge variant="secondary" className="w-full justify-center text-[0.65rem]">
                        Evaluated by: {active.evaluatedBy}
                      </Badge>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    Type a prompt above to trigger live LLM evaluation...
                  </p>
                )}

                {!optimized && (
                  <Button
                    className="w-full"
                    onClick={handleOptimize}
                    disabled={busy || !raw.trim()}
                  >
                    {busy ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                    Apply LLM Improvements
                  </Button>
                )}

                <Separator />

                {active?.breakdown && (
                  <details className="group">
                    <summary className="cursor-pointer list-none text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
                      Full breakdown · 8 dimensions
                    </summary>
                    <div className="mt-3 grid gap-3">
                      {SCORE_DIMENSIONS.map((d) => (
                        <ScoreBar
                          key={d.key}
                          label={d.label}
                          value={active.breakdown[d.key] ?? 0}
                        />
                      ))}
                    </div>
                  </details>
                )}

                <Badge
                  variant="outline"
                  className="w-full justify-center text-[0.65rem] text-muted-foreground"
                >
                  Optimized for {model} · {OPTIMIZATION_MODES.find((m) => m.id === mode)?.label}{" "}
                  mode
                </Badge>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}

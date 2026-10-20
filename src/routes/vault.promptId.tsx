import { useEffect } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Copy, Pencil, RefreshCw, Save, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { ScoreBar, ScoreRing } from "@/components/score-ring";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PROMPTS, SCORE_DIMENSIONS } from "@/lib/tabbed-data";

export default function VaultDetail() {
  const { promptId } = useParams<{ promptId: string }>();
  const prompt = PROMPTS.find((p) => p.id === promptId);

  useEffect(() => {
    if (prompt) document.title = `${prompt.title} — Prompt Intelligence Report`;
    else document.title = "Prompt unavailable — Tabbed";
  }, [prompt]);

  if (!prompt) return <Navigate to="/vault" replace />;

  const delta = prompt.optimizedScore - prompt.originalScore;

  const copy = (text: string) => {
    void navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <AppShell title={prompt.title} description="Prompt Intelligence Report">
      <div className="mx-auto max-w-6xl space-y-5">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link to="/vault">
            <ArrowLeft className="size-4" /> Back to vault
          </Link>
        </Button>

        <Card className="elevate">
          <CardContent className="flex flex-wrap items-center gap-6 p-6">
            <ScoreRing score={prompt.optimizedScore} size={116} />
            <div className="min-w-[220px] flex-1 space-y-2">
              <h2 className="font-display text-xl font-semibold">{prompt.title}</h2>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{prompt.category}</Badge>
                <Badge variant="outline">{prompt.platform}</Badge>
                <Badge variant="outline">
                  {new Date(prompt.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Badge>
                {prompt.tags.map((t) => (
                  <Badge key={t} variant="outline" className="text-muted-foreground">
                    #{t}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-6 rounded-xl border border-border bg-muted/50 px-5 py-4">
              <div>
                <p className="text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                  Before
                </p>
                <p className="font-display text-2xl font-semibold text-destructive">
                  {prompt.originalScore}
                </p>
              </div>
              <ArrowRight className="size-4 text-muted-foreground" />
              <div>
                <p className="text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                  After
                </p>
                <p className="font-display text-2xl font-semibold text-success">
                  {prompt.optimizedScore}
                </p>
              </div>
              <div>
                <p className="text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                  Gain
                </p>
                <p className="font-display text-2xl font-semibold text-primary">+{delta}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
          <Card className="elevate">
            <CardHeader>
              <CardTitle className="text-base">Original vs Optimized</CardTitle>
              <CardDescription>Same intent, better structure.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Original
                </p>
                <pre className="min-h-[180px] whitespace-pre-wrap rounded-xl border border-border bg-muted/40 p-4 font-mono text-xs leading-relaxed">
                  {prompt.originalPrompt}
                </pre>
                <Button variant="ghost" size="sm" onClick={() => copy(prompt.originalPrompt)}>
                  <Copy className="size-3.5" /> Copy
                </Button>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Optimized
                </p>
                <pre className="max-h-[420px] min-h-[180px] overflow-auto whitespace-pre-wrap rounded-xl border border-primary/40 bg-primary/5 p-4 font-mono text-xs leading-relaxed">
                  {prompt.optimizedPrompt}
                </pre>
                <div className="flex flex-wrap gap-2">
                  <Button variant="ghost" size="sm" onClick={() => copy(prompt.optimizedPrompt)}>
                    <Copy className="size-3.5" /> Copy
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toast.info("Edit mode coming with cloud sync")}
                  >
                    <Pencil className="size-3.5" /> Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => toast.success("Changes saved")}>
                    <Save className="size-3.5" /> Save
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.success("Re-optimizing with Tabbed AI…")}
                  >
                    <RefreshCw className="size-3.5" /> Re-optimize
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-5">
            <Card className="elevate">
              <CardHeader>
                <CardTitle className="text-base">Score Breakdown</CardTitle>
                <CardDescription>Original prompt, 8 dimensions</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3.5">
                {SCORE_DIMENSIONS.map((d) => (
                  <ScoreBar
                    key={d.key}
                    label={d.label}
                    value={prompt.breakdown[d.key]}
                    hint={d.hint}
                  />
                ))}
              </CardContent>
            </Card>

            <Card className="elevate border-warning/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TriangleAlert className="size-4 text-warning" /> Missing Elements
                </CardTitle>
                <CardDescription>Your prompt could be improved by adding:</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {prompt.missing.map((m) => (
                  <p key={m} className="rounded-lg bg-muted/60 px-3 py-2 text-xs">
                    {m}
                  </p>
                ))}
              </CardContent>
            </Card>

            <Card className="elevate">
              <CardHeader>
                <CardTitle className="text-base">Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                {prompt.recommendations.map((r) => (
                  <p key={r} className="flex gap-2">
                    <span className="text-primary">→</span>
                    {r}
                  </p>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowRight, ArrowUpRight, BookMarked, Library, TrendingUp, UserCog } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PromptComposer } from "@/components/prompt-composer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PROMPTS, SCORE_TREND, STATS, scoreTone } from "@/lib/tabbed-data";
import { cn } from "@/lib/utils";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function Home() {
  useEffect(() => {
    document.title = "Home — Tabbed AI Communication Layer";
  }, []);

  const [draft, setDraft] = useState("");
  const navigate = useNavigate();
  const recent = PROMPTS.slice(0, 4);

  const go = () => {
    const q = draft.trim();
    void navigate(q ? `/optimize?q=${encodeURIComponent(q)}` : "/optimize");
  };

  return (
    <AppShell title="Home" description="Your AI communication layer">
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="space-y-4 pt-2 text-center">
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            {greeting()}. Ready to work with AI?
          </h2>
          <p className="text-sm text-muted-foreground">What are you trying to accomplish?</p>
          <PromptComposer
            value={draft}
            onChange={setDraft}
            onSubmit={go}
            className="mx-auto max-w-2xl text-left"
          />
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Card className="elevate">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">Recent work</CardTitle>
                <CardDescription>Pick up where you left off</CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link to="/vault">
                  Vault <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {recent.map((p) => (
                <Link
                  key={p.id}
                  to={`/vault/${p.id}`}
                  className="flex items-center gap-3 rounded-xl border border-border/60 px-3 py-2.5 transition-colors hover:border-primary/40 hover:bg-muted/40"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {p.category} · {p.platform}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "font-mono text-xs tabular-nums",
                      scoreTone(p.optimizedScore) === "success"
                        ? "text-success"
                        : scoreTone(p.optimizedScore) === "warning"
                          ? "text-warning"
                          : "text-destructive",
                    )}
                  >
                    {p.originalScore} → {p.optimizedScore}
                  </span>
                </Link>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="elevate">
              <CardContent className="space-y-3 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Improvement
                  </p>
                  <TrendingUp className="size-4 text-primary" />
                </div>
                <p className="text-sm leading-relaxed">
                  Your average prompt score improved{" "}
                  <span className="font-semibold text-success">{STATS.improvement}%</span> this
                  month.
                </p>
                <div className="h-20">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={SCORE_TREND}>
                      <defs>
                        <linearGradient id="homeTrend" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.5} />
                          <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="label" hide />
                      <YAxis hide domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{
                          background: "var(--popover)",
                          border: "1px solid var(--border)",
                          borderRadius: 12,
                          fontSize: 12,
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="score"
                        stroke="var(--primary)"
                        fill="url(#homeTrend)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <Button asChild variant="ghost" size="sm" className="w-full">
                  <Link to="/analytics">
                    <ArrowUpRight className="size-3.5" /> See analytics
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="elevate">
              <CardContent className="space-y-3 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Your AI Profile
                  </p>
                  <UserCog className="size-4 text-primary" />
                </div>
                <div className="space-y-1 text-sm">
                  <p className="font-medium">Full Stack Developer</p>
                  <p className="text-xs text-muted-foreground">
                    Intermediate · Next.js, React, Python, FastAPI
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {["Concise", "Technical", "Examples preferred"].map((t) => (
                    <Badge key={t} variant="outline" className="text-[0.65rem]">
                      {t}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Applied automatically to every prompt Tabbed improves.
                </p>
                <Button asChild variant="ghost" size="sm" className="w-full">
                  <Link to="/settings/profile">Edit profile</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          <Button asChild variant="outline" className="h-auto justify-start gap-3 py-4">
            <Link to="/templates">
              <Library className="size-4 text-primary" />
              <span className="text-left">
                <span className="block text-sm font-medium">Start from a template</span>
                <span className="block text-xs text-muted-foreground">
                  Proven instructions for common tasks
                </span>
              </span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto justify-start gap-3 py-4">
            <Link to="/vault">
              <BookMarked className="size-4 text-primary" />
              <span className="text-left">
                <span className="block text-sm font-medium">Open your AI memory</span>
                <span className="block text-xs text-muted-foreground">
                  {STATS.totalPrompts} prompts saved
                </span>
              </span>
            </Link>
          </Button>
        </section>
      </div>
    </AppShell>
  );
}

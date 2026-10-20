import { useEffect, useState } from "react";
import { ArrowDown, Check, Copy, Loader2, Sparkles, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const INTENT = "I need a launch strategy for my SaaS.";

const CHECKS = [
  { label: "Intent", ok: true },
  { label: "Context", ok: false },
  { label: "Specificity", ok: false },
  { label: "Output", ok: false },
];

const OPTIMIZED = `ROLE
You are a go-to-market strategist for early-stage B2B SaaS.

CONTEXT
- Solo founder, developer-tools product, pre-revenue.
- Audience: AI-native developers and small product teams.

TASK
Build a 30-day launch strategy for my SaaS.

CONSTRAINTS
- Budget under $2,000. No paid ads before week 3.
- Prioritise channels I can run alone.

OUTPUT FORMAT
Week-by-week table, then the three riskiest assumptions.`;

/** Four-stage looping demo: intent → analysis → improvement → score. */
export function HeroDemo() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const delays = [1600, 2200, 1400, 4200];
    const t = setTimeout(() => setStage((s) => (s + 1) % 4), delays[stage]);
    return () => clearTimeout(t);
  }, [stage]);

  const score = stage < 3 ? 42 : 91;

  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div className="pointer-events-none absolute -inset-16 -z-10 bg-[radial-gradient(circle_at_50%_35%,color-mix(in_oklab,var(--primary)_22%,transparent),transparent_70%)] blur-2xl" />

      <div className="space-y-3 rounded-2xl border border-border/70 bg-card/70 p-5 shadow-[0_24px_70px_-40px_var(--primary)] backdrop-blur">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Your intent
        </p>
        <p className="font-mono text-sm leading-relaxed text-foreground">"{INTENT}"</p>

        <div className="flex justify-center py-1">
          <ArrowDown className="size-4 text-primary/70" />
        </div>

        <div className="rounded-xl border border-border/60 bg-muted/40 p-4">
          <p className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            {stage === 0 ? (
              <Loader2 className="size-3.5 animate-spin text-primary" />
            ) : (
              <Sparkles className="size-3.5 text-primary" />
            )}
            {stage === 0
              ? "Tabbed is reading your intent"
              : stage === 1
                ? "Tabbed analyses"
                : "Tabbed improved it"}
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2">
            {CHECKS.map((c, i) => {
              const resolved = stage >= 2;
              const shown = stage >= 1;
              const ok = resolved || c.ok;
              return (
                <div
                  key={c.label}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs transition-all duration-500",
                    shown ? "opacity-100" : "opacity-30",
                    ok ? "border-success/40 text-success" : "border-warning/40 text-warning",
                  )}
                  style={{ transitionDelay: `${i * 90}ms` }}
                >
                  {ok ? <Check className="size-3.5" /> : <TriangleAlert className="size-3.5" />}
                  {c.label}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/8 px-4 py-3">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Prompt score
            </p>
            <p className="font-display text-2xl font-semibold tabular-nums">
              <span
                className={cn(stage >= 3 ? "text-muted-foreground line-through decoration-1" : "")}
              >
                42
              </span>
              {stage >= 3 && <span className="ml-2 text-success">91</span>}
              <span className="ml-1 text-sm font-normal text-muted-foreground">/ 100</span>
            </p>
          </div>
          <div className={cn("h-1.5 w-28 overflow-hidden rounded-full bg-muted")}>
            <div
              className="h-full rounded-full bg-primary transition-all duration-700"
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        {stage >= 3 && (
          <pre className="max-h-40 overflow-hidden whitespace-pre-wrap rounded-xl bg-muted/50 p-3 font-mono text-[0.7rem] leading-relaxed text-muted-foreground">
            {OPTIMIZED}
          </pre>
        )}

        <Button
          className="w-full"
          variant={stage >= 3 ? "default" : "secondary"}
          onClick={() => {
            void navigator.clipboard.writeText(OPTIMIZED);
            toast.success("Optimized prompt copied");
          }}
        >
          <Copy className="size-4" /> Copy Optimized Prompt
        </Button>
      </div>
    </div>
  );
}

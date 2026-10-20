import { useEffect, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ROTATING_EXAMPLES, COPY } from "@/lib/copy";
import { cn } from "@/lib/utils";

/**
 * The single central input the whole product revolves around:
 * "What are you trying to get AI to do?"
 */
export function PromptComposer({
  value,
  onChange,
  onSubmit,
  busy,
  autoFocus,
  className,
  footer,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  busy?: boolean;
  autoFocus?: boolean;
  className?: string;
  footer?: React.ReactNode;
}) {
  const [exampleIndex, setExampleIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setExampleIndex((i) => (i + 1) % ROTATING_EXAMPLES.length), 2600);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/70 bg-card/70 p-4 shadow-[0_20px_60px_-45px_var(--primary)] backdrop-blur transition-colors focus-within:border-primary/50",
        className,
      )}
    >
      <Textarea
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onSubmit();
        }}
        placeholder={COPY.composerPlaceholder}
        className="min-h-[132px] resize-y border-0 bg-transparent p-2 text-base leading-relaxed shadow-none focus-visible:ring-0"
      />

      <div className="flex flex-wrap items-center justify-between gap-3 px-2 pt-2">
        <p className="text-xs text-muted-foreground">
          {value.trim() ? (
            `${value.trim().split(/\s+/).length} words · ⌘↵ to improve`
          ) : (
            <span key={exampleIndex} className="animate-in fade-in duration-500">
              e.g. {ROTATING_EXAMPLES[exampleIndex]}
            </span>
          )}
        </p>
        <Button onClick={onSubmit} disabled={busy}>
          <Sparkles className={cn("size-4", busy && "animate-pulse")} />
          {busy ? "Improving…" : COPY.composerAction}
          {!busy && <ArrowRight className="size-4" />}
        </Button>
      </div>

      {footer && <div className="mt-3 border-t border-border/60 px-2 pt-3">{footer}</div>}
    </div>
  );
}

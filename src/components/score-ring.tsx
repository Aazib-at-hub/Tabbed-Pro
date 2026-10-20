import { cn } from "@/lib/utils";
import { scoreTone } from "@/lib/tabbed-data";

const toneClass = {
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
} as const;

export function ScoreRing({
  score,
  size = 96,
  label = "Prompt Score",
  className,
}: {
  score: number;
  size?: number;
  label?: string;
  className?: string;
}) {
  const stroke = size / 11;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const tone = toneClass[scoreTone(score)];

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        role="img"
        aria-label={`${label}: ${score} out of 100`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          className="stroke-muted"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          className={cn("transition-[stroke-dashoffset] duration-700 ease-out", tone)}
          stroke="currentColor"
          strokeDasharray={c}
          strokeDashoffset={c - (c * Math.min(100, Math.max(0, score))) / 100}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display font-semibold tabular-nums" style={{ fontSize: size / 3.4 }}>
          {Math.round(score)}
        </span>
        <span className="text-[0.6rem] uppercase tracking-widest text-muted-foreground">/100</span>
      </div>
    </div>
  );
}

export function ScoreBar({ label, value, hint }: { label: string; value: number; hint?: string }) {
  const tone = scoreTone(value);
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium">{label}</span>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">{value}/100</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-700 ease-out",
            tone === "success" && "bg-success",
            tone === "warning" && "bg-warning",
            tone === "destructive" && "bg-destructive",
          )}
          style={{ width: `${value}%` }}
        />
      </div>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

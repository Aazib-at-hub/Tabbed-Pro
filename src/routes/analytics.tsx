import { useEffect } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Lightbulb, TrendingDown, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CATEGORY_USAGE, DIMENSION_AVERAGES, SCORE_TREND, STATS } from "@/lib/tabbed-data";

const tooltipStyle = {
  background: "var(--color-popover)",
  border: "1px solid var(--color-border)",
  borderRadius: 12,
  fontSize: 12,
  color: "var(--color-popover-foreground)",
};

const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-chart-1)",
];

function Metric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card className="elevate">
      <CardContent className="p-5">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="mt-2 font-display text-2xl font-semibold tabular-nums">{value}</p>
        {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export default function Analytics() {
  useEffect(() => {
    document.title = "Analytics — Tabbed Prompt Intelligence";
  }, []);

  return (
    <AppShell title="Analytics" description="How well you communicate with AI, measured">
      <div className="mx-auto max-w-7xl space-y-5">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Prompts created" value={String(STATS.totalPrompts)} sub="21 this week" />
          <Metric
            label="Prompts optimized"
            value={String(STATS.optimized)}
            sub="74% optimization rate"
          />
          <Metric label="Best score" value="96/100" sub="Systematic Literature Scan" />
          <Metric label="Lowest score" value="31/100" sub='"fix this"' />
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <Card className="elevate lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Prompt activity & quality</CardTitle>
              <CardDescription>Volume against average score</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] pr-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={SCORE_TREND} margin={{ left: -20, right: 8, top: 8 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    stroke="var(--color-muted-foreground)"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    stroke="var(--color-muted-foreground)"
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line
                    type="monotone"
                    dataKey="score"
                    name="Avg score"
                    stroke="var(--color-chart-1)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="prompts"
                    name="Prompts"
                    stroke="var(--color-chart-2)"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="elevate">
            <CardHeader>
              <CardTitle className="text-base">Dimension profile</CardTitle>
              <CardDescription>Average across all prompts</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={DIMENSION_AVERAGES} outerRadius="72%">
                  <PolarGrid stroke="var(--color-border)" />
                  <PolarAngleAxis
                    dataKey="dimension"
                    tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                  />
                  <Radar
                    dataKey="score"
                    stroke="var(--color-chart-1)"
                    fill="var(--color-chart-1)"
                    fillOpacity={0.28}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <Card className="elevate lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Categories you use most</CardTitle>
              <CardDescription>Prompts by folder</CardDescription>
            </CardHeader>
            <CardContent className="h-[280px] pr-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CATEGORY_USAGE} margin={{ left: -20, right: 8, top: 8 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="category"
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    stroke="var(--color-muted-foreground)"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    stroke="var(--color-muted-foreground)"
                  />
                  <Tooltip cursor={{ fill: "var(--color-muted)" }} contentStyle={tooltipStyle} />
                  <Bar dataKey="value" name="Prompts" radius={[6, 6, 0, 0]}>
                    {CATEGORY_USAGE.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="elevate">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Lightbulb className="size-4 text-primary" /> Improvement insights
              </CardTitle>
              <CardDescription>Generated from your last 90 days</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="rounded-xl border border-success/30 bg-success/10 p-3">
                <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-success">
                  <TrendingUp className="size-3.5" /> Strongest area
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Clarity (86)</span> — your asks are
                  rarely ambiguous.
                </p>
              </div>
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3">
                <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-destructive">
                  <TrendingDown className="size-3.5" /> Most common weakness
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Constraints (41)</span> — 68% of
                  your prompts set no limits, so models over-deliver off-target.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-muted/50 p-3">
                <p className="text-xs font-semibold">Highest-leverage fix</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Declaring an output format could lift your average Prompt Score by roughly{" "}
                  <span className="font-medium text-primary">15 points</span>.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-muted/50 p-3">
                <p className="text-xs font-semibold">Most active days</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Tuesday and Thursday, 09:00–12:00.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}

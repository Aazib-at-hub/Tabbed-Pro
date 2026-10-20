import { useEffect, useMemo, useState } from "react";
import { Download, Plus, Search, Users } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TEMPLATES } from "@/lib/tabbed-data";
import { cn } from "@/lib/utils";

const CATS = [
  "All",
  "Coding",
  "Marketing",
  "Business",
  "Research",
  "Education",
  "Content Creation",
  "Productivity",
];

export default function Templates() {
  useEffect(() => {
    document.title = "Prompt Templates — Tabbed";
  }, []);

  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");

  const list = useMemo(
    () =>
      TEMPLATES.filter(
        (t) =>
          (cat === "All" || t.category === cat) &&
          (!q ||
            t.title.toLowerCase().includes(q.toLowerCase()) ||
            t.description.toLowerCase().includes(q.toLowerCase())),
      ),
    [cat, q],
  );

  return (
    <AppShell
      title="Templates"
      description="Battle-tested prompt structures, scored by Tabbed"
      actions={
        <Button
          size="sm"
          className="hidden sm:inline-flex"
          onClick={() => toast.success("Template draft created")}
        >
          <Plus className="size-4" /> New template
        </Button>
      }
    >
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search templates…"
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CATS.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition-colors",
                  cat === c
                    ? "border-primary bg-primary/15 font-medium text-primary"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((t) => (
            <Card key={t.id} className="elevate elevate-hover flex h-full flex-col">
              <CardContent className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-sm font-semibold">{t.title}</h3>
                  <span className="rounded-md bg-success/15 px-2 py-0.5 font-mono text-xs font-semibold text-success">
                    {t.score}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{t.description}</p>
                <p className="line-clamp-3 rounded-lg bg-muted/50 p-3 font-mono text-[0.7rem] leading-relaxed text-muted-foreground">
                  {t.preview}
                </p>
                <div className="mt-auto flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[0.65rem]">
                      {t.category}
                    </Badge>
                    <span className="inline-flex items-center gap-1 text-[0.7rem] text-muted-foreground">
                      <Users className="size-3" /> {t.uses.toLocaleString()}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast.success(`"${t.title}" saved to your vault`)}
                  >
                    <Download className="size-3.5" /> Save
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </AppShell>
  );
}

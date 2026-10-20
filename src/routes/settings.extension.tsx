import { useEffect, useState } from "react";
import { CheckCircle2, Chrome, RefreshCw, Unplug } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const FLOW = [
  "You write a prompt on ChatGPT, Claude, Gemini or Perplexity",
  "The Tabbed extension analyses it inline",
  "The prompt receives a Prompt Score",
  "You optimize it in one click",
  "You hit 'Save to Tabbed'",
  "It syncs to your cloud Prompt Vault and analytics update",
];

export default function ExtensionSettings() {
  useEffect(() => {
    document.title = "Chrome Extension — Tabbed";
  }, []);

  const [connected, setConnected] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [saveOriginals, setSaveOriginals] = useState(true);
  const [saveResponses, setSaveResponses] = useState(false);

  return (
    <AppShell title="Chrome Extension" description="Connection, sync and data controls">
      <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <Card className="elevate">
            <CardContent className="flex flex-wrap items-center gap-4 p-6">
              <span className="grid size-12 place-items-center rounded-xl bg-primary/15 text-primary">
                <Chrome className="size-6" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-display font-semibold">Tabbed for Chrome</p>
                  <Badge variant="secondary" className="gap-1">
                    Companion Extension · Cloud Pairing
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Generate secure token below to link the Tabbed Pro Chrome Companion to your account.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    toast.success("Sync complete", { description: "3 new prompts imported." })
                  }
                >
                  <RefreshCw className="size-3.5" /> Sync now
                </Button>
                <Button
                  variant={connected ? "outline" : "default"}
                  size="sm"
                  onClick={() => {
                    setConnected((c) => !c);
                    toast[connected ? "info" : "success"](
                      connected ? "Extension disconnected" : "Extension connected",
                    );
                  }}
                >
                  <Unplug className="size-3.5" /> {connected ? "Disconnect" : "Connect"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="elevate">
            <CardHeader>
              <CardTitle className="text-base">Data controls</CardTitle>
              <CardDescription>You decide what leaves your browser.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {[
                {
                  id: "auto",
                  label: "Auto-save scored prompts",
                  desc: "Every prompt the extension scores syncs to your vault.",
                  v: autoSave,
                  set: setAutoSave,
                },
                {
                  id: "orig",
                  label: "Store original prompts",
                  desc: "Keep the pre-optimization version for before/after reports.",
                  v: saveOriginals,
                  set: setSaveOriginals,
                },
                {
                  id: "resp",
                  label: "Store AI responses",
                  desc: "Off by default — responses may contain sensitive output.",
                  v: saveResponses,
                  set: setSaveResponses,
                },
              ].map((row, i, arr) => (
                <div key={row.id}>
                  <div className="flex items-center justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <Label htmlFor={row.id} className="text-sm">
                        {row.label}
                      </Label>
                      <p className="text-xs text-muted-foreground">{row.desc}</p>
                    </div>
                    <Switch id={row.id} checked={row.v} onCheckedChange={row.set} />
                  </div>
                  {i < arr.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="elevate h-fit">
          <CardHeader>
            <CardTitle className="text-base">How syncing works</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {FLOW.map((step, i) => (
                <li key={step} className="flex gap-3 text-xs text-muted-foreground">
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary/15 font-mono text-[0.65rem] text-primary">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

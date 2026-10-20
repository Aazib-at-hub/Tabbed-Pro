import { useEffect, useState } from "react";
import { Loader2, Save, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { profileApi } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

const EXPERIENCE = ["Beginner", "Intermediate", "Advanced", "Expert"];
const STYLES = ["Concise", "Balanced", "Detailed", "Highly structured"];
const PLATFORMS = ["ChatGPT", "Claude", "Gemini", "Perplexity"];

function Chips({
  options,
  value,
  onChange,
  multi = false,
}: {
  options: string[];
  value: string[];
  onChange: (next: string[]) => void;
  multi?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = value.includes(o);
        return (
          <button
            key={o}
            type="button"
            onClick={() =>
              onChange(multi ? (active ? value.filter((v) => v !== o) : [...value, o]) : [o])
            }
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs transition-colors",
              active
                ? "border-primary bg-primary/15 font-medium text-primary"
                : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
            )}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

export default function ProfileSettings() {
  const { user, completeOnboarding } = useAuth();
  const userId = user?.id ?? "usr_demo_123";

  useEffect(() => {
    document.title = "My AI Profile — Tabbed";
  }, []);

  const [profession, setProfession] = useState(user?.profile?.profession ?? "Full Stack Developer");
  const [stack, setStack] = useState("Next.js, React, Python, FastAPI");
  const [experience, setExperience] = useState(["Intermediate"]);
  const [style, setStyle] = useState([user?.profile?.responseStyle ?? "Detailed"]);
  const [platforms, setPlatforms] = useState(user?.profile?.platforms ?? ["ChatGPT", "Claude"]);
  const [context, setContext] = useState(
    "I ship production SaaS products solo. Prefer TypeScript, strong typing and pragmatic trade-offs over theory.",
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const profile = await profileApi.get(userId);
        if (profile) {
          if (profile.profession) setProfession(profile.profession);
          if (profile.techStack) setStack(profile.techStack);
          if (profile.experience) setExperience([profile.experience]);
          if (profile.responseStyle) setStyle([profile.responseStyle]);
          if (profile.platforms?.length) setPlatforms(profile.platforms);
          if (profile.customRules) setContext(profile.customRules);
        }
      } catch {
        // use defaults
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await profileApi.upsert(userId, {
        profession,
        experience: experience[0],
        responseStyle: style[0],
        platforms,
        techStack: stack,
        customRules: context,
      });
      completeOnboarding({
        profession,
        mainDomain: user?.profile?.mainDomain,
        platforms,
        responseStyle: style[0],
      });
      toast.success("AI Profile saved", {
        description: "Future optimizations will use this context automatically.",
      });
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell title="My AI Profile" description="Context Tabbed reuses in every optimization">
      <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-[1fr_320px]">
        <Card className="elevate">
          <CardHeader>
            <CardTitle className="text-base">Personal context</CardTitle>
            <CardDescription>
              Stop retyping who you are in every prompt. Tabbed injects this automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="profession">Profession</Label>
                    <Input
                      id="profession"
                      value={profession}
                      onChange={(e) => setProfession(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stack">Preferred tools / stack</Label>
                    <Input id="stack" value={stack} onChange={(e) => setStack(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Experience level</Label>
                  <Chips options={EXPERIENCE} value={experience} onChange={setExperience} />
                </div>

                <div className="space-y-2">
                  <Label>Preferred output style</Label>
                  <Chips options={STYLES} value={style} onChange={setStyle} />
                </div>

                <div className="space-y-2">
                  <Label>AI platforms you use</Label>
                  <Chips options={PLATFORMS} value={platforms} onChange={setPlatforms} multi />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="context">Custom context</Label>
                  <Textarea
                    id="context"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    className="min-h-[110px] text-sm"
                    placeholder="Add any extra personal context Tabbed should always include when optimizing your prompts…"
                  />
                </div>

                <Button onClick={handleSave} disabled={saving} className="gap-2">
                  {saving ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  {saving ? "Saving…" : "Save Profile"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="elevate h-fit border-primary/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="size-4 text-primary" /> How it's applied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap rounded-xl bg-muted/60 p-4 font-mono text-[0.7rem] leading-relaxed">
              {`CONTEXT
- I am a ${profession} (${experience[0]} level).
- Tools / stack: ${stack}.
- Preferred style: ${style[0]}.
- Platforms: ${platforms.join(", ")}.
- Notes: ${context.slice(0, 80)}…`}
            </pre>
            <p className="mt-3 text-xs text-muted-foreground">
              This block is prepended to every prompt you optimize, on any of your connected
              platforms.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

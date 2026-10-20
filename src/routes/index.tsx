import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Chrome,
  Sparkles,
  Target,
  BrainCircuit,
  Layers,
  Boxes,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { HeroDemo } from "@/components/hero-demo";
import { COPY, MODELS, TRANSFORM_STEPS } from "@/lib/copy";
import logoSrc from "@/assets/logo.png";

const PILLARS = [
  {
    icon: Target,
    title: "Understands your intent",
    body: "Tabbed reads what you're actually trying to accomplish — not just the words you typed.",
    color: "from-blue-500/10 to-cyan-500/10",
    border: "border-blue-500/20",
    iconBg: "bg-blue-500/15",
    iconColor: "text-blue-400",
  },
  {
    icon: BrainCircuit,
    title: "Remembers your context",
    body: "Your AI Profile travels with every prompt: your role, your stack, how you like answers written.",
    color: "from-violet-500/10 to-purple-500/10",
    border: "border-violet-500/20",
    iconBg: "bg-violet-500/15",
    iconColor: "text-violet-400",
  },
  {
    icon: Layers,
    title: "Improves the instruction",
    body: "Role, context, constraints and output format added automatically. Your intent stays intact.",
    color: "from-cyan-500/10 to-teal-500/10",
    border: "border-cyan-500/20",
    iconBg: "bg-cyan-500/15",
    iconColor: "text-cyan-400",
  },
  {
    icon: Boxes,
    title: "Keeps your AI memory",
    body: "Every prompt scored, versioned and searchable in the Vault so good thinking is never lost.",
    color: "from-emerald-500/10 to-green-500/10",
    border: "border-emerald-500/20",
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-400",
  },
];

const PIPELINE_ICONS = [Target, BrainCircuit, Wand2, Sparkles];

const STEP_DESCRIPTIONS = [
  "Tabbed reads the goal behind your words, not just the literal text you typed.",
  "Your AI Profile and project context attach automatically — no copy-pasting.",
  "Role, constraints, output format and tone are made explicit and precise.",
  "The result is shaped for whichever model you're using, at the right detail level.",
];

function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logoSrc} alt="Tabbed logo" className="size-8 rounded-lg" />
          <span className="font-display text-[0.95rem] font-semibold tracking-tight">
            Tabb<span className="text-primary">ed</span>
          </span>
        </Link>
        <nav className="ml-6 hidden items-center gap-5 text-sm text-muted-foreground md:flex">
          <a href="#how" className="transition-colors hover:text-foreground">
            How it works
          </a>
          <a href="#why" className="transition-colors hover:text-foreground">
            Why Tabbed
          </a>
          <Link to="/pricing" className="transition-colors hover:text-foreground">
            Pricing
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link to="/home">Open Tabbed</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/optimize">{COPY.primaryCta}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

export default function Landing() {
  useEffect(() => {
    document.title = "Tabbed — The layer between you and AI";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Nav />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 lg:pt-24">
          <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1fr_1fr]">
            <div className="space-y-7">
              <Badge variant="outline" className="border-primary/40 text-primary">
                <Sparkles className="mr-1.5 size-3" /> {COPY.positioning}
              </Badge>
              <h1 className="font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
                {COPY.heroHeadline}
              </h1>
              <p className="max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
                {COPY.heroSub}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <Link to="/optimize">
                    {COPY.primaryCta} <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a href="#how">{COPY.secondaryCta}</a>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Works with {MODELS.join(" · ")}. No signup needed to try it.
              </p>
            </div>

            <HeroDemo />
          </div>
        </section>

        {/* PAS */}
        <section id="why" className="border-y border-border/60 bg-muted/20 px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-3xl space-y-6 text-center">
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              {COPY.problem}
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground">{COPY.agitation}</p>
            <p className="text-base leading-relaxed text-foreground">{COPY.solution}</p>
          </div>
        </section>

        {/* How it works — Animated Pipeline */}
        <section id="how" className="overflow-hidden px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <p className="text-center text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              How it works
            </p>
            <h2 className="mt-3 text-center font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Your intent in. Better AI output out.
            </h2>

            {/* Desktop pipeline: horizontal flow */}
            <div className="mt-14 hidden lg:block">
              <div className="relative flex items-start gap-0">
                {/* Connector line behind nodes */}
                <div
                  className="absolute left-[calc(12.5%+1rem)] right-[calc(12.5%+1rem)] top-8 h-px"
                  style={{
                    background:
                      "linear-gradient(to right, transparent 0%, var(--primary) 20%, var(--primary) 80%, transparent 100%)",
                    opacity: 0.3,
                  }}
                />

                {TRANSFORM_STEPS.map((step, i) => {
                  const Icon = PIPELINE_ICONS[i];
                  return (
                    <div
                      key={step}
                      className="relative flex flex-1 flex-col items-center gap-4"
                      style={{ animationDelay: `${i * 120}ms` }}
                    >
                      {/* Node */}
                      <div className="relative z-10 flex flex-col items-center">
                        {/* Outer glow ring */}
                        <div
                          className="absolute -inset-3 rounded-full opacity-0 transition-all duration-300 group-hover:opacity-100"
                          style={{
                            background:
                              "radial-gradient(circle, color-mix(in oklab, var(--primary) 30%, transparent), transparent 70%)",
                          }}
                        />
                        {/* Step number badge */}
                        <div className="absolute -top-3 -right-1 z-20 flex size-5 items-center justify-center rounded-full bg-primary text-[0.6rem] font-bold text-primary-foreground shadow-lg">
                          {i + 1}
                        </div>
                        {/* Icon circle */}
                        <div className="relative flex size-16 items-center justify-center rounded-2xl border border-primary/30 bg-card shadow-[0_0_24px_-8px_var(--primary)] transition-all duration-300 hover:border-primary/60 hover:shadow-[0_0_36px_-6px_var(--primary)] hover:-translate-y-1">
                          <Icon className="size-7 text-primary" />
                        </div>
                      </div>
                      {/* Text */}
                      <div className="px-3 text-center">
                        <p className="font-display text-sm font-semibold leading-tight">{step}</p>
                        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                          {STEP_DESCRIPTIONS[i]}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile: vertical flow */}
            <div className="mt-10 flex flex-col gap-0 lg:hidden">
              {TRANSFORM_STEPS.map((step, i) => {
                const Icon = PIPELINE_ICONS[i];
                return (
                  <div key={step} className="flex gap-5">
                    {/* Left column: node + connector */}
                    <div className="flex flex-col items-center">
                      <div className="relative flex size-12 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-card shadow-[0_0_20px_-8px_var(--primary)]">
                        <span className="absolute -top-2 -right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[0.55rem] font-bold text-primary-foreground">
                          {i + 1}
                        </span>
                        <Icon className="size-5 text-primary" />
                      </div>
                      {i < TRANSFORM_STEPS.length - 1 && (
                        <div
                          className="mt-1 w-px flex-1 bg-gradient-to-b from-primary/40 to-transparent"
                          style={{ minHeight: "48px" }}
                        />
                      )}
                    </div>
                    {/* Right column: text */}
                    <div className="pb-8 pt-1">
                      <p className="font-display text-sm font-semibold">{step}</p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {STEP_DESCRIPTIONS[i]}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Feature Spotlights — alternating rows */}
        <section id="features" className="border-t border-border/60 px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <p className="text-center text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Why Tabbed
            </p>
            <h2 className="mt-3 text-center font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              One layer that handles everything.
            </h2>

            <div className="mt-14 space-y-20">
              {PILLARS.map((p, i) => (
                <div
                  key={p.title}
                  className={`flex flex-col items-center gap-10 lg:flex-row ${i % 2 === 1 ? "lg:flex-row-reverse" : ""}`}
                >
                  {/* Icon cluster */}
                  <div className="flex-1">
                    <div
                      className={`relative mx-auto flex h-56 w-full max-w-sm items-center justify-center rounded-3xl border ${p.border} bg-gradient-to-br ${p.color} backdrop-blur`}
                    >
                      {/* Background blob */}
                      <div
                        className="absolute inset-0 rounded-3xl opacity-50"
                        style={{
                          backgroundImage: `radial-gradient(circle at 50% 50%, color-mix(in oklab, var(--primary) 15%, transparent), transparent 70%)`,
                        }}
                      />
                      {/* Decorative dots */}
                      <div className="absolute left-6 top-6 size-2 rounded-full bg-primary/40" />
                      <div className="absolute right-8 top-8 size-1.5 rounded-full bg-primary/25" />
                      <div className="absolute bottom-6 right-6 size-2 rounded-full bg-primary/35" />
                      <div className="absolute bottom-8 left-8 size-1.5 rounded-full bg-primary/20" />
                      {/* Main icon */}
                      <div
                        className={`relative flex size-20 items-center justify-center rounded-2xl ${p.iconBg} shadow-[0_0_40px_-12px_var(--primary)]`}
                      >
                        <p.icon className={`size-10 ${p.iconColor}`} />
                      </div>
                    </div>
                  </div>

                  {/* Text */}
                  <div className="flex-1 space-y-4">
                    <div
                      className={`inline-flex size-10 items-center justify-center rounded-xl ${p.iconBg}`}
                    >
                      <p.icon className={`size-5 ${p.iconColor}`} />
                    </div>
                    <h3 className="font-display text-2xl font-semibold tracking-tight">
                      {p.title}
                    </h3>
                    <p className="text-base leading-relaxed text-muted-foreground">{p.body}</p>
                    <Button asChild variant="ghost" className="group -ml-2 gap-1 px-2">
                      <Link to="/optimize">
                        Try it now{" "}
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Extension */}
        <section className="border-t border-border/60 bg-muted/20 px-4 py-20 sm:px-6">
          <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-2">
            <div className="space-y-4">
              <Badge variant="outline">
                <Chrome className="mr-1.5 size-3" /> Browser extension
              </Badge>
              <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                Tabbed lives where you already talk to AI.
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Type in ChatGPT, Claude, Gemini or Perplexity and Tabbed quietly scores what you
                wrote, tells you what's missing, and rewrites it in place. No new destination to
                visit.
              </p>
              <Button asChild variant="outline">
                <Link to="/settings/extension">See the extension</Link>
              </Button>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card/70 p-5 backdrop-blur">
              <p className="text-xs text-muted-foreground">ChatGPT</p>
              <p className="mt-2 rounded-lg bg-muted/60 p-3 font-mono text-sm">make this better</p>
              <div className="mt-4 rounded-xl border border-primary/40 bg-primary/8 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-display text-sm font-semibold">Tabbed</p>
                  <span className="font-mono text-xs text-warning">Score 48</span>
                </div>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <li>Missing context</li>
                  <li>Missing constraints</li>
                </ul>
                <Button size="sm" className="mt-3 w-full">
                  <Wand2 className="size-3.5" /> Improve
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-2xl space-y-6 text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              You know what you mean. Tabbed helps AI understand it.
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <Link to="/optimize">
                  {COPY.primaryCta} <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/pricing">See plans</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Tabbed</span>
          <Link to="/home" className="hover:text-foreground">
            App
          </Link>
          <Link to="/vault" className="hover:text-foreground">
            Vault
          </Link>
          <Link to="/templates" className="hover:text-foreground">
            Templates
          </Link>
          <Link to="/pricing" className="hover:text-foreground">
            Pricing
          </Link>
          <Link to="/privacy" className="hover:text-foreground">
            Privacy Policy
          </Link>
          <Link to="/terms" className="hover:text-foreground">
            Terms of Service
          </Link>
        </div>
      </footer>
    </div>
  );
}

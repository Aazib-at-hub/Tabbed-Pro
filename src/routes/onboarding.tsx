import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Code,
  GraduationCap,
  Megaphone,
  Video,
  Microscope,
  Briefcase,
  Palette,
  Sparkles,
  Bot,
  BrainCircuit,
  FileCode,
  FileText,
  BarChart,
  LayoutGrid,
  ListOrdered,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import logoSrc from "@/assets/logo.png";
import { cn } from "@/lib/utils";

// Step 1: Roles
const ROLES = [
  {
    id: "Developer",
    label: "Software Developer",
    desc: "Web, mobile, & backend engineering",
    icon: Code,
  },
  {
    id: "Student",
    label: "Student & Academic",
    desc: "Learning, course work, & research",
    icon: GraduationCap,
  },
  {
    id: "Marketer",
    label: "Growth & Marketing",
    desc: "SEO, ads, email copy, & branding",
    icon: Megaphone,
  },
  {
    id: "Content Creator",
    label: "Content Creator",
    desc: "Video scripts, blogging, & social media",
    icon: Video,
  },
  {
    id: "Researcher",
    label: "Researcher & Scientist",
    desc: "Data synthesis, literature, & analysis",
    icon: Microscope,
  },
  {
    id: "Entrepreneur",
    label: "Founder / Entrepreneur",
    desc: "Business plans, strategy, & proposals",
    icon: Briefcase,
  },
  {
    id: "Designer",
    label: "UX/UI Designer",
    desc: "Design specs, copy, & user research",
    icon: Palette,
  },
  {
    id: "Other",
    label: "Other AI Enthusiast",
    desc: "Everyday AI optimization & workflow",
    icon: Sparkles,
  },
];

// Step 2: Domains
const DOMAINS = [
  {
    id: "Coding",
    label: "Software & Coding",
    desc: "Debugging, architecture, & API integrations",
    icon: FileCode,
  },
  {
    id: "Research",
    label: "Deep Research",
    desc: "Literature review, paper summaries, & data",
    icon: Microscope,
  },
  {
    id: "Writing",
    label: "Writing & Editing",
    desc: "Blogs, emails, reports, & documentation",
    icon: FileText,
  },
  {
    id: "Marketing",
    label: "Marketing & Growth",
    desc: "Ad copy, landing pages, & social campaigns",
    icon: Megaphone,
  },
  {
    id: "Business",
    label: "Business & Strategy",
    desc: "Financial modeling, pitching, & market analysis",
    icon: Briefcase,
  },
  {
    id: "Learning",
    label: "Study & Explanations",
    desc: "Concept breakdowns, tutorials, & quizzes",
    icon: GraduationCap,
  },
  {
    id: "Data Analysis",
    label: "Data & Analytics",
    desc: "SQL, Python pandas, charts, & data mining",
    icon: BarChart,
  },
  {
    id: "Content Creation",
    label: "Creative & Scripting",
    desc: "YouTube, podcast scripts, & stories",
    icon: Video,
  },
];

// Step 3: Platforms (Multi-select)
const PLATFORMS = [
  {
    id: "ChatGPT",
    label: "OpenAI ChatGPT",
    desc: "GPT-4o, o1, & custom GPTs",
    icon: Bot,
    badge: "Most Popular",
  },
  {
    id: "Claude",
    label: "Anthropic Claude",
    desc: "Claude 3.5 Sonnet & Opus",
    icon: BrainCircuit,
    badge: "Power User",
  },
  {
    id: "Gemini",
    label: "Google Gemini",
    desc: "Gemini 1.5 Pro & Advanced",
    icon: Sparkles,
    badge: "Multimodal",
  },
  {
    id: "Perplexity",
    label: "Perplexity AI",
    desc: "Pro search & live citations",
    icon: Zap,
    badge: "Research",
  },
  {
    id: "Other",
    label: "Other Models",
    desc: "DeepSeek, Llama 3, Mistral, Local LLMs",
    icon: LayoutGrid,
  },
];

// Step 4: Output Preferences
const STYLES = [
  {
    id: "Concise",
    label: "Concise & Direct",
    desc: "Short, punchy responses with no fluff or filler.",
    icon: Zap,
  },
  {
    id: "Balanced",
    label: "Balanced & Natural",
    desc: "Well-explained answers with standard structure.",
    icon: FileText,
  },
  {
    id: "Detailed",
    label: "Detailed & Comprehensive",
    desc: "Deep-dive explanations covering edge cases.",
    icon: BrainCircuit,
  },
  {
    id: "Highly Structured",
    label: "Highly Structured",
    desc: "Strict Markdown headers, bullet points, & JSON/tables.",
    icon: ListOrdered,
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, completeOnboarding } = useAuth();

  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState(user?.profile?.profession || "Developer");
  const [selectedDomain, setSelectedDomain] = useState(user?.profile?.mainDomain || "Coding");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(
    user?.profile?.platforms || ["ChatGPT", "Claude"],
  );
  const [selectedStyle, setSelectedStyle] = useState(user?.profile?.responseStyle || "Detailed");

  const progress = (step / 4) * 100;

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter((p) => p !== id) : prev) : [...prev, id],
    );
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      finishOnboarding();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const finishOnboarding = () => {
    completeOnboarding({
      profession: selectedRole,
      mainDomain: selectedDomain,
      platforms: selectedPlatforms,
      responseStyle: selectedStyle,
    });
    toast.success("AI Profile created! Welcome to Tabbed Pro 🎉");
    navigate("/home", { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top Banner Header */}
      <header className="sticky top-0 z-20 border-b border-border glass-panel px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={logoSrc} alt="Tabbed logo" className="size-8 rounded-lg shadow-sm" />
            <span className="font-display font-semibold tracking-tight">
              Tabb<span className="text-primary">ed</span>{" "}
              <span className="text-xs text-muted-foreground ml-1 font-mono">Onboarding</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground font-medium">Step {step} of 4</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={finishOnboarding}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Skip setup
            </Button>
          </div>
        </div>
        <div className="mx-auto max-w-4xl mt-3">
          <Progress value={progress} className="h-1 bg-muted/60" />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-4xl mx-auto w-full">
        {/* Step 1: Role Selection */}
        {step === 1 && (
          <div className="space-y-6 w-full animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="text-center space-y-1.5">
              <h1 className="font-display text-2xl font-bold sm:text-3xl tracking-tight">
                What best describes your role?
              </h1>
              <p className="text-sm text-muted-foreground">
                We&apos;ll tailor your prompt scoring benchmarks and AI optimization parameters.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {ROLES.map((r) => {
                const active = selectedRole === r.id;
                const Icon = r.icon;
                return (
                  <Card
                    key={r.id}
                    onClick={() => setSelectedRole(r.id)}
                    className={cn(
                      "cursor-pointer border transition-all duration-200 hover:border-primary/50 relative overflow-hidden",
                      active
                        ? "border-primary bg-primary/10 shadow-[0_0_20px_-5px_var(--primary)]"
                        : "border-border/60 bg-card/50 hover:bg-card",
                    )}
                  >
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div
                          className={cn(
                            "p-2 rounded-lg",
                            active
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          <Icon className="size-5" />
                        </div>
                        {active && <Check className="size-4 text-primary font-bold" />}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{r.label}</h3>
                        <p className="text-[0.75rem] text-muted-foreground mt-0.5 leading-snug">
                          {r.desc}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Main Domain */}
        {step === 2 && (
          <div className="space-y-6 w-full animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="text-center space-y-1.5">
              <h1 className="font-display text-2xl font-bold sm:text-3xl tracking-tight">
                What do you mainly use AI for?
              </h1>
              <p className="text-sm text-muted-foreground">
                Select your primary usage domain so Tabbed can apply specialized optimization modes.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {DOMAINS.map((d) => {
                const active = selectedDomain === d.id;
                const Icon = d.icon;
                return (
                  <Card
                    key={d.id}
                    onClick={() => setSelectedDomain(d.id)}
                    className={cn(
                      "cursor-pointer border transition-all duration-200 hover:border-primary/50 relative overflow-hidden",
                      active
                        ? "border-primary bg-primary/10 shadow-[0_0_20px_-5px_var(--primary)]"
                        : "border-border/60 bg-card/50 hover:bg-card",
                    )}
                  >
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div
                          className={cn(
                            "p-2 rounded-lg",
                            active
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          <Icon className="size-5" />
                        </div>
                        {active && <Check className="size-4 text-primary font-bold" />}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{d.label}</h3>
                        <p className="text-[0.75rem] text-muted-foreground mt-0.5 leading-snug">
                          {d.desc}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Preferred Platforms */}
        {step === 3 && (
          <div className="space-y-6 w-full animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="text-center space-y-1.5">
              <h1 className="font-display text-2xl font-bold sm:text-3xl tracking-tight">
                Which AI platforms do you use?
              </h1>
              <p className="text-sm text-muted-foreground">
                Select all that apply. Tabbed formats optimized prompts to match model system
                prompts.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {PLATFORMS.map((p) => {
                const active = selectedPlatforms.includes(p.id);
                const Icon = p.icon;
                return (
                  <Card
                    key={p.id}
                    onClick={() => togglePlatform(p.id)}
                    className={cn(
                      "cursor-pointer border transition-all duration-200 hover:border-primary/50 relative overflow-hidden",
                      active
                        ? "border-primary bg-primary/10 shadow-[0_0_20px_-5px_var(--primary)]"
                        : "border-border/60 bg-card/50 hover:bg-card",
                    )}
                  >
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div
                          className={cn(
                            "p-2 rounded-lg",
                            active
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          <Icon className="size-5" />
                        </div>
                        <div className="flex items-center gap-2">
                          {p.badge && (
                            <span className="text-[0.65rem] font-mono px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                              {p.badge}
                            </span>
                          )}
                          {active && <Check className="size-4 text-primary font-bold" />}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{p.label}</h3>
                        <p className="text-[0.75rem] text-muted-foreground mt-0.5 leading-snug">
                          {p.desc}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Output Style Preference */}
        {step === 4 && (
          <div className="space-y-6 w-full animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="text-center space-y-1.5">
              <h1 className="font-display text-2xl font-bold sm:text-3xl tracking-tight">
                Preferred AI Response Style
              </h1>
              <p className="text-sm text-muted-foreground">
                How do you want AI models to structure their outputs by default?
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {STYLES.map((s) => {
                const active = selectedStyle === s.id;
                const Icon = s.icon;
                return (
                  <Card
                    key={s.id}
                    onClick={() => setSelectedStyle(s.id)}
                    className={cn(
                      "cursor-pointer border transition-all duration-200 hover:border-primary/50 relative overflow-hidden",
                      active
                        ? "border-primary bg-primary/10 shadow-[0_0_20px_-5px_var(--primary)]"
                        : "border-border/60 bg-card/50 hover:bg-card",
                    )}
                  >
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div
                          className={cn(
                            "p-2.5 rounded-lg",
                            active
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          <Icon className="size-6" />
                        </div>
                        {active && <Check className="size-5 text-primary font-bold" />}
                      </div>
                      <div>
                        <h3 className="font-semibold text-base">{s.label}</h3>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {s.desc}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="mt-8 flex items-center justify-between w-full pt-4 border-t border-border/40">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
            className="gap-2 border-border/70"
          >
            <ArrowLeft className="size-4" /> Back
          </Button>

          <Button onClick={handleNext} className="gap-2 font-medium px-6">
            {step === 4 ? "Complete Setup & Launch Dashboard" : "Next Step"}
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </main>
    </div>
  );
}

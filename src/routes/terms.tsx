import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Scale,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Sparkles,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import logoSrc from "@/assets/logo.png";

export default function TermsOfService() {
  useEffect(() => {
    document.title = "Terms of Service — Tabbed Pro";
    window.scrollTo(0, 0);
  }, []);

  const lastUpdated = "October 13, 2026";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5">
              <img src={logoSrc} alt="Tabbed logo" className="size-8 rounded-lg" />
              <span className="font-display text-[0.95rem] font-semibold tracking-tight">
                Tabb<span className="text-primary">ed</span>
              </span>
            </Link>
            <Badge
              variant="outline"
              className="hidden sm:inline-flex text-xs border-primary/30 text-primary"
            >
              Legal
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm" className="gap-1.5 text-xs">
              <Link to="/">
                <ArrowLeft className="size-3.5" /> Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        {/* Hero header */}
        <div className="space-y-4 border-b border-border/60 pb-8">
          <Badge variant="outline" className="gap-1.5 border-primary/40 text-primary">
            <Scale className="size-3.5" /> Terms & Service Agreement
          </Badge>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Terms of Service
          </h1>
          <p className="text-sm text-muted-foreground">
            Effective Date: <span className="font-mono text-foreground">{lastUpdated}</span> ·
            Version 2.4
          </p>
          <p className="text-base leading-relaxed text-muted-foreground">
            Please read these Terms of Service carefully before accessing or using the Tabbed Pro
            platform, our browser extension, or related services.
          </p>
        </div>

        {/* Key Highlights Card */}
        <div className="my-8 grid gap-4 sm:grid-cols-3">
          <Card className="border-border/60 bg-card/60 backdrop-blur">
            <CardContent className="p-4 space-y-2">
              <CheckCircle2 className="size-5 text-primary" />
              <h4 className="font-display text-sm font-semibold">Prompt Ownership</h4>
              <p className="text-xs text-muted-foreground">
                You retain complete, exclusive intellectual property ownership of your prompts and
                optimized outputs.
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/60 bg-card/60 backdrop-blur">
            <CardContent className="p-4 space-y-2">
              <CreditCard className="size-5 text-primary" />
              <h4 className="font-display text-sm font-semibold">Transparent Billing</h4>
              <p className="text-xs text-muted-foreground">
                Clear monthly subscription rates with no lock-in. Cancel directly from your billing
                portal at any time.
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/60 bg-card/60 backdrop-blur">
            <CardContent className="p-4 space-y-2">
              <AlertCircle className="size-5 text-primary" />
              <h4 className="font-display text-sm font-semibold">Ethical AI Usage</h4>
              <p className="text-xs text-muted-foreground">
                Use of Tabbed Pro must comply with all applicable laws and third-party foundation
                model acceptable use guidelines.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-10 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground sm:text-2xl">
              1. Acceptance of Terms
            </h2>
            <p>
              By creating an account, installing the Tabbed Chrome Extension, or subscribing to a
              Tabbed Pro membership, you agree to be bound by these Terms of Service
              (&quot;Terms&quot;) and our{" "}
              <Link to="/privacy" className="text-primary hover:underline font-medium">
                Privacy Policy
              </Link>
              . If you do not agree to all terms, you may not access or use our services.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground sm:text-2xl">
              2. Description of Services
            </h2>
            <p>Tabbed Pro provides AI prompt intelligence tools, including:</p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>
                <strong>Live Prompt Optimizer:</strong> Side-by-side prompt transformation engine
                with real-time score streaming.
              </li>
              <li>
                <strong>Prompt Vault:</strong> Searchable repository for storing, categorizing,
                versioning, and managing prompt templates.
              </li>
              <li>
                <strong>Chrome Extension:</strong> Inline prompt quality analysis and rewrite
                suggestions across supported platforms (ChatGPT, Claude, Gemini, Perplexity).
              </li>
              <li>
                <strong>Workspaces & Teams:</strong> Shared prompt repositories, team member access
                controls, and organization-wide AI standards.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground sm:text-2xl">
              3. User Accounts & Responsibilities
            </h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials
              and for all activities that occur under your account. You agree to:
            </p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Provide accurate, current, and complete registration details.</li>
              <li>Notify us immediately of any unauthorized access to your account.</li>
              <li>
                Not use Tabbed Pro to build, generate, or optimize prompts designed to produce
                illegal, abusive, infringing, fraudulent, or harmful outputs.
              </li>
              <li>
                Comply with the terms and acceptable use policies of upstream AI platforms you use
                in tandem with Tabbed.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground sm:text-2xl">
              4. Intellectual Property & Prompt Rights
            </h2>
            <p>
              <strong className="text-foreground">Your Content:</strong> You retain full copyright,
              title, and ownership of all prompts, custom templates, and profile context you create
              or submit. Tabbed Pro does not claim any ownership rights over your intellectual
              property.
            </p>
            <p>
              <strong className="text-foreground">License to Tabbed:</strong> You grant Tabbed Pro a
              worldwide, limited, non-exclusive license solely to process, score, format, and
              display your prompts for the purpose of operating the platform and fulfilling
              requested AI features for you.
            </p>
            <p>
              <strong className="text-foreground">Tabbed IP:</strong> Tabbed Pro software, logos,
              user interfaces, scoring algorithms, and brand assets are the exclusive intellectual
              property of Tabbed Pro and its licensors.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground sm:text-2xl">
              5. AI Output & Disclaimer of Results
            </h2>
            <p>
              Prompt scoring and suggestions are provided through machine learning algorithms and
              LLM analysis:
            </p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>
                Prompt Scores (0–100) are evaluative heuristics intended to help you improve prompt
                structure, context, and clarity.
              </li>
              <li>
                We do not guarantee that an optimized prompt will produce any specific output or
                flawless response from external foundation models.
              </li>
              <li>
                You are solely responsible for reviewing and validating any AI-generated prompts
                before deploying them into critical or production systems.
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground sm:text-2xl">
              6. Subscriptions, Payments & Cancellations
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-foreground">Free Tier:</strong> Free accounts are limited to
                a maximum of 10 saved prompts in the Vault and 7-day analytics history.
              </li>
              <li>
                <strong className="text-foreground">Pro Tier ($12/month):</strong> Includes
                unlimited prompt storage, specialized optimization modes, and full analytics.
              </li>
              <li>
                <strong className="text-foreground">Teams Tier ($29/month):</strong> Includes
                multi-user workspace management, shared templates, and organization AI standards.
              </li>
              <li>
                <strong className="text-foreground">Billing & Renewal:</strong> Subscriptions are
                billed in advance on a recurring monthly basis via Stripe. Your plan will renew
                automatically unless canceled before the renewal date.
              </li>
              <li>
                <strong className="text-foreground">Cancellation & Refunds:</strong> You can cancel
                your subscription at any time via Settings &gt; Billing. Upon cancellation, your
                account retains access until the end of the paid period. We offer a 14-day
                money-back guarantee for first-time paid plan subscribers.
              </li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground sm:text-2xl">
              7. Limitation of Liability
            </h2>
            <p>
              To the fullest extent permitted by law, Tabbed Pro shall not be liable for any
              indirect, incidental, special, consequential, or punitive damages, or any loss of
              profits, data, or goodwill arising from your use of or inability to use the platform.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground sm:text-2xl">
              8. Contact Information
            </h2>
            <p>
              If you have any questions or legal inquiries regarding these Terms of Service, please
              reach out to:
            </p>
            <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 p-3 text-xs sm:text-sm text-foreground">
              <Mail className="size-4 text-primary" />
              <span>
                Email:{" "}
                <a
                  href="mailto:legal@tabbed.pro"
                  className="text-primary hover:underline font-mono"
                >
                  legal@tabbed.pro
                </a>
              </span>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 px-4 py-8 sm:px-6 mt-16">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Tabbed Pro. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <Link to="/pricing" className="hover:text-foreground">
              Pricing
            </Link>
            <Link to="/" className="hover:text-foreground">
              Home
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

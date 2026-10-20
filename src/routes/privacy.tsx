import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Lock, Eye, Database, Cpu, Globe, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import logoSrc from "@/assets/logo.png";

export default function PrivacyPolicy() {
  useEffect(() => {
    document.title = "Privacy Policy — Tabbed Pro";
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
            <ShieldCheck className="size-3.5" /> Data Protection & Privacy
          </Badge>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground">
            Effective Date: <span className="font-mono text-foreground">{lastUpdated}</span> ·
            Version 2.4
          </p>
          <p className="text-base leading-relaxed text-muted-foreground">
            Tabbed Pro (&quot;Tabbed&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is
            committed to protecting your privacy and ensuring you have complete visibility over how
            your prompts, personal data, and AI interactions are handled.
          </p>
        </div>

        {/* Key Highlights Card */}
        <div className="my-8 grid gap-4 sm:grid-cols-3">
          <Card className="border-border/60 bg-card/60 backdrop-blur">
            <CardContent className="p-4 space-y-2">
              <Lock className="size-5 text-primary" />
              <h4 className="font-display text-sm font-semibold">You Own Your Prompts</h4>
              <p className="text-xs text-muted-foreground">
                Your prompts belong exclusively to you. We do not sell or rent your prompt content
                to third parties.
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/60 bg-card/60 backdrop-blur">
            <CardContent className="p-4 space-y-2">
              <Cpu className="size-5 text-primary" />
              <h4 className="font-display text-sm font-semibold">Zero Model Training</h4>
              <p className="text-xs text-muted-foreground">
                Prompts processed via our optimization APIs are not used to train proprietary or
                public foundation models without explicit consent.
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/60 bg-card/60 backdrop-blur">
            <CardContent className="p-4 space-y-2">
              <Eye className="size-5 text-primary" />
              <h4 className="font-display text-sm font-semibold">Full Transparency</h4>
              <p className="text-xs text-muted-foreground">
                Export, backup, or permanently purge your Prompt Vault and profile data at any time
                in Settings.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-10 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground sm:text-2xl">
              1. Information We Collect
            </h2>
            <p>We collect information you provide directly to us when using Tabbed Pro:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                <strong className="text-foreground">Account Information:</strong> Name, email
                address, password hash (salted and encrypted), profile avatar, and team membership
                identifiers.
              </li>
              <li>
                <strong className="text-foreground">AI Profile & Preferences:</strong>{" "}
                Role/profession, technical domains, primary AI platforms used (ChatGPT, Claude,
                Gemini, Perplexity), desired response style, and custom prompt rules.
              </li>
              <li>
                <strong className="text-foreground">Prompts & Vault Data:</strong> Raw input
                prompts, optimized revisions, multi-dimensional score ratings (clarity, specificity,
                context, constraints), prompt categories, and folder organization.
              </li>
              <li>
                <strong className="text-foreground">Billing Information:</strong> Payment details
                are collected directly by our payment processor, Stripe, Inc. We store only customer
                IDs, plan tier status, and billing cycle timestamps. We never store credit card
                numbers.
              </li>
              <li>
                <strong className="text-foreground">Chrome Extension Telemetry:</strong> When using
                the Tabbed browser extension, prompt text selected for evaluation is transmitted to
                provide inline scoring. Extension telemetry includes active platform domain name
                (e.g., chatgpt.com) to provide platform-tuned suggestions.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground sm:text-2xl">
              2. How We Use Your Information
            </h2>
            <p>Your data is used strictly to power and improve your prompt engineering workflow:</p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>
                Generating real-time Prompt Scores (0–100) and identifying missing context or
                constraints.
              </li>
              <li>Executing prompt optimization streaming via Server-Sent Events (SSE).</li>
              <li>Maintaining your cloud Prompt Vault, folder hierarchy, and template library.</li>
              <li>
                Calculating performance trends and historical quality analytics over 7, 30, and
                90-day periods.
              </li>
              <li>Enforcing enterprise AI standards and workspace collaboration policies.</li>
              <li>Processing subscriptions, plan upgrades, and invoice notifications.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground sm:text-2xl">
              3. AI Sub-Processors & Model Providers
            </h2>
            <p>
              To provide state-of-the-art analysis, Tabbed Pro routes prompt evaluation queries
              through vetted AI cloud providers via secure, encrypted API endpoints:
            </p>
            <div className="rounded-xl border border-border/70 bg-card/40 p-4 font-mono text-xs text-foreground space-y-2">
              <p>
                • <strong>OpenAI, LLC:</strong> GPT-4o / GPT-4o-mini evaluation models (Enterprise
                zero-data-retention API policies apply).
              </p>
              <p>
                • <strong>Anthropic, PBC:</strong> Claude 3.5 Sonnet prompt evaluation and
                structuring.
              </p>
              <p>
                • <strong>Google Cloud (Gemini):</strong> Gemini 1.5 Flash evaluation pipelines.
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Note: When using local model mode (Ollama / LM Studio), all prompt computation remains
              100% on your local machine and no external API requests are dispatched.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground sm:text-2xl">
              4. Data Retention, Security & Encryption
            </h2>
            <p>
              We enforce industry-standard security controls to protect your data across our entire
              application infrastructure:
            </p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>
                All web and extension traffic is encrypted in transit using Transport Layer Security
                (TLS 1.3 / HTTPS).
              </li>
              <li>Databases and backups are encrypted at rest using AES-256 bit encryption.</li>
              <li>Authentication tokens are signed using cryptographic JWT keys.</li>
              <li>
                You may request complete and permanent deletion of your account and all associated
                prompts at any time. Upon deletion, data is removed from active databases
                immediately and wiped from backups within 30 days.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground sm:text-2xl">
              5. Your Rights (GDPR & CCPA Compliance)
            </h2>
            <p>
              Regardless of your location, Tabbed Pro honors universal privacy rights for all
              registered users:
            </p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>
                <strong>Right of Access & Portability:</strong> Export all saved prompts, templates,
                and profile settings in JSON or CSV format.
              </li>
              <li>
                <strong>Right to Rectification:</strong> Edit or correct any personal or profile
                information via Account Settings.
              </li>
              <li>
                <strong>Right to Erasure (&quot;Right to be Forgotten&quot;):</strong> Permanently
                delete your account and Prompt Vault data.
              </li>
              <li>
                <strong>Right to Restrict Processing:</strong> Opt out of telemetry or disconnect
                the Chrome Extension at any moment.
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground sm:text-2xl">
              6. Contact & Data Protection Inquiries
            </h2>
            <p>
              If you have any questions about this Privacy Policy, your data, or need to exercise
              your data rights, please contact our privacy team:
            </p>
            <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 p-3 text-xs sm:text-sm text-foreground">
              <Mail className="size-4 text-primary" />
              <span>
                Email:{" "}
                <a
                  href="mailto:privacy@tabbed.pro"
                  className="text-primary hover:underline font-mono"
                >
                  privacy@tabbed.pro
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
            <Link to="/terms" className="hover:text-foreground">
              Terms of Service
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

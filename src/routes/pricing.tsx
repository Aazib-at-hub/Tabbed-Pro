import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Check, Sparkles, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { subscriptionApi } from "@/lib/api-client";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    tier: "free" as const,
    name: "Free",
    price: "$0",
    cadence: "forever",
    blurb: "Learn how your prompts actually score.",
    featured: false,
    features: [
      "Basic prompt scoring",
      "Up to 10 saved prompts in Vault",
      "General optimization mode",
      "7-day analytics history",
      "Chrome extension sync",
    ],
  },
  {
    tier: "pro" as const,
    name: "Tabbed Pro",
    price: "$12",
    cadence: "per month",
    blurb: "The full prompt intelligence layer.",
    featured: true,
    features: [
      "Unlimited saved prompts",
      "Advanced Prompt Intelligence reports",
      "Personal AI Profile injection",
      "All 7 optimization modes",
      "Full analytics & improvement insights",
      "Cloud sync + prompt history",
      "Premium template library",
    ],
  },
  {
    tier: "teams" as const,
    name: "Tabbed Teams",
    price: "$29",
    cadence: "per seat / month",
    blurb: "Standardise how your whole org prompts.",
    featured: false,
    features: [
      "Everything in Pro",
      "Shared Prompt Vault",
      "Team templates & standards",
      "Team analytics & adoption",
      "Roles and permissions",
      "Department workspaces",
    ],
  },
];

export default function Pricing() {
  const [searchParams] = useSearchParams();
  const { user, updateSubscriptionTier } = useAuth();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const currentTier = user?.subscriptionTier || "free";
  const checkoutSuccess = searchParams.get("checkout_success") === "true";
  const urlTier = searchParams.get("tier");

  useEffect(() => {
    document.title = "Pricing — Tabbed Pro";
  }, []);

  useEffect(() => {
    if (checkoutSuccess && (urlTier === "pro" || urlTier === "teams")) {
      updateSubscriptionTier(urlTier as "pro" | "teams", "active");
      if (user?.id) {
        subscriptionApi.simulateTier(user.id, urlTier as "pro" | "teams");
      }
      toast.success(
        `🎉 You're now subscribed to ${urlTier === "teams" ? "Tabbed Teams" : "Tabbed Pro"}!`,
        {
          description: "Unlimited prompts and full optimization capabilities are active.",
        },
      );
    }
  }, [checkoutSuccess, urlTier, user?.id]);

  const handlePlanAction = async (planTier: "free" | "pro" | "teams") => {
    if (!user) {
      toast.error("Please log in to manage your subscription");
      return;
    }

    if (planTier === currentTier) {
      toast.info(`You are already on the ${planTier.toUpperCase()} plan.`);
      return;
    }

    if (planTier === "free") {
      updateSubscriptionTier("free");
      await subscriptionApi.simulateTier(user.id, "free");
      toast.success("Downgraded to Free plan");
      return;
    }

    setLoadingTier(planTier);
    try {
      const res = await subscriptionApi.createCheckoutSession(user.id, planTier);
      if (res.url) {
        if (res.url.startsWith("http")) {
          window.location.href = res.url;
        } else {
          // Simulation fallback
          updateSubscriptionTier(planTier, "active");
          await subscriptionApi.simulateTier(user.id, planTier);
          toast.success(`Upgraded to ${planTier === "teams" ? "Tabbed Teams" : "Tabbed Pro"}!`);
        }
      }
    } catch (e: unknown) {
      const err = e instanceof Error ? e : new Error(String(e));
      toast.error("Checkout failed: " + err.message);
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <AppShell title="Pricing" description="Scale from solo prompting to org-wide AI standards">
      <div className="mx-auto max-w-6xl space-y-8">
        {checkoutSuccess && (
          <div className="flex items-center gap-3 rounded-xl border border-primary/40 bg-primary/10 p-4 text-primary">
            <Sparkles className="size-5 shrink-0" />
            <div>
              <p className="font-semibold">Upgrade Complete</p>
              <p className="text-xs text-muted-foreground">
                Your subscription has been successfully provisioned. Welcome to Tabbed Pro!
              </p>
            </div>
          </div>
        )}

        <div className="text-center">
          <Badge variant="secondary" className="gap-1.5">
            <Sparkles className="size-3 text-primary" /> 14-day Pro trial, no card required
          </Badge>
          <h2 className="mt-3 font-display text-2xl font-semibold sm:text-3xl">
            The intelligence layer for how you communicate with AI
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
            Storage is table stakes. You're paying for the part that tells you why a prompt scored
            42 — and how to make it an 86.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {PLANS.map((plan) => {
            const isCurrent = currentTier === plan.tier;
            return (
              <Card
                key={plan.name}
                className={cn(
                  "elevate relative flex h-full flex-col transition-all",
                  isCurrent && "border-primary/80 ring-1 ring-primary/40",
                  plan.featured && !isCurrent && "border-primary/60 shadow-[var(--shadow-elegant)]",
                )}
              >
                {plan.featured && !isCurrent && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-primary-foreground">
                    Most popular
                  </span>
                )}
                {isCurrent && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-success px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-success-foreground flex items-center gap-1">
                    <ShieldCheck className="size-3" /> Current Plan
                  </span>
                )}
                <CardContent className="flex flex-1 flex-col gap-5 p-6">
                  <div>
                    <p className="font-display text-lg font-semibold">{plan.name}</p>
                    <p className="text-xs text-muted-foreground">{plan.blurb}</p>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-display text-4xl font-semibold">{plan.price}</span>
                    <span className="text-xs text-muted-foreground">{plan.cadence}</span>
                  </div>
                  <ul className="flex-1 space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex gap-2 text-sm">
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                        <span className="text-muted-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={isCurrent ? "outline" : plan.featured ? "default" : "outline"}
                    disabled={loadingTier !== null}
                    onClick={() => handlePlanAction(plan.tier)}
                  >
                    {loadingTier === plan.tier
                      ? "Connecting..."
                      : isCurrent
                        ? "Active Plan"
                        : plan.tier === "free"
                          ? "Downgrade to Free"
                          : `Get ${plan.name}`}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center pt-4">
          <p className="text-xs text-muted-foreground">
            Need custom invoicing, team procurement, or enterprise SLA?{" "}
            <Link to="/settings/billing" className="text-primary hover:underline font-medium">
              Manage billing settings
            </Link>{" "}
            or contact enterprise support.
          </p>
        </div>
      </div>
    </AppShell>
  );
}

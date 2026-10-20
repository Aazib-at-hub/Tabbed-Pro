import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Check,
  CreditCard,
  ExternalLink,
  Sparkles,
  Zap,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Clock,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth-context";
import { subscriptionApi, type SubscriptionStatus } from "@/lib/api-client";
import { cn } from "@/lib/utils";

const BILLING_PLANS = [
  {
    tier: "free" as const,
    name: "Free",
    price: "$0",
    cadence: "forever",
    description: "Personal AI prompt testing and basic heuristics.",
    maxPrompts: 10,
    features: [
      "Up to 10 saved prompts",
      "Basic 8-dimension prompt scoring",
      "General optimization mode only",
      "7-day prompt history",
      "Chrome extension sync",
    ],
  },
  {
    tier: "pro" as const,
    name: "Tabbed Pro",
    price: "$12",
    cadence: "per month",
    description: "The complete prompt intelligence and cloud vault layer.",
    maxPrompts: Infinity,
    features: [
      "Unlimited saved prompts in Vault",
      "All 7 AI optimization modes",
      "Personal AI Profile contextual injection",
      "Real-time token streaming optimization",
      "Chrome extension inline floating score",
      "Full analytics & prompt radar charts",
      "Priority API response speed",
    ],
  },
  {
    tier: "teams" as const,
    name: "Tabbed Teams",
    price: "$29",
    cadence: "per seat / month",
    description: "Organizational prompt standards, shared vaults, and collaboration.",
    maxPrompts: Infinity,
    features: [
      "Everything in Tabbed Pro",
      "Shared Team Prompt Vault",
      "Company-wide prompt standards & guardrails",
      "Role-based access (Admin, Editor, Viewer)",
      "Team prompt adoption analytics",
      "Centralized invoicing & seat management",
    ],
  },
];

const MOCK_INVOICES = [
  { id: "INV-2026-003", date: "Oct 1, 2026", amount: "$12.00", status: "Paid", pdf: "#" },
  { id: "INV-2026-002", date: "Sep 1, 2026", amount: "$12.00", status: "Paid", pdf: "#" },
  { id: "INV-2026-001", date: "Aug 1, 2026", amount: "$12.00", status: "Paid", pdf: "#" },
];

export default function BillingSettings() {
  const [searchParams] = useSearchParams();
  const { user, updateSubscriptionTier } = useAuth();
  const [subStatus, setSubStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  const currentTier = user?.subscriptionTier || "free";
  const checkoutSuccess = searchParams.get("checkout_success") === "true";
  const urlTier = searchParams.get("tier");

  useEffect(() => {
    document.title = "Billing & Subscription — Tabbed Pro";
  }, []);

  // Handle redirect from checkout
  useEffect(() => {
    if (checkoutSuccess && (urlTier === "pro" || urlTier === "teams")) {
      updateSubscriptionTier(urlTier as "pro" | "teams", "active");
      if (user?.id) {
        subscriptionApi.simulateTier(user.id, urlTier as "pro" | "teams");
      }
      toast.success(`🎉 Upgraded to ${urlTier === "teams" ? "Tabbed Teams" : "Tabbed Pro"}!`, {
        description: "Your subscription is now active with unlimited vault access.",
      });
    }
  }, [checkoutSuccess, urlTier, user?.id]);

  // Load status
  useEffect(() => {
    if (user?.id) {
      subscriptionApi.getStatus(user.id).then((status) => {
        setSubStatus(status);
      });
    }
  }, [user?.id, currentTier]);

  const handleCheckout = async (targetTier: "pro" | "teams") => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await subscriptionApi.createCheckoutSession(user.id, targetTier);
      if (res.url) {
        if (res.url.startsWith("http")) {
          window.location.href = res.url;
        } else {
          // Internal simulation redirect
          updateSubscriptionTier(targetTier, "active");
          await subscriptionApi.simulateTier(user.id, targetTier);
          toast.success(`Upgraded to ${targetTier === "teams" ? "Teams" : "Pro"}!`);
        }
      }
    } catch (e: unknown) {
      const err = e instanceof Error ? e : new Error(String(e));
      toast.error("Checkout failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPortal = async () => {
    if (!user) return;
    setPortalLoading(true);
    try {
      const res = await subscriptionApi.createPortalSession(user.id);
      if (res.url.startsWith("http")) {
        window.location.href = res.url;
      } else {
        toast.info("Stripe Customer Portal", {
          description:
            "In production, this opens Stripe's hosted invoice and card management portal.",
        });
      }
    } catch (e: unknown) {
      const err = e instanceof Error ? e : new Error(String(e));
      toast.error("Could not load billing portal: " + err.message);
    } finally {
      setPortalLoading(false);
    }
  };

  const handleDevTierSwitch = async (tier: "free" | "pro" | "teams") => {
    if (!user) return;
    updateSubscriptionTier(tier);
    await subscriptionApi.simulateTier(user.id, tier);
    toast.success(`Dev Switch: Tier set to ${tier.toUpperCase()}`);
  };

  const promptCount = subStatus?.promptCount ?? 5;
  const maxPrompts = currentTier === "free" ? 10 : Infinity;
  const usagePct =
    currentTier === "free" ? Math.min(100, Math.round((promptCount / 10) * 100)) : 100;

  return (
    <AppShell
      title="Billing & Plans"
      description="Manage subscription tiers, payment details, and prompt limits"
    >
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Banner for checkout success */}
        {checkoutSuccess && (
          <div className="flex items-center justify-between rounded-xl border border-primary/40 bg-primary/10 p-4 text-primary">
            <div className="flex items-center gap-3">
              <Sparkles className="size-5 shrink-0" />
              <div>
                <p className="font-semibold">Subscription Active</p>
                <p className="text-xs text-muted-foreground">
                  Thank you for subscribing. Unlimited prompt limits and all intelligence modes are
                  unlocked.
                </p>
              </div>
            </div>
            <Badge variant="default">Active</Badge>
          </div>
        )}

        {/* Current Plan Overview Card */}
        <Card className="elevate">
          <CardHeader className="flex flex-row items-start justify-between pb-4">
            <div>
              <div className="flex items-center gap-2.5">
                <CardTitle className="text-xl font-bold">Current Subscription</CardTitle>
                <Badge
                  variant={currentTier === "free" ? "secondary" : "default"}
                  className="font-medium capitalize"
                >
                  {currentTier} Plan
                </Badge>
                <Badge variant="outline" className="text-xs text-success border-success/40">
                  <ShieldCheck className="mr-1 size-3" /> Active
                </Badge>
              </div>
              <CardDescription className="mt-1">
                {currentTier === "free"
                  ? "You are on the Free tier. Upgrade to unlock unlimited storage and advanced AI optimization."
                  : `Billed monthly via Stripe. Next renewal date is November 1, 2026.`}
              </CardDescription>
            </div>
            {currentTier !== "free" && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenPortal}
                disabled={portalLoading}
                className="gap-1.5"
              >
                <CreditCard className="size-3.5" />
                Manage in Stripe
                <ExternalLink className="size-3" />
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Prompt Storage Quota Meter */}
            <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium flex items-center gap-2">
                  <Layers className="size-4 text-primary" />
                  Prompt Vault Quota
                </span>
                <span className="text-xs text-muted-foreground">
                  {currentTier === "free" ? (
                    <strong>{promptCount} of 10 prompts used</strong>
                  ) : (
                    <strong className="text-primary font-semibold">
                      Unlimited prompts ({promptCount} stored)
                    </strong>
                  )}
                </span>
              </div>
              <Progress value={usagePct} className="mt-3 h-2" />
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                {currentTier === "free" ? (
                  <>
                    <span>
                      {10 - promptCount > 0 ? `${10 - promptCount} remaining` : "Limit reached"}
                    </span>
                    <span>10 max limit</span>
                  </>
                ) : (
                  <>
                    <span className="text-success flex items-center gap-1">
                      <Check className="size-3" /> No storage ceiling
                    </span>
                    <span>Pro & Teams feature</span>
                  </>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="size-3.5" />
                <span>
                  {currentTier === "free"
                    ? "Upgrade anytime to keep all existing prompts."
                    : "Cancel or modify your plan anytime with no penalties."}
                </span>
              </div>

              {currentTier === "free" ? (
                <Button onClick={() => handleCheckout("pro")} disabled={loading} className="gap-2">
                  <Sparkles className="size-4" /> Upgrade to Pro ($12/mo)
                </Button>
              ) : (
                <Button variant="outline" size="sm" asChild>
                  <Link to="/pricing">View All Plans</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Plan Tiers Grid */}
        <div>
          <h3 className="mb-4 text-lg font-semibold">Available Subscription Plans</h3>
          <div className="grid gap-5 md:grid-cols-3">
            {BILLING_PLANS.map((plan) => {
              const isCurrent = currentTier === plan.tier;
              return (
                <Card
                  key={plan.tier}
                  className={cn(
                    "flex flex-col relative transition-all duration-200",
                    isCurrent && "border-primary shadow-sm bg-primary/[0.02]",
                    plan.tier === "pro" && !isCurrent && "border-border hover:border-primary/50",
                  )}
                >
                  {plan.tier === "pro" && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-primary-foreground">
                      Most Popular
                    </span>
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-bold">{plan.name}</CardTitle>
                      {isCurrent && (
                        <Badge variant="secondary" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-xs min-h-[32px]">
                      {plan.description}
                    </CardDescription>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold">{plan.price}</span>
                      <span className="text-xs text-muted-foreground">/{plan.cadence}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col justify-between gap-5 pt-0">
                    <ul className="space-y-2 text-xs">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div>
                      {isCurrent ? (
                        <Button variant="outline" className="w-full" disabled>
                          Active Plan
                        </Button>
                      ) : plan.tier === "free" ? (
                        <Button
                          variant="ghost"
                          className="w-full text-xs text-muted-foreground"
                          onClick={() => handleDevTierSwitch("free")}
                        >
                          Downgrade to Free
                        </Button>
                      ) : (
                        <Button
                          variant={plan.tier === "pro" ? "default" : "outline"}
                          className="w-full"
                          onClick={() => handleCheckout(plan.tier)}
                          disabled={loading}
                        >
                          {plan.tier === "pro" ? "Upgrade to Pro" : "Upgrade to Teams"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Invoice History */}
        {currentTier !== "free" && (
          <Card className="elevate">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Payment History & Invoices</CardTitle>
              <CardDescription>Download tax invoices generated through Stripe.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border/60">
                {MOCK_INVOICES.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between py-3 text-sm">
                    <div>
                      <p className="font-medium">{inv.id}</p>
                      <p className="text-xs text-muted-foreground">{inv.date}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono">{inv.amount}</span>
                      <Badge variant="outline" className="text-xs text-success border-success/40">
                        {inv.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-primary"
                        onClick={() => toast.info(`Downloading invoice ${inv.id}`)}
                      >
                        PDF
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Developer Sandbox Plan Switcher */}
        <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="size-4 text-warning" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Developer Test Sandbox
              </span>
            </div>
            <span className="text-[0.7rem] text-muted-foreground">Instant local tier toggle</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Switch your subscription tier on-the-fly to test prompt limit enforcement (10 prompt cap
            on Free) and feature gates.
          </p>
          <div className="mt-3 flex gap-2">
            <Button
              variant={currentTier === "free" ? "default" : "outline"}
              size="sm"
              className="text-xs"
              onClick={() => handleDevTierSwitch("free")}
            >
              Simulate Free (10 Cap)
            </Button>
            <Button
              variant={currentTier === "pro" ? "default" : "outline"}
              size="sm"
              className="text-xs"
              onClick={() => handleDevTierSwitch("pro")}
            >
              Simulate Pro (Unlimited)
            </Button>
            <Button
              variant={currentTier === "teams" ? "default" : "outline"}
              size="sm"
              className="text-xs"
              onClick={() => handleDevTierSwitch("teams")}
            >
              Simulate Teams
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

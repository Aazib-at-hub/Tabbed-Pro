/**
 * stripe.ts — Stripe Payments & Subscription Integration
 *
 * Handles:
 * 1. Stripe Checkout session creation for Pro & Teams tiers
 * 2. Stripe Customer Billing Portal session creation
 * 3. Webhook listener for subscription lifecycle events:
 *    - checkout.session.completed
 *    - customer.subscription.updated
 *    - customer.subscription.deleted
 *    - invoice.payment_failed
 * 4. Plan limits and feature entitlement checks
 */

import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export const stripe = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2025-02-24.acacia" as Stripe.LatestApiVersion,
      typescript: true,
    })
  : null;

export const PLAN_CONFIG = {
  free: {
    tier: "free" as const,
    name: "Free",
    priceUsd: 0,
    maxSavedPrompts: 10,
    allowedModes: ["general"],
    analyticsDays: 7,
    supportLevel: "community",
  },
  pro: {
    tier: "pro" as const,
    name: "Tabbed Pro",
    priceUsd: 12,
    priceId: process.env.STRIPE_PRO_PRICE_ID || "price_tabbed_pro_monthly",
    maxSavedPrompts: Infinity,
    allowedModes: [
      "general",
      "coding",
      "marketing",
      "research",
      "creative",
      "analysis",
      "executive",
    ],
    analyticsDays: Infinity,
    supportLevel: "priority",
  },
  teams: {
    tier: "teams" as const,
    name: "Tabbed Teams",
    priceUsd: 29,
    priceId: process.env.STRIPE_TEAMS_PRICE_ID || "price_tabbed_teams_monthly",
    maxSavedPrompts: Infinity,
    allowedModes: [
      "general",
      "coding",
      "marketing",
      "research",
      "creative",
      "analysis",
      "executive",
    ],
    analyticsDays: Infinity,
    supportLevel: "dedicated",
  },
};

export type SubscriptionTier = keyof typeof PLAN_CONFIG;

export interface CheckoutOptions {
  userId: string;
  userEmail?: string;
  tier: "pro" | "teams";
  returnUrl: string;
}

/**
 * Create Stripe Checkout Session or generate simulated session in test mode
 */
export async function createCheckoutSession(
  opts: CheckoutOptions,
): Promise<{ url: string; sessionId: string }> {
  const { userId, userEmail, tier, returnUrl } = opts;
  const plan = PLAN_CONFIG[tier];

  if (!plan) {
    throw new Error(`Invalid subscription tier: ${tier}`);
  }

  if (stripe && STRIPE_SECRET_KEY) {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: userEmail,
      client_reference_id: userId,
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        tier,
      },
      subscription_data: {
        metadata: {
          userId,
          tier,
        },
      },
      success_url: `${returnUrl}?checkout_success=true&session_id={CHECKOUT_SESSION_ID}&tier=${tier}`,
      cancel_url: `${returnUrl}?checkout_canceled=true`,
    });

    return {
      url: session.url ?? `${returnUrl}?checkout_success=true&tier=${tier}`,
      sessionId: session.id,
    };
  }

  // Dev simulation mode
  const mockSessionId = `cs_sim_${Date.now()}_${tier}`;
  const redirectUrl = `${returnUrl}?checkout_success=true&session_id=${mockSessionId}&tier=${tier}`;
  return {
    url: redirectUrl,
    sessionId: mockSessionId,
  };
}

/**
 * Create Stripe Customer Portal Session for billing & invoice management
 */
export async function createPortalSession(
  customerId?: string,
  returnUrl?: string,
): Promise<{ url: string }> {
  const fallbackUrl = returnUrl || "http://localhost:3000/settings/billing";

  if (stripe && STRIPE_SECRET_KEY && customerId) {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: fallbackUrl,
    });
    return { url: portalSession.url };
  }

  // Dev simulation mode
  return {
    url: `${fallbackUrl}?portal_simulated=true`,
  };
}

/**
 * Verify and construct incoming Stripe Webhook event
 */
export function constructWebhookEvent(payload: string | Buffer, signature: string): Stripe.Event {
  if (!stripe || !STRIPE_WEBHOOK_SECRET) {
    throw new Error("Stripe secret or webhook secret is not configured");
  }
  return stripe.webhooks.constructEvent(payload, signature, STRIPE_WEBHOOK_SECRET);
}

/**
 * Webhook event handler to sync subscription state to database
 */
export async function handleWebhookEvent(
  event: Stripe.Event,
): Promise<{ handled: boolean; action?: string; userId?: string }> {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId || session.client_reference_id;
      const tier = (session.metadata?.tier as SubscriptionTier) || "pro";
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      console.log(`[Stripe Webhook] Checkout completed for user ${userId} -> tier ${tier}`);
      // In production Prisma:
      // await db.user.update({
      //   where: { id: userId },
      //   data: { subscriptionTier: tier, subscriptionStatus: "active", stripeCustomerId: customerId, stripeSubscriptionId: subscriptionId }
      // });
      return { handled: true, action: "checkout_completed", userId: userId ?? undefined };
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription & {
        current_period_end?: number;
      };
      const userId = subscription.metadata?.userId;
      const status = subscription.status; // active, past_due, canceled, trialing
      const currentPeriodEnd = subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : undefined;

      console.log(`[Stripe Webhook] Subscription updated for user ${userId}: status ${status}`);
      // In production Prisma:
      // await db.user.updateMany({
      //   where: { stripeSubscriptionId: subscription.id },
      //   data: { subscriptionStatus: status, currentPeriodEnd }
      // });
      return { handled: true, action: "subscription_updated", userId };
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;

      console.log(
        `[Stripe Webhook] Subscription canceled for user ${userId} -> reverting to free tier`,
      );
      // In production Prisma:
      // await db.user.updateMany({
      //   where: { stripeSubscriptionId: subscription.id },
      //   data: { subscriptionTier: "free", subscriptionStatus: "canceled" }
      // });
      return { handled: true, action: "subscription_canceled", userId };
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;
      console.warn(`[Stripe Webhook] Invoice payment failed for customer ${customerId}`);
      // In production: mark user as past_due
      return { handled: true, action: "payment_failed" };
    }

    default:
      return { handled: false };
  }
}

/**
 * Check if a user tier is permitted to save new prompts (plan limit enforcement)
 */
export function checkPromptLimit(
  tier: SubscriptionTier,
  currentPromptCount: number,
): { allowed: boolean; max: number; current: number; error?: string } {
  const plan = PLAN_CONFIG[tier] || PLAN_CONFIG.free;
  const allowed = currentPromptCount < plan.maxSavedPrompts;
  return {
    allowed,
    max: plan.maxSavedPrompts,
    current: currentPromptCount,
    error: allowed
      ? undefined
      : `Free plan limit reached (${plan.maxSavedPrompts} prompts max). Upgrade to Pro for unlimited prompts.`,
  };
}

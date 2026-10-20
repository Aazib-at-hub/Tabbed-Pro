/**
 * Central copy registry for Tabbed.
 * Every user-facing marketing string lives here so variants can be swapped
 * for A/B experiments without touching components.
 */

export const HERO_HEADLINES = {
  a: "AI understands you better with Tabbed.",
  b: "Stop engineering prompts. Start talking to AI.",
  c: "Turn what you mean into what AI understands.",
  d: "Better prompts. Better context. Better AI.",
} as const;

export const CTA_LABELS = {
  a: "Try Tabbed Free",
  b: "Improve My Prompt",
  c: "Make AI Understand",
} as const;

/** Active variants. Change these two lines to run an experiment. */
export const ACTIVE_HERO: keyof typeof HERO_HEADLINES = "a";
export const ACTIVE_CTA: keyof typeof CTA_LABELS = "a";

export const COPY = {
  brand: "Tabbed",
  brandSuffix: "",
  positioning: "The layer between you and AI.",
  heroHeadline: HERO_HEADLINES[ACTIVE_HERO],
  heroSub:
    "Tabbed turns your rough ideas and everyday instructions into clear, contextual, high-performing AI instructions — automatically.",
  primaryCta: CTA_LABELS[ACTIVE_CTA],
  secondaryCta: "See How It Works",
  composerPlaceholder: "Tell AI what you want to accomplish...",
  composerAction: "Improve with Tabbed",
  problem: "AI isn't the problem. The way we communicate with it is.",
  agitation:
    "You rewrite prompts. Add context. Explain yourself again. Copy old instructions. And still wonder why one conversation works while another doesn't.",
  solution:
    "Tabbed sits between you and AI, turning rough intent into clear, contextual instructions designed to produce better results.",
  vaultTagline: "Your AI memory.",
} as const;

export const ROTATING_EXAMPLES = [
  "Analyze this research paper...",
  "Review this code...",
  "Create a marketing strategy...",
  "Explain this concept...",
  "Turn these notes into a presentation...",
  "Research my competitors...",
] as const;

export const TRANSFORM_STEPS = [
  "Understand intent",
  "Add context",
  "Improve instructions",
  "Optimize for AI",
] as const;

export const MODELS = ["ChatGPT", "Claude", "Gemini", "Perplexity"] as const;

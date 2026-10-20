export type ScoreBreakdown = {
  clarity: number;
  context: number;
  specificity: number;
  constraints: number;
  role: number;
  outputFormat: number;
  examples: number;
  completeness: number;
};

export type PromptRecord = {
  id: string;
  title: string;
  category: Category;
  tags: string[];
  platform: Platform;
  createdAt: string;
  favorite: boolean;
  originalPrompt: string;
  optimizedPrompt: string;
  originalScore: number;
  optimizedScore: number;
  breakdown: ScoreBreakdown;
  missing: string[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
};

export type Category =
  "Coding" | "Marketing" | "Research" | "Business" | "Content Creation" | "Learning" | "Personal";

export type Platform = "ChatGPT" | "Claude" | "Gemini" | "Perplexity";

export const CATEGORIES: Category[] = [
  "Coding",
  "Marketing",
  "Research",
  "Business",
  "Content Creation",
  "Learning",
  "Personal",
];

export const PLATFORMS: Platform[] = ["ChatGPT", "Claude", "Gemini", "Perplexity"];

export const SCORE_DIMENSIONS: { key: keyof ScoreBreakdown; label: string; hint: string }[] = [
  { key: "clarity", label: "Clarity", hint: "Is the ask unambiguous?" },
  { key: "context", label: "Context", hint: "Does the model know your situation?" },
  { key: "specificity", label: "Specificity", hint: "Are details concrete enough?" },
  { key: "constraints", label: "Constraints", hint: "Limits, scope, do-nots." },
  { key: "role", label: "Role Definition", hint: "Who should the model act as?" },
  { key: "outputFormat", label: "Output Format", hint: "Shape of the answer." },
  { key: "examples", label: "Examples", hint: "Few-shot guidance." },
  { key: "completeness", label: "Completeness", hint: "Nothing important left out." },
];

const mk = (
  id: string,
  title: string,
  category: Category,
  platform: Platform,
  createdAt: string,
  originalScore: number,
  optimizedScore: number,
  breakdown: ScoreBreakdown,
  tags: string[],
  originalPrompt: string,
  optimizedPrompt: string,
  missing: string[],
  favorite = false,
): PromptRecord => ({
  id,
  title,
  category,
  platform,
  createdAt,
  originalScore,
  optimizedScore,
  breakdown,
  tags,
  originalPrompt,
  optimizedPrompt,
  missing,
  favorite,
  strengths: ["Clear primary objective", "Reasonable scope for one response"],
  weaknesses: missing.slice(0, 2).map((m) => `No ${m.toLowerCase()} provided`),
  recommendations: [
    "State the role the model should take before the task.",
    "Declare the exact output format you want back.",
    "Add one worked example so tone and depth are anchored.",
  ],
});

export const PROMPTS: PromptRecord[] = [
  mk(
    "p-1",
    "Build SaaS Landing Page",
    "Coding",
    "ChatGPT",
    "2026-08-19T08:10:00Z",
    42,
    86,
    {
      clarity: 90,
      context: 65,
      specificity: 70,
      constraints: 30,
      role: 80,
      outputFormat: 45,
      examples: 35,
      completeness: 68,
    },
    ["react", "tailwind", "landing"],
    "make me a landing page for my saas product with a hero and pricing",
    `You are a senior front-end engineer specialising in conversion-focused SaaS marketing sites.

CONTEXT
- Product: Tabbed, an AI prompt intelligence platform for developers and marketers.
- Stack: React 19, TypeScript, Tailwind CSS, shadcn/ui.

TASK
Produce a single-page landing layout with: hero, social proof strip, three-column feature grid, prompt-score demo section, pricing (Free / Pro / Teams), FAQ, footer CTA.

CONSTRAINTS
- No inline hex colours; use semantic design tokens only.
- Fully responsive from 360px to 1440px.
- Accessible: semantic landmarks, one h1, alt text on all imagery.

OUTPUT FORMAT
1. Short layout rationale (max 5 bullets)
2. Complete component code in a single fenced block
3. A list of the design tokens you introduced`,
    ["Constraints", "Output format", "Examples"],
    true,
  ),
  mk(
    "p-2",
    "Q3 Email Campaign Sequence",
    "Marketing",
    "Claude",
    "2026-08-18T15:42:00Z",
    51,
    89,
    {
      clarity: 82,
      context: 74,
      specificity: 66,
      constraints: 48,
      role: 70,
      outputFormat: 58,
      examples: 40,
      completeness: 72,
    },
    ["email", "lifecycle", "b2b"],
    "write me 5 marketing emails for our new product launch",
    `Act as a B2B lifecycle marketer with 10 years of PLG SaaS experience.

AUDIENCE: engineering managers at 20-200 person startups already using AI tools daily.
GOAL: convert free users to Pro within a 14-day window.

Write a 5-email sequence (day 0, 2, 5, 9, 13). For each email return: subject line (max 42 chars), preview text, body under 140 words, single CTA, and the behavioural trigger that should send it.

Tone: direct, technical, zero hype. No exclamation marks.
Return as a markdown table followed by full email bodies.`,
    ["Audience definition", "Output format", "Tone constraints"],
  ),
  mk(
    "p-3",
    "Literature Review: LLM Evaluation",
    "Research",
    "Perplexity",
    "2026-08-17T09:20:00Z",
    58,
    91,
    {
      clarity: 88,
      context: 80,
      specificity: 76,
      constraints: 62,
      role: 66,
      outputFormat: 70,
      examples: 44,
      completeness: 78,
    },
    ["papers", "eval", "survey"],
    "summarize research on evaluating large language models",
    `You are a research assistant preparing a literature review for a graduate seminar.

SCOPE: peer-reviewed work on LLM evaluation methodology published 2022-2026, focused on benchmark contamination, human preference alignment, and task-specific rubrics.

For each of 8 key papers provide: citation, core contribution, methodology, limitations, and how it relates to the others.
Finish with a synthesis of open problems and 3 candidate research questions.

Cite every claim with a source link. Say "insufficient evidence" rather than speculating.`,
    ["Time scope", "Citation requirement", "Synthesis instruction"],
    true,
  ),
  mk(
    "p-4",
    "Competitor Teardown Framework",
    "Business",
    "ChatGPT",
    "2026-08-15T11:05:00Z",
    39,
    83,
    {
      clarity: 70,
      context: 55,
      specificity: 60,
      constraints: 35,
      role: 62,
      outputFormat: 40,
      examples: 30,
      completeness: 58,
    },
    ["strategy", "gtm"],
    "analyse my competitors",
    `Act as a product strategist running a competitive teardown.

Analyse these three competitors: Grammarly, PromptLayer, and Notion AI, from the perspective of Tabbed (AI prompt intelligence, prosumer pricing).

For each: positioning statement, ICP, pricing model, three strengths, three exploitable gaps, and the wedge Tabbed could use.
Close with a 2x2 positioning map described in text and a recommended differentiation thesis in under 80 words.`,
    ["Named competitors", "Evaluation criteria", "Output format"],
  ),
  mk(
    "p-5",
    "YouTube Script: Prompt Engineering",
    "Content Creation",
    "Gemini",
    "2026-08-13T17:30:00Z",
    47,
    88,
    {
      clarity: 78,
      context: 60,
      specificity: 64,
      constraints: 42,
      role: 74,
      outputFormat: 52,
      examples: 38,
      completeness: 66,
    },
    ["youtube", "script", "education"],
    "write a youtube script about prompt engineering",
    `You are a YouTube scriptwriter for a technical channel (avg. 8-minute videos, developer audience, 60% retention target).

Write a script titled "Why your prompts score 42/100".
Structure: cold open hook (under 15s), problem framing, three concrete failure modes with before/after prompt examples, the fix framework, CTA.

Include timestamps, on-screen text cues, and B-roll suggestions in a separate column.
Conversational but precise. No filler intros.`,
    ["Audience", "Length target", "Structure"],
  ),
  mk(
    "p-6",
    "Explain Vector Databases",
    "Learning",
    "Claude",
    "2026-08-10T07:55:00Z",
    55,
    84,
    {
      clarity: 84,
      context: 62,
      specificity: 58,
      constraints: 50,
      role: 68,
      outputFormat: 60,
      examples: 46,
      completeness: 64,
    },
    ["study", "ai-infra"],
    "explain vector databases to me",
    `Teach me vector databases as if I am an intermediate full-stack developer who knows Postgres well but has never used embeddings.

Use the Postgres analogy throughout. Cover: what an embedding is, how similarity search works, index types (HNSW vs IVF), when a dedicated vector DB beats pgvector, and cost trade-offs.

Format: concept -> analogy -> minimal code snippet -> common mistake.
End with a 5-question self-check quiz (answers hidden below a divider).`,
    ["Prior knowledge level", "Analogy anchor", "Self-check"],
  ),
  mk(
    "p-7",
    "Refactor Legacy Auth Module",
    "Coding",
    "ChatGPT",
    "2026-08-08T13:12:00Z",
    44,
    87,
    {
      clarity: 76,
      context: 58,
      specificity: 62,
      constraints: 38,
      role: 72,
      outputFormat: 48,
      examples: 34,
      completeness: 60,
    },
    ["refactor", "security", "node"],
    "help me refactor my auth code its messy",
    `You are a staff engineer performing a security-sensitive refactor review.

CONTEXT: Node 22 + Express service, session cookies, ~900 LOC auth module, 4 years of accumulated patches, no tests.

Propose a refactor plan that: preserves existing public behaviour, introduces testable seams first, isolates token handling, and can ship in 4 increments behind a flag.

For each increment: goal, files touched, risk level, rollback plan, and the tests to write before touching code.
Do not rewrite everything at once. Flag any change that alters session semantics.`,
    ["Codebase context", "Risk constraints", "Increment format"],
  ),
  mk(
    "p-8",
    "Weekly Planning Ritual",
    "Personal",
    "ChatGPT",
    "2026-08-05T06:40:00Z",
    36,
    79,
    {
      clarity: 68,
      context: 48,
      specificity: 52,
      constraints: 30,
      role: 58,
      outputFormat: 44,
      examples: 28,
      completeness: 50,
    },
    ["productivity"],
    "help me plan my week",
    `Act as an executive coach running a Sunday planning session.

Ask me for: this week's three outcomes, standing commitments, and current energy level (1-5). Wait for my answers before planning.

Then produce a time-blocked week (Mon-Fri, 9:00-18:00) that protects two 3-hour deep-work blocks, batches shallow work, and leaves 20% slack.
Return as a table plus a short "what to drop if the week slips" list.`,
    ["Interaction protocol", "Constraints", "Output format"],
  ),
];

export const FOLDERS = [
  { id: "f-1", name: "Coding", emoji: "💻", count: 62 },
  { id: "f-2", name: "Marketing", emoji: "📣", count: 41 },
  { id: "f-3", name: "Research", emoji: "🔬", count: 38 },
  { id: "f-4", name: "Business", emoji: "📊", count: 29 },
  { id: "f-5", name: "Content Creation", emoji: "🎬", count: 47 },
  { id: "f-6", name: "Personal", emoji: "🌱", count: 30 },
];

export const SCORE_TREND = [
  { date: "Jul 21", score: 54, prompts: 9 },
  { date: "Jul 25", score: 57, prompts: 12 },
  { date: "Jul 29", score: 59, prompts: 8 },
  { date: "Aug 02", score: 63, prompts: 15 },
  { date: "Aug 06", score: 62, prompts: 11 },
  { date: "Aug 10", score: 67, prompts: 18 },
  { date: "Aug 14", score: 70, prompts: 14 },
  { date: "Aug 18", score: 72, prompts: 21 },
];

export const CATEGORY_USAGE = [
  { category: "Coding", value: 62 },
  { category: "Content", value: 47 },
  { category: "Marketing", value: 41 },
  { category: "Research", value: 38 },
  { category: "Business", value: 29 },
  { category: "Personal", value: 30 },
];

export const DIMENSION_AVERAGES = SCORE_DIMENSIONS.map((d, i) => ({
  dimension: d.label,
  score: [86, 71, 68, 41, 77, 52, 44, 66][i] ?? 60,
}));

export const TEMPLATES = [
  {
    id: "t-1",
    title: "Production Bug Triage",
    description:
      "Turn a vague incident report into a structured debugging brief with repro steps and hypotheses.",
    category: "Coding",
    score: 94,
    uses: 12840,
    preview:
      "You are an on-call staff engineer. Given the incident details below, produce a triage brief: impact, suspected blast radius, top 3 hypotheses ranked by likelihood...",
  },
  {
    id: "t-2",
    title: "SEO Content Brief",
    description:
      "Generates a search-intent-aligned outline with entities, internal links and word budgets.",
    category: "Marketing",
    score: 91,
    uses: 9310,
    preview:
      "Act as an SEO content strategist. For the target keyword below, map the dominant search intent, list must-cover entities...",
  },
  {
    id: "t-3",
    title: "Investor Update Draft",
    description: "Monthly update in the standard metrics-first format investors actually read.",
    category: "Business",
    score: 89,
    uses: 4120,
    preview:
      "You are a startup founder writing a monthly investor update. Use this structure: TL;DR, metrics table, wins, lowlights, asks...",
  },
  {
    id: "t-4",
    title: "Systematic Literature Scan",
    description: "Sourced, citation-enforced research sweep with an explicit uncertainty policy.",
    category: "Research",
    score: 93,
    uses: 6702,
    preview:
      "You are a research assistant. Scope the search to peer-reviewed work from the last 4 years. Cite every claim...",
  },
  {
    id: "t-5",
    title: "Concept → Mastery Tutor",
    description:
      "Adaptive teaching loop with analogies, checks for understanding and spaced review.",
    category: "Education",
    score: 90,
    uses: 15230,
    preview:
      "Teach me the concept below. First assess my level with 3 questions, then teach concept -> analogy -> example -> misconception...",
  },
  {
    id: "t-6",
    title: "Short-Form Video Hook Lab",
    description: "Ten scroll-stopping hooks scored against retention heuristics.",
    category: "Content Creation",
    score: 88,
    uses: 20180,
    preview:
      "You are a short-form video strategist. Generate 10 hooks under 12 words for the topic below, each with the psychological lever used...",
  },
  {
    id: "t-7",
    title: "Meeting → Decisions",
    description: "Compress raw notes into decisions, owners and dated next actions.",
    category: "Productivity",
    score: 87,
    uses: 8890,
    preview:
      "Convert the raw meeting notes below into: decisions made, open questions, owner-tagged actions with due dates...",
  },
  {
    id: "t-8",
    title: "API Design Review",
    description:
      "Reviews an endpoint spec against consistency, versioning and failure-mode checklists.",
    category: "Coding",
    score: 92,
    uses: 5410,
    preview:
      "Act as an API design reviewer. Evaluate the spec against: resource naming, idempotency, pagination, error envelope...",
  },
];

export const STATS = {
  totalPrompts: 247,
  averageScore: 72,
  optimized: 183,
  improvement: 24,
};

export function scoreTone(score: number) {
  if (score >= 80) return "success" as const;
  if (score >= 60) return "warning" as const;
  return "destructive" as const;
}

export function averageBreakdown(b: ScoreBreakdown) {
  const values = Object.values(b);
  return Math.round(values.reduce((a, c) => a + c, 0) / values.length);
}

/** Heuristic client-side prompt analyser used by the live optimizer. */
export function analysePrompt(text: string): {
  breakdown: ScoreBreakdown;
  overall: number;
  missing: string[];
} {
  const t = text.trim();
  const words = t ? t.split(/\s+/).length : 0;
  const lower = t.toLowerCase();
  const has = (...needles: string[]) => needles.some((n) => lower.includes(n));
  const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

  const breakdown: ScoreBreakdown = {
    clarity: clamp(
      words === 0
        ? 0
        : 40 + Math.min(words, 60) - (t.includes("?") ? 0 : 4) + (/^[A-Z]/.test(t) ? 6 : 0),
    ),
    context: clamp(
      words * 1.1 + (has("context", "background", "we are", "i am", "our ", "my ") ? 34 : 0),
    ),
    specificity: clamp(
      words * 0.9 + (/\d/.test(t) ? 22 : 0) + (has("specifically", "exactly", "must") ? 16 : 0),
    ),
    constraints: clamp(
      (has("constraint", "do not", "don't", "avoid", "limit", "max", "under ", "no ") ? 72 : 18) +
        words * 0.15,
    ),
    role: clamp(has("you are", "act as", "as a ", "role:") ? 88 : 14),
    outputFormat: clamp(
      has("format", "json", "table", "markdown", "bullet", "list", "return as", "output") ? 84 : 20,
    ),
    examples: clamp(has("example", "e.g.", "for instance", "sample", "few-shot") ? 80 : 12),
    completeness: clamp(words * 1.4),
  };

  const overall = averageBreakdown(breakdown);
  const missing: string[] = [];
  if (breakdown.role < 50) missing.push("A defined role for the model");
  if (breakdown.context < 55) missing.push("Background context about your situation");
  if (breakdown.constraints < 50) missing.push("Explicit constraints and scope limits");
  if (breakdown.outputFormat < 55) missing.push("The expected output format");
  if (breakdown.examples < 50) missing.push("At least one example of a good answer");
  if (breakdown.specificity < 55) missing.push("Concrete, measurable details");

  return { breakdown, overall, missing };
}

export const OPTIMIZATION_MODES = [
  { id: "general", label: "General", blurb: "Everyday prompts across any topic." },
  { id: "coding", label: "Coding", blurb: "Web dev, debugging, architecture, reviews." },
  { id: "research", label: "Research", blurb: "Deep research, sourcing, synthesis." },
  { id: "marketing", label: "Marketing", blurb: "SEO, ads, email, social, copy." },
  { id: "business", label: "Business", blurb: "Strategy, market and competitor work." },
  { id: "learning", label: "Learning", blurb: "Explanations, study plans, teaching." },
  { id: "content", label: "Content Creation", blurb: "Scripts, blogs, social, video." },
] as const;

export type OptimizationMode = (typeof OPTIMIZATION_MODES)[number]["id"];

const MODE_FRAME: Record<OptimizationMode, { role: string; extras: string[] }> = {
  general: {
    role: "a meticulous expert assistant",
    extras: ["Ask for missing information before assuming."],
  },
  coding: {
    role: "a senior software engineer with production ownership experience",
    extras: [
      "State assumptions about the stack before coding.",
      "Include failure modes and tests.",
    ],
  },
  research: {
    role: "a rigorous research analyst",
    extras: ["Cite every factual claim.", 'Say "insufficient evidence" instead of speculating.'],
  },
  marketing: {
    role: "a performance marketer who writes for conversion, not applause",
    extras: ["Define the audience and the single desired action.", "No hype adjectives."],
  },
  business: {
    role: "a strategy consultant briefing an executive team",
    extras: ["Lead with the recommendation, then the reasoning.", "Quantify trade-offs."],
  },
  learning: {
    role: "an expert tutor who adapts to the learner's level",
    extras: ["Use analogies anchored in what I already know.", "End with a short self-check."],
  },
  content: {
    role: "a professional content strategist and writer",
    extras: ["Hook first, payoff early.", "Match the platform's native format."],
  },
};

export function buildOptimizedPrompt(
  raw: string,
  mode: OptimizationMode,
  profile: { profession: string; experience: string; stack: string; style: string },
): string {
  const frame = MODE_FRAME[mode];
  const goal = raw.trim() || "(describe your task here)";
  return `ROLE
You are ${frame.role}.

CONTEXT
- I am a ${profile.profession} (${profile.experience} level).
- Tools / stack I work with: ${profile.stack}.
- Preferred response style: ${profile.style}.

TASK
${goal}

CONSTRAINTS
${frame.extras.map((e) => `- ${e}`).join("\n")}
- Preserve my original intent exactly; do not add scope I did not ask for.
- If a required detail is missing, ask one clarifying question before answering.

OUTPUT FORMAT
1. A one-paragraph summary of your approach.
2. The main deliverable, clearly structured with headings.
3. A short list of assumptions you made.

QUALITY BAR
Be concrete and verifiable. Prefer specifics over generalities. No filler.`;
}

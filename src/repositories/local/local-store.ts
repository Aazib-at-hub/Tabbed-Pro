/**
 * local-store.ts — Centralized LocalStorage & In-Memory Store
 *
 * Provides atomic in-memory caching and browser LocalStorage persistence.
 * Safe for SSR / Node environment (falls back seamlessly to in-memory store).
 */

import type {
  DbUser,
  DbAIProfile,
  DbFolder,
  DbPrompt,
  DbTemplate,
  DbWorkspace,
  DbWorkspaceMember,
  DbWorkspaceInvite,
} from "../types.js";

export interface DbStoreData {
  version: number;
  users: DbUser[];
  profiles: DbAIProfile[];
  folders: DbFolder[];
  prompts: DbPrompt[];
  templates: DbTemplate[];
  workspaces: DbWorkspace[];
  workspaceMembers: DbWorkspaceMember[];
  workspaceInvites: DbWorkspaceInvite[];
}

export const DB_KEY = "tabbed_pro_db";
export const DB_VERSION = 3;

export function uid(prefix: string): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID().replace(/-/g, "").substring(0, 12)}`;
  }
  return `${prefix}_${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`;
}

export function now(): string {
  return new Date().toISOString();
}

export function createInitialSeed(): DbStoreData {
  const userId = "usr_demo_123";

  const folders: DbFolder[] = [
    {
      id: "fld_001",
      userId,
      name: "Coding",
      icon: "💻",
      color: "#3b82f6",
      createdAt: "2026-08-01T00:00:00Z",
    },
    {
      id: "fld_002",
      userId,
      name: "Marketing",
      icon: "📣",
      color: "#f59e0b",
      createdAt: "2026-08-01T00:00:00Z",
    },
    {
      id: "fld_003",
      userId,
      name: "Research",
      icon: "🔬",
      color: "#8b5cf6",
      createdAt: "2026-08-01T00:00:00Z",
    },
    {
      id: "fld_004",
      userId,
      name: "Business",
      icon: "💼",
      color: "#10b981",
      createdAt: "2026-08-01T00:00:00Z",
    },
    {
      id: "fld_005",
      userId,
      name: "Content",
      icon: "🎬",
      color: "#ef4444",
      createdAt: "2026-08-01T00:00:00Z",
    },
  ];

  const seedPromptDefs = [
    {
      id: "pmt_001",
      folderId: "fld_001",
      title: "Build SaaS Landing Page",
      rawContent: "make me a landing page for my saas product with a hero and pricing",
      category: "Coding",
      mode: "coding",
      tags: ["react", "tailwind", "landing"],
      aiPlatform: "ChatGPT",
      isFavorite: true,
      createdAt: "2026-08-19T08:10:00Z",
      origScore: 42,
      optScore: 86,
      scores: {
        clarity: 90,
        context: 65,
        specificity: 70,
        constraints: 30,
        role: 80,
        outputFormat: 45,
        examples: 35,
        completeness: 68,
      },
      optimizedContent: `You are a senior front-end engineer specialising in conversion-focused SaaS marketing sites.\n\nCONTEXT\n- Product: Tabbed, an AI prompt intelligence platform.\n- Stack: React 19, TypeScript, Tailwind CSS.\n\nTASK\nProduce a single-page landing layout with: hero, social proof, feature grid, pricing (Free/Pro/Teams), FAQ, CTA.\n\nCONSTRAINTS\n- No inline hex colours — semantic tokens only.\n- Responsive from 360px to 1440px.\n\nOUTPUT FORMAT\n1. Layout rationale (max 5 bullets)\n2. Complete component code in a single fenced block`,
    },
    {
      id: "pmt_002",
      folderId: "fld_002",
      title: "Q3 Email Campaign Sequence",
      rawContent: "write me 5 marketing emails for our new product launch",
      category: "Marketing",
      mode: "marketing",
      tags: ["email", "lifecycle", "b2b"],
      aiPlatform: "Claude",
      isFavorite: false,
      createdAt: "2026-08-18T15:42:00Z",
      origScore: 51,
      optScore: 89,
      scores: {
        clarity: 82,
        context: 74,
        specificity: 66,
        constraints: 48,
        role: 70,
        outputFormat: 58,
        examples: 40,
        completeness: 72,
      },
      optimizedContent: `Act as a B2B lifecycle marketer with 10 years of PLG SaaS experience.\n\nAUDIENCE: engineering managers at 20-200 person startups.\nGOAL: convert free users to Pro within 14 days.\n\nWrite a 5-email sequence (day 0, 2, 5, 9, 13). For each email return: subject line, preview text, body under 140 words, single CTA.\n\nTone: direct, technical, zero hype. Return as markdown table + full bodies.`,
    },
    {
      id: "pmt_003",
      folderId: "fld_003",
      title: "Literature Review: LLM Evaluation",
      rawContent: "summarize research on evaluating large language models",
      category: "Research",
      mode: "research",
      tags: ["papers", "eval", "survey"],
      aiPlatform: "Perplexity",
      isFavorite: true,
      createdAt: "2026-08-17T09:20:00Z",
      origScore: 58,
      optScore: 91,
      scores: {
        clarity: 88,
        context: 80,
        specificity: 76,
        constraints: 62,
        role: 66,
        outputFormat: 70,
        examples: 44,
        completeness: 78,
      },
      optimizedContent: `You are a research assistant preparing a literature review for a graduate seminar.\n\nSCOPE: peer-reviewed work on LLM evaluation methodology published 2022-2026.\n\nFor each of 8 key papers provide: citation, core contribution, methodology, limitations.\nFinish with a synthesis and 3 candidate research questions.\n\nCite every claim. Say "insufficient evidence" rather than speculating.`,
    },
    {
      id: "pmt_004",
      folderId: "fld_004",
      title: "Competitor Teardown Framework",
      rawContent: "analyse my competitors",
      category: "Business",
      mode: "analysis",
      tags: ["strategy", "gtm"],
      aiPlatform: "ChatGPT",
      isFavorite: false,
      createdAt: "2026-08-15T11:05:00Z",
      origScore: 39,
      optScore: 83,
      scores: {
        clarity: 70,
        context: 55,
        specificity: 60,
        constraints: 35,
        role: 62,
        outputFormat: 40,
        examples: 30,
        completeness: 58,
      },
      optimizedContent: `Act as a product strategist running a competitive teardown.\n\nAnalyse Grammarly, PromptLayer, and Notion AI vs Tabbed.\n\nFor each: positioning, ICP, pricing, 3 strengths, 3 exploitable gaps.\nClose with a 2×2 positioning map and a recommended differentiation thesis in under 80 words.`,
    },
    {
      id: "pmt_005",
      folderId: "fld_005",
      title: "YouTube Script: Prompt Engineering",
      rawContent: "write a youtube script about prompt engineering",
      category: "Content Creation",
      mode: "creative",
      tags: ["youtube", "script"],
      aiPlatform: "Gemini",
      isFavorite: false,
      createdAt: "2026-08-13T17:30:00Z",
      origScore: 47,
      optScore: 88,
      scores: {
        clarity: 78,
        context: 60,
        specificity: 64,
        constraints: 42,
        role: 74,
        outputFormat: 52,
        examples: 38,
        completeness: 66,
      },
      optimizedContent: `You are a YouTube scriptwriter for a technical channel (avg. 8-min videos, 60% retention target).\n\nWrite a script: "Why your prompts score 42/100".\nStructure: cold open hook (under 15s), problem framing, 3 failure modes with before/after examples, the fix framework, CTA.\n\nInclude timestamps and B-roll suggestions. No filler intros.`,
    },
  ];

  const prompts: DbPrompt[] = seedPromptDefs.map((def) => ({
    id: def.id,
    userId,
    folderId: def.folderId,
    title: def.title,
    rawContent: def.rawContent,
    optimizedContent: def.optimizedContent,
    category: def.category,
    mode: def.mode,
    tags: def.tags,
    aiPlatform: def.aiPlatform,
    isFavorite: def.isFavorite,
    isArchived: false,
    createdAt: def.createdAt,
    updatedAt: def.createdAt,
    score: {
      id: uid("scr"),
      promptId: def.id,
      overall: def.origScore,
      ...def.scores,
      optimizedOverall: def.optScore,
      updatedAt: def.createdAt,
    },
    insights: [
      {
        id: uid("ins"),
        promptId: def.id,
        type: "missing",
        message: "No explicit output format specified",
        dimension: "outputFormat",
        impact: "high",
      },
      {
        id: uid("ins"),
        promptId: def.id,
        type: "missing",
        message: "No role or persona defined for the model",
        dimension: "role",
        impact: "high",
      },
      {
        id: uid("ins"),
        promptId: def.id,
        type: "suggestion",
        message: "Add a worked example to anchor tone and depth",
        dimension: "examples",
        impact: "medium",
      },
      {
        id: uid("ins"),
        promptId: def.id,
        type: "strength",
        message: "Clear primary objective that is easy to parse",
        dimension: "clarity",
        impact: "low",
      },
    ],
  }));

  const templates: DbTemplate[] = [
    {
      id: "tpl_001",
      title: "Debug a Code Error",
      description: "Step-by-step debugging assistant with error context.",
      category: "Coding",
      promptTemplate:
        "You are a senior software engineer helping me debug a {{language}} error.\n\nERROR:\n{{error_message}}\n\nCONTEXT:\n{{relevant_code}}\n\nProvide: (1) root cause, (2) the fix with explanation, (3) how to prevent this class of error.",
      score: 94,
      usageCount: 2841,
      isSystem: true,
      isPublic: true,
      tags: ["debugging", "code"],
      createdAt: "2026-01-01T00:00:00Z",
    },
    {
      id: "tpl_002",
      title: "B2B Cold Email Writer",
      description: "High-converting cold outreach email with personalisation hooks.",
      category: "Marketing",
      promptTemplate:
        "Act as a B2B copywriter.\n\nWrite a cold email to {{prospect_name}} at {{company}}.\nOur product: {{product_value_prop}}\nTheir pain point: {{pain_point}}\n\nRequirements: subject line under 40 chars, body under 100 words, one CTA. No buzzwords.",
      score: 91,
      usageCount: 1923,
      isSystem: true,
      isPublic: true,
      tags: ["email", "sales", "b2b"],
      createdAt: "2026-01-01T00:00:00Z",
    },
    {
      id: "tpl_003",
      title: "Deep Research Summary",
      description: "Structured academic literature synthesis with citations.",
      category: "Research",
      promptTemplate:
        "You are a research assistant producing a literature review.\n\nTOPIC: {{topic}}\nSCOPE: {{date_range}}, peer-reviewed only.\n\nFor each of 6 key papers: citation, contribution, methodology, limitations.\nEnd with: open problems, 3 research questions, and a recommended reading order.",
      score: 92,
      usageCount: 1456,
      isSystem: true,
      isPublic: true,
      tags: ["research", "academic"],
      createdAt: "2026-01-01T00:00:00Z",
    },
    {
      id: "tpl_004",
      title: "Startup Pitch Deck Outline",
      description: "Investor-ready pitch narrative with slide-by-slide breakdown.",
      category: "Business",
      promptTemplate:
        "Act as a startup pitch coach who has helped companies raise Series A.\n\nStartup: {{company_name}}\nProblem: {{problem}}\nSolution: {{solution}}\nMarket size: {{market}}\n\nCreate a 12-slide pitch deck outline with: slide title, 3 bullets, and presenter note for each slide.",
      score: 89,
      usageCount: 987,
      isSystem: true,
      isPublic: true,
      tags: ["startup", "pitch", "investors"],
      createdAt: "2026-01-01T00:00:00Z",
    },
    {
      id: "tpl_005",
      title: "YouTube Script Framework",
      description: "Retention-optimised YouTube script with hooks and B-roll cues.",
      category: "Content Creation",
      promptTemplate:
        "You are a YouTube scriptwriter for a {{niche}} channel targeting {{audience}}.\n\nVIDEO TOPIC: {{topic}}\nTARGET LENGTH: {{length}} minutes\n\nStructure: hook (under 15s), problem framing, 3 key points with examples, takeaway, CTA.\nInclude timestamps, on-screen text cues, and B-roll suggestions in a separate column.",
      score: 87,
      usageCount: 1102,
      isSystem: true,
      isPublic: true,
      tags: ["youtube", "script", "content"],
      createdAt: "2026-01-01T00:00:00Z",
    },
    {
      id: "tpl_006",
      title: "Concept Explainer (ELI5)",
      description: "Explain any concept from first principles using analogies.",
      category: "Learning",
      promptTemplate:
        "Explain {{concept}} to someone who {{audience_level}}.\n\nUse: (1) a one-sentence definition, (2) a real-world analogy, (3) a worked example, (4) the 3 most common misconceptions.\n\nTone: friendly, precise. Avoid jargon unless you define it immediately.",
      score: 90,
      usageCount: 3201,
      isSystem: true,
      isPublic: true,
      tags: ["learning", "explanation", "education"],
      createdAt: "2026-01-01T00:00:00Z",
    },
  ];

  const defaultWorkspaceId = "wsp_acme_001";
  const workspaces: DbWorkspace[] = [
    {
      id: defaultWorkspaceId,
      ownerId: userId,
      name: "Acme AI Labs",
      slug: "acme-ai-labs",
      plan: "teams",
      aiStandards: {
        enforcedContext:
          "Acme Corp is an enterprise AI & automation company. Ensure all prompts produce professional, typed, auditable, and security-conscious outputs with no hallucinated APIs.",
        forbiddenKeywords: [
          "confidential",
          "api_key",
          "secret_token",
          "unreviewed",
          "customer_ssn",
        ],
        responseTone: "Technical & Rigorous",
        minQualityScore: 75,
        defaultModel: "Claude 3.5 Sonnet",
      },
      createdAt: "2026-08-01T00:00:00Z",
    },
  ];

  const workspaceMembers: DbWorkspaceMember[] = [
    {
      id: "mbr_001",
      workspaceId: defaultWorkspaceId,
      userId,
      name: "Aazib Khan",
      email: "aazib@example.com",
      role: "admin",
      joinedAt: "2026-08-01T00:00:00Z",
    },
    {
      id: "mbr_002",
      workspaceId: defaultWorkspaceId,
      userId: "usr_team_002",
      name: "Sarah Chen",
      email: "sarah.chen@acme.corp",
      role: "editor",
      joinedAt: "2026-08-05T00:00:00Z",
    },
    {
      id: "mbr_003",
      workspaceId: defaultWorkspaceId,
      userId: "usr_team_003",
      name: "Marcus Vance",
      email: "marcus.v@acme.corp",
      role: "editor",
      joinedAt: "2026-08-10T00:00:00Z",
    },
    {
      id: "mbr_004",
      workspaceId: defaultWorkspaceId,
      userId: "usr_team_004",
      name: "Elena Rostova",
      email: "elena.r@acme.corp",
      role: "viewer",
      joinedAt: "2026-08-15T00:00:00Z",
    },
  ];

  const workspaceInvites: DbWorkspaceInvite[] = [
    {
      id: "inv_001",
      workspaceId: defaultWorkspaceId,
      email: "david.kim@acme.corp",
      role: "editor",
      status: "pending",
      token: "inv_tok_991823",
      invitedAt: "2026-09-01T00:00:00Z",
      expiresAt: "2026-10-30T00:00:00Z",
    },
  ];

  const teamPrompts: DbPrompt[] = [
    {
      id: "pmt_team_001",
      userId,
      workspaceId: defaultWorkspaceId,
      title: "Enterprise Microservice RFC Protocol",
      rawContent: "draft an rfc for migrating to event driven architecture using kafka and grpc",
      optimizedContent: `Act as a Principal Systems Architect at Acme Corp.\n\nCONTEXT:\nAcme Corp is transitioning our core payment gateway from REST monolith to event-driven microservices via Apache Kafka and gRPC.\n\nTASK:\nDraft a comprehensive RFC specification containing:\n1. Problem Statement & Motivation\n2. Proposed Event Topology & Dead Letter Queue Policy\n3. Schema Evolution & Protocol Buffers compatibility\n4. Idempotency & Exactly-Once semantics\n5. Rollback and Disaster Recovery strategy.\n\nCONSTRAINTS:\nAdhere strictly to enterprise audit standards. No placeholder code.`,
      category: "Architecture",
      mode: "executive",
      tags: ["rfc", "kafka", "grpc", "architecture"],
      aiPlatform: "Claude",
      isFavorite: true,
      isArchived: false,
      score: {
        id: "scr_team_001",
        promptId: "pmt_team_001",
        overall: 92,
        clarity: 95,
        context: 90,
        specificity: 92,
        constraints: 88,
        role: 94,
        outputFormat: 86,
        examples: 80,
        completeness: 92,
        optimizedOverall: 96,
        updatedAt: "2026-09-02T00:00:00Z",
      },
      insights: [
        {
          id: "ins_t1",
          promptId: "pmt_team_001",
          type: "strength",
          message: "Meets Acme AI security standards",
          impact: "high",
        },
      ],
      createdAt: "2026-09-02T00:00:00Z",
      updatedAt: "2026-09-02T00:00:00Z",
    },
    {
      id: "pmt_team_002",
      userId: "usr_team_002",
      workspaceId: defaultWorkspaceId,
      title: "SOC 2 Type II Security Review Checklist",
      rawContent:
        "give me a checklist for preparing our cloud infrastructure for soc2 type 2 audit",
      optimizedContent: `Act as a Cloud Security & Compliance Director.\n\nReview AWS multi-account infrastructure for SOC 2 Type II Trust Services Criteria (Security, Availability, Confidentiality).\n\nProvide an exhaustive audit checklist covering IAM least-privilege, KMS envelope encryption, CloudTrail immutable logging, and automated vulnerability scanning pipelines.`,
      category: "Security",
      mode: "analysis",
      tags: ["security", "soc2", "compliance", "cloud"],
      aiPlatform: "ChatGPT",
      isFavorite: false,
      isArchived: false,
      score: {
        id: "scr_team_002",
        promptId: "pmt_team_002",
        overall: 89,
        clarity: 90,
        context: 88,
        specificity: 92,
        constraints: 85,
        role: 90,
        outputFormat: 82,
        examples: 78,
        completeness: 88,
        optimizedOverall: 93,
        updatedAt: "2026-09-05T00:00:00Z",
      },
      insights: [
        {
          id: "ins_t2",
          promptId: "pmt_team_002",
          type: "strength",
          message: "Complies with organization tone and guidelines",
          impact: "high",
        },
      ],
      createdAt: "2026-09-05T00:00:00Z",
      updatedAt: "2026-09-05T00:00:00Z",
    },
  ];

  const teamTemplates: DbTemplate[] = [
    {
      id: "tpl_team_001",
      authorId: userId,
      workspaceId: defaultWorkspaceId,
      title: "Acme Code Review & Refactor Directive",
      description: "Company-standard pull request inspection and performance audit template.",
      category: "Engineering",
      promptTemplate:
        "Review the attached {{language}} pull request implementing {{feature_description}}.\n\nCheck for:\n1. Time & space complexity regressions\n2. Thread-safety and race conditions\n3. Input sanitization against injection attacks\n4. Unit test coverage edge cases\n\nFormat output as bulleted findings categorized by Severity (Blocker, Warning, Nit).",
      score: 94,
      usageCount: 142,
      isSystem: false,
      isPublic: false,
      tags: ["code-review", "engineering", "standards"],
      createdAt: "2026-08-20T00:00:00Z",
    },
    {
      id: "tpl_team_002",
      authorId: "usr_team_002",
      workspaceId: defaultWorkspaceId,
      title: "Incident Postmortem & 5-Whys Analysis",
      description:
        "Blameless postmortem generator following Acme Site Reliability Engineering guidelines.",
      category: "Operations",
      promptTemplate:
        "Generate a blameless postmortem for incident {{incident_title}} that occurred on {{incident_date}}.\n\nInclude:\n- Executive Summary & Timeline of events\n- 5-Whys Root Cause Analysis\n- Immediate Remediation & Permanent Action Items (with Jira ticket references)\n- Monitoring & Alerting blind spots",
      score: 91,
      usageCount: 88,
      isSystem: false,
      isPublic: false,
      tags: ["postmortem", "sre", "incidents"],
      createdAt: "2026-08-25T00:00:00Z",
    },
  ];

  return {
    version: DB_VERSION,
    users: [
      {
        id: userId,
        email: "aazib@example.com",
        name: "Aazib Khan",
        emailVerified: true,
        isOnboarded: true,
        subscriptionTier: "teams",
        subscriptionStatus: "active",
        createdAt: "2026-08-01T00:00:00Z",
      },
    ],
    profiles: [],
    folders,
    prompts: [...prompts, ...teamPrompts],
    templates: [...templates, ...teamTemplates],
    workspaces,
    workspaceMembers,
    workspaceInvites,
  };
}

export class LocalStoreManager {
  private inMemoryStore: DbStoreData;

  constructor() {
    this.inMemoryStore = this.load();
  }

  public getStore(): DbStoreData {
    return this.inMemoryStore;
  }

  public load(): DbStoreData {
    if (typeof localStorage !== "undefined") {
      try {
        const raw = localStorage.getItem(DB_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as DbStoreData;
          if (parsed && parsed.version === DB_VERSION) {
            return parsed;
          }
        }
      } catch {
        // Fallback to fresh seed
      }
    }
    const seed = createInitialSeed();
    this.persist(seed);
    return seed;
  }

  public persist(data?: DbStoreData): void {
    if (data) {
      this.inMemoryStore = data;
    }
    if (typeof localStorage !== "undefined") {
      try {
        localStorage.setItem(DB_KEY, JSON.stringify(this.inMemoryStore));
      } catch {
        // LocalStorage quota exceeded or disabled
      }
    }
  }

  public reset(): void {
    if (typeof localStorage !== "undefined") {
      try {
        localStorage.removeItem(DB_KEY);
      } catch {
        // ignore
      }
    }
    this.inMemoryStore = createInitialSeed();
    this.persist();
  }
}

// Singleton local store instance
export const localStore = new LocalStoreManager();

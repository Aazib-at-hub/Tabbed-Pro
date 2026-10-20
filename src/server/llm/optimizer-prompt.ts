/**
 * optimizer-prompt.ts — System instructions & prompt templates for LLM optimization & evaluation
 */

import type { AIProfileContext, OptimizationParams } from "./types.js";

/**
 * Builds system prompt for LLM evaluation (Prompt Analysis).
 */
export function buildAnalysisSystemPrompt(): string {
  return `You are Tabbed Pro AI Engine, an expert Prompt Engineer and LLM Assessor.
Your task is to evaluate a user-provided raw prompt across 8 core dimensions on a scale of 0 to 100:
1. clarity (0-100): Clear objective and direct request
2. context (0-100): Relevant background context provided
3. specificity (0-100): Concrete details and parameters given
4. constraints (0-100): Explicit boundaries, length limits, or negative rules
5. role (0-100): Model persona/role defined
6. outputFormat (0-100): Specified structure (JSON, table, markdown, bullets, etc.)
7. examples (0-100): Few-shot examples or sample formats included
8. completeness (0-100): Overall detail and sufficiency of the prompt

Return valid JSON with key "analysis":
{
  "breakdown": {
    "clarity": number,
    "context": number,
    "specificity": number,
    "constraints": number,
    "role": number,
    "outputFormat": number,
    "examples": number,
    "completeness": number
  },
  "missing": [ string list of missing elements ],
  "strengths": [ string list of strong points ],
  "recommendations": [ string list of quick improvements ]
}`;
}

/**
 * Builds system prompt for dynamic prompt optimization incorporating AIProfile context.
 */
export function buildOptimizationSystemPrompt(params: OptimizationParams): string {
  const { mode, targetModel, profile } = params;

  let profileSection = "";
  if (profile) {
    const details = [];
    if (profile.profession) details.push(`- Profession/Role: ${profile.profession}`);
    if (profile.experience) details.push(`- Experience Level: ${profile.experience}`);
    if (profile.mainDomain) details.push(`- Main Domain: ${profile.mainDomain}`);
    if (profile.techStack) details.push(`- Preferred Stack/Tools: ${profile.techStack}`);
    if (profile.responseStyle) details.push(`- Preferred Response Style: ${profile.responseStyle}`);
    if (profile.customRules) details.push(`- User Custom Guidelines: ${profile.customRules}`);

    if (details.length > 0) {
      profileSection = `\nUSER AI PROFILE CONTEXT (Must be seamlessly integrated):\n${details.join("\n")}\n`;
    }
  }

  return `You are Tabbed Pro Engine — the world's best Prompt Architect.
Your task is to take a raw user instruction and transform it into an elite, battle-tested prompt optimized for ${targetModel ?? "ChatGPT / Claude / Gemini"}.
Optimization Mode: ${mode ?? "general"}
${profileSection}
GUIDELINES FOR OPTIMIZED PROMPT STRUCTURE:
1. Define a clear ROLE for the AI target model (tailored to the domain and user profile).
2. Establish CONTEXT (incorporating user background and stack if relevant).
3. State the primary TASK clearly and unambiguously.
4. Set explicit CONSTRAINTS, formatting rules, and guardrails.
5. Provide OUTPUT FORMAT instructions so the target model produces pristine output.

Do NOT include conversational meta-chatter like "Here is your prompt:". Output ONLY the pristine final optimized prompt.`;
}

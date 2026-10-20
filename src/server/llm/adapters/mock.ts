/**
 * mock.ts — Fallback / Simulation LLM Adapter
 *
 * Provides instant LLM prompt evaluation and SSE streaming prompt generation
 * when live third-party API keys (OpenAI / Anthropic / Gemini) are not supplied.
 */

import type {
  LLMProviderAdapter,
  LLMProviderType,
  OptimizationParams,
  PromptAnalysisResult,
  ScoreBreakdown,
} from "../types.js";

export class MockLLMAdapter implements LLMProviderAdapter {
  name: LLMProviderType = "mock";

  async analyzePrompt(promptText: string): Promise<PromptAnalysisResult> {
    const text = promptText.trim();
    const words = text ? text.split(/\s+/).length : 0;
    const lower = text.toLowerCase();

    const has = (...needles: string[]) => needles.some((n) => lower.includes(n));
    const clamp = (val: number) => Math.max(15, Math.min(98, Math.round(val)));

    const breakdown: ScoreBreakdown = {
      clarity: clamp(words === 0 ? 0 : 50 + Math.min(words, 40) + (text.includes("?") ? 5 : 0)),
      context: clamp(words * 1.2 + (has("context", "background", "role", "my", "our") ? 30 : 15)),
      specificity: clamp(
        words * 1.1 + (/\d/.test(text) ? 25 : 10) + (has("specifically", "must") ? 15 : 0),
      ),
      constraints: clamp(
        (has("avoid", "do not", "don't", "limit", "max", "only") ? 80 : 25) + words * 0.2,
      ),
      role: clamp(has("you are", "act as", "role:") ? 90 : 20),
      outputFormat: clamp(has("json", "table", "markdown", "list", "bullet", "format") ? 85 : 25),
      examples: clamp(has("example", "sample", "e.g.", "like this") ? 85 : 15),
      completeness: clamp(words * 1.5),
    };

    const values = Object.values(breakdown);
    const overall = Math.round(values.reduce((a, b) => a + b, 0) / values.length);

    const missing: string[] = [];
    if (breakdown.role < 50) missing.push("Model persona definition");
    if (breakdown.context < 50) missing.push("Background context & environment details");
    if (breakdown.constraints < 50) missing.push("Explicit negative constraints & guardrails");
    if (breakdown.outputFormat < 50) missing.push("Desired output format / schema");
    if (breakdown.examples < 50) missing.push("Few-shot example or reference format");

    const strengths: string[] = [];
    if (breakdown.clarity >= 60) strengths.push("Clear primary intent");
    if (breakdown.context >= 60) strengths.push("Relevant context included");
    if (breakdown.role >= 60) strengths.push("Defined role specification");

    const recommendations = [
      "Add explicit role framing for target AI platform",
      "Specify constraints (e.g. word count, tone, disallowed assumptions)",
      "Provide output structure (e.g. Markdown headers or JSON object)",
    ];

    return {
      breakdown,
      overall,
      missing,
      strengths,
      recommendations,
      evaluatedBy: "Tabbed LLM Engine (Offline Simulation)",
    };
  }

  async optimizePromptStream(
    params: OptimizationParams,
    onChunk: (chunk: string) => void,
  ): Promise<string> {
    const { promptText, mode = "general", targetModel = "ChatGPT", profile } = params;

    const prof = profile?.profession ?? "Developer / Creator";
    const stack = profile?.techStack ?? "Modern Web & AI Tools";
    const style = profile?.responseStyle ?? "Structured & Direct";

    const promptBody = `ROLE & PERSONA
You are an expert AI specialist optimized for ${targetModel}.

USER CONTEXT
- Role: ${prof}
- Stack/Tools: ${stack}
- Preferred Output Style: ${style}
${profile?.customRules ? `- Custom Rules: ${profile.customRules}` : ""}

OBJECTIVE
${promptText.trim() || "Perform task effectively."}

EXECUTION GUIDELINES (${mode.toUpperCase()} MODE)
1. Provide a step-by-step breakdown before rendering the final solution.
2. Ensure technical precision and avoid generic hand-waving explanations.
3. Highlight edge cases, performance considerations, and assumptions.

OUTPUT STRUCTURE
- Summary of approach
- Implementation / Response
- Key constraints & trade-offs`;

    // Stream word by word with simulated micro-delays for realistic SSE streaming
    const words = promptBody.split(" ");
    let accumulated = "";

    for (let i = 0; i < words.length; i++) {
      const piece = (i === 0 ? "" : " ") + words[i];
      accumulated += piece;
      onChunk(piece);
      await new Promise((resolve) => setTimeout(resolve, 25));
    }

    return accumulated;
  }
}

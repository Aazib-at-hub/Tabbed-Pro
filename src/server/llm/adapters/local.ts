/**
 * local.ts — Local LLM / Ollama Adapter with SSE & Local Streaming
 *
 * Connects to local LLM instances (Ollama at http://localhost:11434,
 * LM Studio / LocalAI at http://localhost:1234/v1, or process.env.LOCAL_LLM_URL).
 */

import type {
  LLMProviderAdapter,
  LLMProviderType,
  OptimizationParams,
  PromptAnalysisResult,
  ScoreBreakdown,
} from "../types.js";
import { buildAnalysisSystemPrompt, buildOptimizationSystemPrompt } from "../optimizer-prompt.js";

export class LocalLLMAdapter implements LLMProviderAdapter {
  name: LLMProviderType = "local";
  private baseUrl: string;
  private modelName: string;

  constructor(baseUrl?: string, modelName = "llama3") {
    this.baseUrl =
      baseUrl ?? process.env.LOCAL_LLM_URL ?? process.env.OLLAMA_HOST ?? "http://localhost:11434";
    this.modelName = modelName;
  }

  async analyzePrompt(promptText: string): Promise<PromptAnalysisResult> {
    const systemPrompt = buildAnalysisSystemPrompt();
    const userPrompt = `Raw Prompt: """${promptText}"""`;

    // Attempt OpenAI-compatible /v1 endpoint or Ollama native API
    try {
      const isOllamaNative = !this.baseUrl.includes("/v1");
      const url = isOllamaNative
        ? `${this.baseUrl.replace(/\/$/, "")}/api/generate`
        : `${this.baseUrl.replace(/\/$/, "")}/chat/completions`;

      const body = isOllamaNative
        ? {
            model: this.modelName,
            prompt: `${systemPrompt}\n\n${userPrompt}`,
            stream: false,
            format: "json",
          }
        : {
            model: this.modelName,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            response_format: { type: "json_object" },
          };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(`Local LLM returned HTTP ${res.status}`);
      }

      const json = await res.json();
      const rawText = isOllamaNative ? json.response : json.choices[0]?.message?.content;
      const parsed = JSON.parse(rawText);
      const analysis = parsed.analysis ?? parsed;

      const values = Object.values(analysis.breakdown || {});
      const overall =
        values.length > 0
          ? Math.round(values.reduce((a: number, b: number) => a + b, 0) / values.length)
          : 50;

      return {
        breakdown: analysis.breakdown,
        overall,
        missing: analysis.missing ?? [],
        strengths: analysis.strengths ?? [],
        recommendations: analysis.recommendations ?? [],
        evaluatedBy: `Local LLM (${this.modelName})`,
      };
    } catch {
      // Fallback heuristic scoring if local server is unreachable
      return this.fallbackAnalysis(promptText);
    }
  }

  async optimizePromptStream(
    params: OptimizationParams,
    onChunk: (chunk: string) => void,
  ): Promise<string> {
    const systemPrompt = buildOptimizationSystemPrompt(params);

    try {
      const isOllamaNative = !this.baseUrl.includes("/v1");
      const url = isOllamaNative
        ? `${this.baseUrl.replace(/\/$/, "")}/api/generate`
        : `${this.baseUrl.replace(/\/$/, "")}/chat/completions`;

      const body = isOllamaNative
        ? {
            model: this.modelName,
            prompt: `${systemPrompt}\n\nRaw user input: """${params.promptText}"""`,
            stream: true,
          }
        : {
            model: this.modelName,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: `Raw user input: """${params.promptText}"""` },
            ],
            stream: true,
          };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok || !res.body) {
        throw new Error(`Local LLM stream failed with HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          try {
            if (isOllamaNative) {
              const obj = JSON.parse(trimmed);
              if (obj.response) {
                accumulated += obj.response;
                onChunk(obj.response);
              }
            } else if (trimmed.startsWith("data: ")) {
              const rawData = trimmed.slice(6);
              if (rawData === "[DONE]") continue;
              const obj = JSON.parse(rawData);
              const delta = obj.choices[0]?.delta?.content ?? "";
              if (delta) {
                accumulated += delta;
                onChunk(delta);
              }
            }
          } catch {
            // Partial JSON buffer, ignore parse error
          }
        }
      }

      return accumulated;
    } catch {
      // Offline fallback: simulated local streaming
      return this.fallbackStream(params, onChunk);
    }
  }

  private fallbackAnalysis(promptText: string): PromptAnalysisResult {
    const text = promptText.trim();
    const words = text ? text.split(/\s+/).length : 0;
    const lower = text.toLowerCase();

    const clamp = (val: number) => Math.max(20, Math.min(96, Math.round(val)));
    const has = (...needles: string[]) => needles.some((n) => lower.includes(n));

    const breakdown: ScoreBreakdown = {
      clarity: clamp(words === 0 ? 0 : 50 + Math.min(words, 40)),
      context: clamp(words * 1.2 + (has("role", "context", "background") ? 30 : 15)),
      specificity: clamp(words * 1.1 + (/\d/.test(text) ? 25 : 10)),
      constraints: clamp(has("avoid", "do not", "must", "only") ? 80 : 25),
      role: clamp(has("you are", "act as", "role:") ? 90 : 20),
      outputFormat: clamp(has("json", "markdown", "table", "list") ? 85 : 25),
      examples: clamp(has("example", "sample", "e.g.") ? 85 : 15),
      completeness: clamp(words * 1.5),
    };

    const values = Object.values(breakdown);
    const overall = Math.round(values.reduce((a, b) => a + b, 0) / values.length);

    return {
      breakdown,
      overall,
      missing: ["Model persona role", "Output schema / constraints", "Few-shot examples"],
      strengths: ["Direct primary request"],
      recommendations: ["Specify AI persona and target format constraints"],
      evaluatedBy: "Tabbed Local Engine (Offline)",
    };
  }

  private async fallbackStream(
    params: OptimizationParams,
    onChunk: (chunk: string) => void,
  ): Promise<string> {
    const { promptText, mode = "general", targetModel = "ChatGPT", profile } = params;

    const prof = profile?.profession ?? "Software Architect";
    const stack = profile?.techStack ?? "TypeScript / React / Python";
    const style = profile?.responseStyle ?? "Concise & Technical";

    const promptBody = `ROLE & PERSONA
You are an expert AI Assistant optimized for ${targetModel}.

USER PROFILE CONTEXT
- Profession/Role: ${prof}
- Technical Stack: ${stack}
- Preferred Response Style: ${style}
${profile?.customRules ? `- Custom Guidelines: ${profile.customRules}` : ""}

PRIMARY INSTRUCTION
${promptText.trim()}

EXECUTION PLAN (${mode.toUpperCase()} MODE)
1. Analyze requirements & edge cases systematically.
2. Structure implementation with production-ready patterns.
3. Highlight performance, security, and scalability trade-offs.

OUTPUT FORMAT REQUIREMENTS
- Structured Markdown output
- Code examples with clear inline comments
- Key assumptions & constraints list`;

    const words = promptBody.split(" ");
    let accumulated = "";

    for (let i = 0; i < words.length; i++) {
      const piece = (i === 0 ? "" : " ") + words[i];
      accumulated += piece;
      onChunk(piece);
      await new Promise((resolve) => setTimeout(resolve, 20));
    }

    return accumulated;
  }
}

/**
 * gemini.ts — Google Gemini API Adapter with Streaming
 */

import type {
  LLMProviderAdapter,
  LLMProviderType,
  OptimizationParams,
  PromptAnalysisResult,
} from "../types.js";
import { buildAnalysisSystemPrompt, buildOptimizationSystemPrompt } from "../optimizer-prompt.js";

export class GeminiAdapter implements LLMProviderAdapter {
  name: LLMProviderType = "gemini";
  private apiKey: string;
  private modelName: string;

  constructor(apiKey?: string, modelName = "gemini-1.5-flash") {
    this.apiKey = apiKey ?? process.env.GEMINI_API_KEY ?? "";
    this.modelName = modelName;
  }

  async analyzePrompt(promptText: string): Promise<PromptAnalysisResult> {
    if (!this.apiKey) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: buildAnalysisSystemPrompt() }] },
        contents: [{ parts: [{ text: `Raw Prompt: """${promptText}"""` }] }],
        generationConfig: { response_mime_type: "application/json" },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
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
      evaluatedBy: `Gemini ${this.modelName}`,
    };
  }

  async optimizePromptStream(
    params: OptimizationParams,
    onChunk: (chunk: string) => void,
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }

    const systemPrompt = buildOptimizationSystemPrompt(params);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:streamGenerateContent?alt=sse&key=${this.apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: `Raw user input: """${params.promptText}"""` }] }],
      }),
    });

    if (!response.ok || !response.body) {
      const errText = await response.text();
      throw new Error(`Gemini Streaming API error (${response.status}): ${errText}`);
    }

    const reader = response.body.getReader();
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
        if (trimmed.startsWith("data: ")) {
          try {
            const json = JSON.parse(trimmed.slice(6));
            const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
            if (text) {
              accumulated += text;
              onChunk(text);
            }
          } catch {
            // Ignore partial SSE JSON parse errors
          }
        }
      }
    }

    return accumulated;
  }
}

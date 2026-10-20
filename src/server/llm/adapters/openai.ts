/**
 * openai.ts — OpenAI API Adapter with SSE Streaming & JSON Evaluation
 */

import type {
  LLMProviderAdapter,
  LLMProviderType,
  OptimizationParams,
  PromptAnalysisResult,
} from "../types.js";
import { buildAnalysisSystemPrompt, buildOptimizationSystemPrompt } from "../optimizer-prompt.js";

export class OpenAIAdapter implements LLMProviderAdapter {
  name: LLMProviderType = "openai";
  private apiKey: string;
  private modelName: string;

  constructor(apiKey?: string, modelName = "gpt-4o-mini") {
    this.apiKey = apiKey ?? process.env.OPENAI_API_KEY ?? "";
    this.modelName = modelName;
  }

  async analyzePrompt(promptText: string): Promise<PromptAnalysisResult> {
    if (!this.apiKey) {
      throw new Error("OPENAI_API_KEY is not configured.");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.modelName,
        messages: [
          { role: "system", content: buildAnalysisSystemPrompt() },
          { role: "user", content: `Raw Prompt: """${promptText}"""` },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content);
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
      evaluatedBy: `OpenAI ${this.modelName}`,
    };
  }

  async optimizePromptStream(
    params: OptimizationParams,
    onChunk: (chunk: string) => void,
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error("OPENAI_API_KEY is not configured.");
    }

    const systemPrompt = buildOptimizationSystemPrompt(params);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.modelName,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Raw user input: """${params.promptText}"""` },
        ],
        stream: true,
        temperature: 0.7,
      }),
    });

    if (!response.ok || !response.body) {
      const errText = await response.text();
      throw new Error(`OpenAI Streaming API error (${response.status}): ${errText}`);
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
        if (!trimmed || trimmed.startsWith(":")) continue;
        if (trimmed === "data: [DONE]") continue;

        if (trimmed.startsWith("data: ")) {
          try {
            const json = JSON.parse(trimmed.slice(6));
            const delta = json.choices[0]?.delta?.content ?? "";
            if (delta) {
              accumulated += delta;
              onChunk(delta);
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

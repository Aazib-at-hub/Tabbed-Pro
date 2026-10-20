/**
 * anthropic.ts — Anthropic Claude API Adapter with SSE Streaming
 */

import type {
  LLMProviderAdapter,
  LLMProviderType,
  OptimizationParams,
  PromptAnalysisResult,
} from "../types.js";
import { buildAnalysisSystemPrompt, buildOptimizationSystemPrompt } from "../optimizer-prompt.js";

export class AnthropicAdapter implements LLMProviderAdapter {
  name: LLMProviderType = "anthropic";
  private apiKey: string;
  private modelName: string;

  constructor(apiKey?: string, modelName = "claude-3-5-sonnet-20241022") {
    this.apiKey = apiKey ?? process.env.ANTHROPIC_API_KEY ?? "";
    this.modelName = modelName;
  }

  async analyzePrompt(promptText: string): Promise<PromptAnalysisResult> {
    if (!this.apiKey) {
      throw new Error("ANTHROPIC_API_KEY is not configured.");
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.modelName,
        max_tokens: 1000,
        system: buildAnalysisSystemPrompt(),
        messages: [{ role: "user", content: `Raw Prompt: """${promptText}"""` }],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Anthropic API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const contentText = data.content[0]?.text ?? "{}";
    const parsed = JSON.parse(contentText);
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
      evaluatedBy: `Anthropic ${this.modelName}`,
    };
  }

  async optimizePromptStream(
    params: OptimizationParams,
    onChunk: (chunk: string) => void,
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error("ANTHROPIC_API_KEY is not configured.");
    }

    const systemPrompt = buildOptimizationSystemPrompt(params);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.modelName,
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{ role: "user", content: `Raw user input: """${params.promptText}"""` }],
        stream: true,
        temperature: 0.7,
      }),
    });

    if (!response.ok || !response.body) {
      const errText = await response.text();
      throw new Error(`Anthropic Streaming API error (${response.status}): ${errText}`);
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
            if (json.type === "content_block_delta" && json.delta?.text) {
              accumulated += json.delta.text;
              onChunk(json.delta.text);
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

/**
 * llm-client.ts — Client abstraction layer for LLM Engine & Streaming
 */

import { analysePrompt, type ScoreBreakdown } from "./tabbed-data";
import type { DbAIProfile } from "./db";

export interface LLMAnalysisResponse {
  breakdown: ScoreBreakdown;
  overall: number;
  missing: string[];
  strengths: string[];
  recommendations: string[];
  evaluatedBy: string;
}

export interface StreamOptimizeParams {
  promptText: string;
  mode: string;
  model: string;
  profile?: DbAIProfile | null;
  provider?: "openai" | "anthropic" | "gemini" | "mock" | "local" | "ollama";
  onChunk: (chunkText: string, accumulated: string) => void;
  onComplete: (fullText: string) => void;
  onError: (error: Error) => void;
}

const API_BASE = "http://localhost:3001/api";

/**
 * In-browser client engine fallback for streaming prompt optimization token-by-token.
 * Guarantees instantaneous, reliable execution even when backend server is offline.
 */
async function runInBrowserLocalOptimization(params: StreamOptimizeParams): Promise<void> {
  const { promptText, mode, model, profile, onChunk, onComplete } = params;

  const prof = profile?.profession ?? "Developer / AI Specialist";
  const stack = profile?.techStack ?? "Modern Web & Developer Tools";
  const style = profile?.responseStyle ?? "Direct, Technical & Structured";

  const promptBody = `ROLE & PERSONA
You are an expert AI specialist optimized for ${model}.

USER CONTEXT & ENVIRONMENT
- Role: ${prof}
- Primary Stack/Tools: ${stack}
- Preferred Output Style: ${style}
${profile?.customRules ? `- Custom Guidelines: ${profile.customRules}` : ""}

OBJECTIVE
${promptText.trim() || "Perform the task with technical precision."}

EXECUTION GUIDELINES (${mode.toUpperCase()} MODE)
1. Provide a step-by-step technical breakdown before rendering the final solution.
2. Maintain high clarity, avoid generic hand-waving, and explicitly define edge cases.
3. Include strict negative constraints, performance trade-offs, and guardrails.

OUTPUT STRUCTURE
- Context & System Role framing
- Step-by-step implementation/response
- Key assumptions & constraints checklist`;

  const words = promptBody.split(" ");
  let accumulated = "";

  for (let i = 0; i < words.length; i++) {
    const piece = (i === 0 ? "" : " ") + words[i];
    accumulated += piece;
    onChunk(piece, accumulated);
    await new Promise((resolve) => setTimeout(resolve, 20));
  }

  onComplete(accumulated);
}

/**
 * Analyzes prompt quality via LLM Backend endpoint with graceful fallback to heuristic client engine.
 */
export async function analyzePromptLLM(
  promptText: string,
  provider?: string,
): Promise<LLMAnalysisResponse> {
  if (!promptText.trim()) {
    return {
      breakdown: {
        clarity: 0,
        context: 0,
        specificity: 0,
        constraints: 0,
        role: 0,
        outputFormat: 0,
        examples: 0,
        completeness: 0,
      },
      overall: 0,
      missing: [],
      strengths: [],
      recommendations: [],
      evaluatedBy: "Client Engine",
    };
  }

  try {
    const res = await fetch(`${API_BASE}/llm/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ promptText, provider }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.ok && json.data) {
        return json.data;
      }
    }
  } catch {
    // API server offline, use client-side heuristic score fallback
  }

  const heuristic = analysePrompt(promptText);
  return {
    ...heuristic,
    strengths: heuristic.overall >= 70 ? ["Clear primary objective"] : [],
    recommendations: heuristic.missing.map((m) => `Add ${m.toLowerCase()}`),
    evaluatedBy: "Tabbed Local Engine (In-Browser)",
  };
}

/**
 * Stream prompt optimization token-by-token over Server-Sent Events (SSE)
 * with automatic fallback to the in-browser Local Engine.
 */
export async function streamOptimizePrompt(params: StreamOptimizeParams): Promise<void> {
  const {
    promptText,
    mode,
    model,
    profile,
    provider = "mock",
    onChunk,
    onComplete,
    onError,
  } = params;

  // If explicitly using mock/in-browser engine, skip backend network call directly
  if (provider === "mock") {
    await runInBrowserLocalOptimization(params);
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/llm/optimize/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        promptText,
        mode,
        model,
        profile: profile
          ? {
              profession: profile.profession,
              experience: profile.experience,
              mainDomain: profile.mainDomain,
              platforms: profile.platforms,
              responseStyle: profile.responseStyle,
              techStack: profile.techStack,
              customRules: profile.customRules,
            }
          : undefined,
        provider,
      }),
    });

    if (!res.ok || !res.body) {
      // Backend server error or port offline, fall back to in-browser local engine
      console.warn(
        `[Tabbed Engine] Backend server unreachable (status ${res?.status ?? "offline"}), activating in-browser Local Engine.`,
      );
      await runInBrowserLocalOptimization(params);
      return;
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
        if (!trimmed || trimmed.startsWith(":")) continue;
        if (trimmed === "data: [DONE]") {
          onComplete(accumulated);
          return;
        }

        if (trimmed.startsWith("data: ")) {
          try {
            const data = JSON.parse(trimmed.slice(6));
            if (data.chunk) {
              accumulated += data.chunk;
              onChunk(data.chunk, accumulated);
            }
            if (data.error) {
              throw new Error(data.error);
            }
          } catch (err: unknown) {
            if (err instanceof Error && err.message !== "Unexpected end of JSON input") {
              // Ignore partial stream JSON errors
            }
          }
        }
      }
    }

    onComplete(accumulated);
  } catch (err: unknown) {
    // Catch fetch/network errors (e.g. Failed to fetch when backend server is down)
    console.warn(
      "[Tabbed Engine] Network fetch error, seamlessly falling back to in-browser Local Engine:",
      err,
    );
    try {
      await runInBrowserLocalOptimization(params);
    } catch (fallbackErr: unknown) {
      const error =
        fallbackErr instanceof Error ? fallbackErr : new Error("Failed to stream optimization");
      onError(error);
    }
  }
}

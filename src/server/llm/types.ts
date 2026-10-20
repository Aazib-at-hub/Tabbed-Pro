/**
 * types.ts — LLM Engine Types & Interfaces
 */

export type LLMProviderType = "openai" | "anthropic" | "gemini" | "mock" | "local" | "ollama";

export interface ScoreBreakdown {
  clarity: number;
  context: number;
  specificity: number;
  constraints: number;
  role: number;
  outputFormat: number;
  examples: number;
  completeness: number;
}

export interface PromptAnalysisResult {
  breakdown: ScoreBreakdown;
  overall: number;
  missing: string[];
  strengths: string[];
  recommendations: string[];
  evaluatedBy: string;
}

export interface AIProfileContext {
  profession?: string;
  experience?: string;
  mainDomain?: string;
  platforms?: string[];
  responseStyle?: string;
  techStack?: string;
  customRules?: string;
}

export interface OptimizationParams {
  promptText: string;
  mode: string;
  targetModel?: string;
  profile?: AIProfileContext;
  provider?: LLMProviderType;
}

export interface LLMProviderAdapter {
  name: LLMProviderType;
  analyzePrompt(promptText: string): Promise<PromptAnalysisResult>;
  optimizePromptStream(
    params: OptimizationParams,
    onChunk: (chunk: string) => void,
  ): Promise<string>;
}

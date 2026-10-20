/**
 * index.ts — LLM Provider Factory & Router
 */

import type { LLMProviderAdapter, LLMProviderType } from "./types.js";
import { MockLLMAdapter } from "./adapters/mock.js";
import { OpenAIAdapter } from "./adapters/openai.js";
import { AnthropicAdapter } from "./adapters/anthropic.js";
import { GeminiAdapter } from "./adapters/gemini.js";
import { LocalLLMAdapter } from "./adapters/local.js";

export * from "./types.js";

/**
 * Returns an instance of the requested LLMProviderAdapter.
 * Automatically falls back to MockLLMAdapter if API key is missing or requested provider is unavailable.
 */
export function getLLMProvider(requestedProvider?: LLMProviderType): LLMProviderAdapter {
  const provider = requestedProvider?.toLowerCase() as LLMProviderType | undefined;

  if (provider === "local" || provider === "ollama") {
    try {
      return new LocalLLMAdapter();
    } catch {
      // Fall through to mock
    }
  }

  if (provider === "openai" || (!provider && process.env.OPENAI_API_KEY)) {
    try {
      return new OpenAIAdapter();
    } catch {
      // Fall through to mock if instantiation fails
    }
  }

  if (provider === "anthropic" || (!provider && process.env.ANTHROPIC_API_KEY)) {
    try {
      return new AnthropicAdapter();
    } catch {
      // Fall through to mock
    }
  }

  if (provider === "gemini" || (!provider && process.env.GEMINI_API_KEY)) {
    try {
      return new GeminiAdapter();
    } catch {
      // Fall through to mock
    }
  }

  // Fallback to high-quality simulated LLM adapter
  return new MockLLMAdapter();
}

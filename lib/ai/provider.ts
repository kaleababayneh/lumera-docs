import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import type { LanguageModel } from "ai";

const PROVIDER = (process.env.AI_PROVIDER ?? "openrouter").toLowerCase();
const PRIMARY = process.env.AI_MODEL ?? "deepseek/deepseek-chat-v3.1:free";
const FALLBACK = process.env.AI_MODEL_FALLBACK ?? "qwen/qwen3-235b-a22b:free";

function openrouter() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not set");
  return createOpenRouter({
    apiKey,
    headers: {
      "HTTP-Referer": process.env.OPENROUTER_SITE_URL ?? "",
      "X-Title": process.env.OPENROUTER_SITE_NAME ?? "Lumera Docs",
    },
  });
}

export function getModel(slug?: string): LanguageModel {
  const id = slug ?? PRIMARY;
  if (PROVIDER === "openrouter") return openrouter().chat(id);

  throw new Error(
    `Unsupported AI_PROVIDER=${PROVIDER}. Add a branch in lib/ai/provider.ts ` +
      `(e.g. @ai-sdk/anthropic) when you swap to Claude.`,
  );
}

export function getFallbackModel(): LanguageModel {
  return getModel(FALLBACK);
}

export function describeActiveModel(): { provider: string; model: string } {
  return { provider: PROVIDER, model: PRIMARY };
}

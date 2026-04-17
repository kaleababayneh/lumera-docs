import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { createGroq } from "@ai-sdk/groq";
import type { LanguageModel } from "ai";

const PROVIDER = (process.env.AI_PROVIDER ?? "groq").toLowerCase();
const PRIMARY = process.env.AI_MODEL ?? "openai/gpt-oss-120b";
const FALLBACK = process.env.AI_MODEL_FALLBACK ?? "llama-3.3-70b-versatile";

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

function groq() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not set");
  return createGroq({ apiKey });
}

export function getModel(slug?: string): LanguageModel {
  const id = slug ?? PRIMARY;
  if (PROVIDER === "groq") return groq()(id);
  if (PROVIDER === "openrouter") return openrouter().chat(id);

  throw new Error(
    `Unsupported AI_PROVIDER=${PROVIDER}. Add a branch in lib/ai/provider.ts.`,
  );
}

export function getFallbackModel(): LanguageModel {
  return getModel(FALLBACK);
}

export function describeActiveModel(): { provider: string; model: string } {
  return { provider: PROVIDER, model: PRIMARY };
}

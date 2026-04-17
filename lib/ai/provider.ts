import { createGroq } from "@ai-sdk/groq";
import type { LanguageModel } from "ai";

const PRIMARY = process.env.AI_MODEL ?? "openai/gpt-oss-120b";
const FALLBACK = process.env.AI_MODEL_FALLBACK ?? "llama-3.3-70b-versatile";

function groq() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not set");
  return createGroq({ apiKey });
}

export function getModel(slug?: string): LanguageModel {
  return groq()(slug ?? PRIMARY);
}

export function getFallbackModel(): LanguageModel {
  return getModel(FALLBACK);
}

export function describeActiveModel(): { provider: string; model: string } {
  return { provider: "groq", model: PRIMARY };
}

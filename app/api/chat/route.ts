import {
  streamText,
  convertToModelMessages,
  type UIMessage,
} from "ai";
import { getModel, getFallbackModel, describeActiveModel } from "@/lib/ai/provider";
import { retrieveDocs } from "@/lib/ai/retrieval";
import { buildSystemPrompt } from "@/lib/ai/system-prompt";

export const runtime = "nodejs";
export const maxDuration = 30;

type Body = {
  messages: UIMessage[];
  currentUrl?: string;
};

function extractText(msg: UIMessage): string {
  const parts = (msg as unknown as { parts?: Array<{ type: string; text?: string }> }).parts;
  if (Array.isArray(parts)) {
    return parts
      .filter((p) => p.type === "text" && typeof p.text === "string")
      .map((p) => p.text as string)
      .join(" ");
  }
  const content = (msg as unknown as { content?: unknown }).content;
  return typeof content === "string" ? content : "";
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { messages, currentUrl } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response("messages required", { status: 400 });
  }

  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const query = lastUser ? extractText(lastUser) : "";

  const docs = await retrieveDocs(query, 5);
  const system = buildSystemPrompt(docs, currentUrl);
  const active = describeActiveModel();

  async function runWith(model: Parameters<typeof streamText>[0]["model"]) {
    return streamText({
      model,
      system,
      messages: convertToModelMessages(messages),
      temperature: 0.3,
      providerOptions: {
        groq: {
          reasoningEffort: "medium",
          reasoningFormat: "parsed",
        },
      },
      onError: ({ error }) => {
        console.error("[ai] stream error:", error);
      },
      onFinish: ({ finishReason, text, usage }) => {
        console.log("[ai] stream finished:", {
          finishReason,
          textLen: text?.length ?? 0,
          usage,
        });
      },
    });
  }

  let result;
  try {
    result = await runWith(getModel());
  } catch (err) {
    console.warn("[ai] primary model failed, trying fallback:", err);
    result = await runWith(getFallbackModel());
  }

  const citations = docs.map((d) => ({ title: d.title, url: d.url }));
  const modelTag = `${active.provider}/${active.model}`;

  return result.toUIMessageStreamResponse({
    messageMetadata: ({ part }: { part: { type: string } }) => {
      if (part.type === "start") return { citations, model: modelTag };
      return undefined;
    },
    sendReasoning: false,
    onError: (error) => {
      console.error("[ai] UI stream error:", error);
      return error instanceof Error ? error.message : "Stream error";
    },
  });
}

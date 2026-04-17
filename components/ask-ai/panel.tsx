"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  ArrowUp,
  Loader2,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  type FormEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { useAskAi } from "./context";
import { ChatMessage } from "./message";
import { STARTER_SUGGESTIONS } from "@/lib/ai/suggestions";
import type { Citation } from "./citations";

function useAutosize(ref: React.RefObject<HTMLTextAreaElement | null>, value: string) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }, [ref, value]);
}

export function AskAiPanel() {
  const { open, setOpen, initialPrompt, setInitialPrompt } = useAskAi();
  const pathname = usePathname();
  const [input, setInput] = useState("");
  const taRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, stop, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  useAutosize(taRef, input);

  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => taRef.current?.focus());
  }, [open]);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, status]);

  useEffect(() => {
    if (open && initialPrompt) {
      sendMessage(
        { text: initialPrompt },
        { body: { currentUrl: pathname } },
      );
      setInitialPrompt(null);
    }
  }, [open, initialPrompt, sendMessage, pathname, setInitialPrompt]);

  function submit(e?: FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || status === "streaming") return;
    sendMessage({ text }, { body: { currentUrl: pathname } });
    setInput("");
  }

  function sendSuggestion(prompt: string) {
    sendMessage({ text: prompt }, { body: { currentUrl: pathname } });
  }

  function reset() {
    stop();
    setMessages([]);
    setInput("");
    taRef.current?.focus();
  }

  const isEmpty = messages.length === 0;
  const isStreaming = status === "streaming" || status === "submitted";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] md:bg-black/20"
          />

          <motion.div
            layoutId="ask-ai-shell"
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed inset-x-3 bottom-3 top-3 z-50 flex flex-col overflow-hidden rounded-2xl border border-fd-border bg-fd-background/95 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)] backdrop-blur-xl md:inset-y-4 md:left-auto md:right-4 md:w-[440px]"
          >
            <div className="relative flex items-center gap-3 border-b border-fd-border bg-gradient-to-r from-teal-500/10 via-transparent to-emerald-500/10 px-4 py-3">
              <div className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-sm dark:from-teal-400 dark:to-emerald-400 dark:text-teal-950">
                <Sparkles className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold leading-tight">Lumera AI</div>
                <div className="flex items-center gap-1.5 text-[11px] text-fd-muted-foreground">
                  <span className="relative flex size-1.5">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-teal-400 opacity-60" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-teal-500" />
                  </span>
                  <span>{process.env.NEXT_PUBLIC_AI_MODEL_LABEL ?? "GPT-OSS 120B · free tier"}</span>
                </div>
              </div>
              {messages.length > 0 && (
                <button
                  onClick={reset}
                  className="inline-flex size-8 items-center justify-center rounded-md text-fd-muted-foreground transition hover:bg-fd-accent hover:text-fd-foreground"
                  title="New chat"
                  aria-label="New chat"
                >
                  <RotateCcw className="size-4" />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="inline-flex size-8 items-center justify-center rounded-md text-fd-muted-foreground transition hover:bg-fd-accent hover:text-fd-foreground"
                title="Close (Esc)"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>

            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-4 [scrollbar-width:thin]"
            >
              {isEmpty ? (
                <EmptyState onSuggest={sendSuggestion} pathname={pathname} />
              ) : (
                <div className="flex flex-col gap-4">
                  {messages.map((m, i) => {
                    const parts = (m as unknown as {
                      parts?: Array<{ type: string; text?: string }>;
                    }).parts;
                    const text = Array.isArray(parts)
                      ? parts
                          .filter((p) => p.type === "text")
                          .map((p) => p.text ?? "")
                          .join("")
                      : ((m as unknown as { content?: string }).content ?? "");
                    const metadata = (m as unknown as {
                      metadata?: { citations?: Citation[] };
                    }).metadata;
                    const isLast = i === messages.length - 1;
                    const showingThinkingOnly =
                      isLast &&
                      isStreaming &&
                      m.role === "assistant" &&
                      text.length === 0;
                    if (showingThinkingOnly) {
                      return (
                        <ThinkingBubble key={m.id} />
                      );
                    }
                    return (
                      <ChatMessage
                        key={m.id}
                        role={m.role === "user" ? "user" : "assistant"}
                        content={text}
                        citations={
                          m.role === "assistant" ? metadata?.citations : undefined
                        }
                        streaming={isLast && isStreaming && m.role === "assistant"}
                      />
                    );
                  })}
                  {isStreaming &&
                    messages[messages.length - 1]?.role === "user" && (
                      <ThinkingBubble label="Searching docs…" />
                    )}
                </div>
              )}
            </div>

            <form
              onSubmit={submit}
              className="border-t border-fd-border bg-fd-card/40 px-3 py-3"
            >
              <div className="flex items-end gap-2 rounded-xl border border-fd-border bg-fd-background px-3 py-2 shadow-sm focus-within:border-teal-500/60 focus-within:ring-2 focus-within:ring-teal-500/20">
                <textarea
                  ref={taRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      submit();
                    }
                  }}
                  rows={1}
                  placeholder="Ask anything about Lumera…"
                  className="max-h-40 flex-1 resize-none bg-transparent text-sm leading-6 outline-none placeholder:text-fd-muted-foreground/70"
                />
                {isStreaming ? (
                  <button
                    type="button"
                    onClick={() => stop()}
                    className="grid size-8 place-items-center rounded-lg bg-fd-muted text-fd-foreground transition hover:bg-fd-accent"
                    title="Stop"
                    aria-label="Stop generating"
                  >
                    <span className="size-2.5 rounded-[2px] bg-current" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 dark:from-teal-400 dark:to-emerald-400 dark:text-teal-950"
                    title="Send (Enter)"
                    aria-label="Send"
                  >
                    <ArrowUp className="size-4" />
                  </button>
                )}
              </div>
              <div className="mt-1.5 flex items-center justify-between px-1 text-[10px] text-fd-muted-foreground">
                <span>
                  Enter to send · Shift+Enter for newline · Esc to close
                </span>
                <span>Answers may be inaccurate · verify in docs</span>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ThinkingBubble({ label = "Thinking…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-fd-muted-foreground">
      <span className="relative flex size-3 items-center justify-center">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-teal-400 opacity-50" />
        <Loader2 className="relative size-3 animate-spin text-teal-500" />
      </span>
      <span>{label}</span>
    </div>
  );
}

function EmptyState({
  onSuggest,
  pathname,
}: {
  onSuggest: (p: string) => void;
  pathname: string | null;
}) {
  const onDocsPage = pathname?.startsWith("/docs/") && pathname !== "/docs";
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 py-6 text-center">
      <div className="relative">
        <div className="absolute inset-0 -z-10 animate-pulse rounded-full bg-gradient-to-br from-teal-500/40 to-emerald-500/40 blur-2xl" />
        <div className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-xl dark:from-teal-400 dark:to-emerald-400 dark:text-teal-950">
          <Sparkles className="size-7" />
        </div>
      </div>
      <div className="space-y-1">
        <div className="text-base font-semibold">Ask anything about Lumera</div>
        <div className="text-xs text-fd-muted-foreground">
          Grounded in the Cascade docs · cites its sources · streams fast
        </div>
      </div>

      {onDocsPage && (
        <button
          onClick={() =>
            onSuggest(
              `Explain the page I'm currently on (${pathname}) in plain English, then give one code example.`,
            )
          }
          className="group inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/5 px-3 py-1.5 text-xs font-medium text-teal-700 transition hover:border-teal-500/50 hover:bg-teal-500/10 dark:text-teal-300"
        >
          <Sparkles className="size-3" />
          Explain this page
        </button>
      )}

      <div className="grid w-full grid-cols-2 gap-2">
        {STARTER_SUGGESTIONS.map((s) => (
          <button
            key={s.label}
            onClick={() => onSuggest(s.prompt)}
            className="group rounded-xl border border-fd-border bg-fd-card/50 p-3 text-left text-xs text-fd-foreground transition hover:border-teal-500/40 hover:bg-teal-500/5"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{s.label}</span>
              <ArrowUp className="size-3 rotate-45 text-fd-muted-foreground transition group-hover:text-teal-500" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

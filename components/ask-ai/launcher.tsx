"use client";

import { Sparkles } from "lucide-react";
import { useAskAi } from "./context";

export function AskAiLauncher() {
  const { open, setOpen } = useAskAi();

  if (open) return null;

  return (
    <button
      onClick={() => setOpen(true)}
      aria-label="Open Lumera AI assistant"
      className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full border border-fd-border bg-fd-primary px-4 py-2.5 text-sm font-medium text-fd-primary-foreground shadow-lg transition hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-fd-primary/30 md:hidden"
    >
      <span className="relative flex size-5 items-center justify-center">
        <Sparkles className="relative size-4" />
      </span>
      <span>Ask Lumera AI</span>
      <kbd className="hidden items-center gap-0.5 rounded border border-fd-primary-foreground/25 bg-fd-primary-foreground/10 px-1 py-0.5 text-[10px] font-semibold tracking-wide sm:flex">
        <span>⌘</span>
        <span>I</span>
      </kbd>
    </button>
  );
}

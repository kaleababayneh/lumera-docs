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
      className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2.5 rounded-full border border-teal-400/40 bg-gradient-to-r from-teal-500 to-emerald-500 px-5 py-3 text-sm font-medium text-white shadow-[0_10px_40px_-10px_rgba(20,184,166,0.55)] transition hover:scale-[1.03] hover:shadow-[0_12px_44px_-8px_rgba(20,184,166,0.7)] focus:outline-none focus:ring-2 focus:ring-teal-300 dark:border-teal-400/30 dark:from-teal-400 dark:to-emerald-400 dark:text-teal-950"
    >
      <span className="relative flex size-5 items-center justify-center">
        <Sparkles className="relative size-4" />
      </span>
      <span>Ask Lumera AI</span>
      <kbd className="hidden items-center gap-0.5 rounded-md border border-white/30 bg-white/15 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide sm:flex">
        <span>⌘</span>
        <span>I</span>
      </kbd>
    </button>
  );
}

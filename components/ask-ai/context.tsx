"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type AskAiCtx = {
  open: boolean;
  setOpen: (v: boolean) => void;
  toggle: () => void;
  initialPrompt: string | null;
  setInitialPrompt: (v: string | null) => void;
};

const Ctx = createContext<AskAiCtx | null>(null);

export function AskAiProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [initialPrompt, setInitialPrompt] = useState<string | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isMeta = e.metaKey || e.ctrlKey;
      if (isMeta && e.key.toLowerCase() === "i") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <Ctx.Provider
      value={{
        open,
        setOpen,
        toggle: () => setOpen((v) => !v),
        initialPrompt,
        setInitialPrompt,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAskAi() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAskAi must be used inside AskAiProvider");
  return ctx;
}

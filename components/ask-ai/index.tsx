"use client";

import { AskAiProvider } from "./context";
import { AskAiPanel } from "./panel";
import type { ReactNode } from "react";

export function AskAi({ children }: { children: ReactNode }) {
  return (
    <AskAiProvider>
      {children}
      <AskAiPanel />
    </AskAiProvider>
  );
}

"use client";

import { AskAiProvider } from "./context";
import { AskAiLauncher } from "./launcher";
import { AskAiPanel } from "./panel";
import type { ReactNode } from "react";

export function AskAi({ children }: { children: ReactNode }) {
  return (
    <AskAiProvider>
      {children}
      <AskAiLauncher />
      <AskAiPanel />
    </AskAiProvider>
  );
}

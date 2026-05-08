"use client";

import dynamic from "next/dynamic";

/**
 * Lazy entry point for the LuksoTryCascade component.
 *
 * `ssr: false` keeps `window.lukso` (UP browser extension) and
 * `createImageBitmap` out of the server build. The bundler also splits
 * the heavy deps (`@erc725/erc725.js`, `viem`) into a chunk that only
 * loads when this page renders, instead of being shared across every
 * docs route.
 */
export const LuksoTryCascade = dynamic(
  () =>
    import("./index").then((m) => ({ default: m.LuksoTryCascade })),
  {
    ssr: false,
    loading: () => (
      <div className="not-prose flex items-center justify-center rounded-lg border border-fd-border bg-fd-card p-12 text-sm text-fd-muted-foreground">
        <span className="size-3.5 animate-spin rounded-full border-2 border-fd-muted-foreground/40 border-t-fd-muted-foreground" />
        <span className="ml-2">Loading the demo…</span>
      </div>
    ),
  },
);

"use client";

import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Droplets,
  Loader2,
  XCircle,
} from "lucide-react";

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | {
      kind: "success";
      txHash?: string;
      amount?: string;
      explorerUrl?: string;
    }
  | { kind: "error"; message: string };

const ADDRESS_PATTERN = /^lumera1[a-z0-9]{38,58}$/;

export function FaucetForm() {
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function submit() {
    const addr = address.trim();
    if (!addr) return;
    if (!ADDRESS_PATTERN.test(addr)) {
      setStatus({
        kind: "error",
        message:
          "That doesn't look like a Lumera address (expected prefix: lumera1…).",
      });
      return;
    }

    setStatus({ kind: "loading" });
    try {
      const res = await fetch("/api/faucet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: addr }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        txHash?: string;
        amount?: string;
        explorerUrl?: string;
        error?: string;
      };
      if (!res.ok) {
        setStatus({
          kind: "error",
          message: data.error ?? `Faucet request failed (${res.status})`,
        });
        return;
      }
      setStatus({
        kind: "success",
        txHash: data.txHash,
        amount: data.amount,
        explorerUrl: data.explorerUrl,
      });
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : "Network error",
      });
    }
  }

  const loading = status.kind === "loading";

  return (
    <div className="relative mx-auto w-full max-w-3xl">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-20 -top-20 -bottom-10 -z-10 rounded-4xl bg-[radial-gradient(ellipse_at_top,hsl(var(--fd-primary)/0.15),transparent_65%)] blur-3xl"
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
        className="relative flex flex-col gap-8 overflow-hidden rounded-3xl border border-fd-border bg-fd-card/80 p-10 shadow-[0_1px_0_0_hsl(var(--fd-border)),0_30px_80px_-30px_hsl(var(--fd-primary)/0.35)] backdrop-blur-sm md:p-12"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-fd-primary/10 blur-3xl"
        />

        <div className="relative flex items-center gap-4">
          <div className="grid size-14 place-items-center rounded-2xl bg-fd-primary/10 text-fd-primary ring-1 ring-fd-primary/20">
            <Droplets className="size-7" />
          </div>
          <div className="min-w-0">
            <div className="text-lg font-semibold text-fd-foreground">
              Get testnet tokens
            </div>
            <div className="text-sm text-fd-muted-foreground">
              0.25 LUME · once per 24 hours
            </div>
          </div>
        </div>

        <label className="relative flex flex-col gap-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-fd-muted-foreground">
            Lumera address
          </span>
          <input
            type="text"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              if (status.kind === "error") setStatus({ kind: "idle" });
            }}
            placeholder="lumera1…"
            autoComplete="off"
            spellCheck={false}
            disabled={loading}
            style={{ paddingLeft: '20px' }} 
            className="h-14 rounded-xl border border-fd-border bg-fd-background px-6 font-mono text-base text-fd-foreground outline-none transition placeholder:text-fd-muted-foreground/60 focus:border-fd-primary/60 focus:ring-2 focus:ring-fd-primary/20 disabled:opacity-60"
          />
          <span className="text-xs text-fd-muted-foreground/80">
            Addresses start with{" "}
            <code className="rounded bg-fd-muted px-1.5 py-0.5 font-mono text-[11px]">
              lumera1…
            </code>
          </span>
        </label>

        <button
          type="submit"
          disabled={loading || !address.trim()}
          className="group relative inline-flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-fd-primary px-6 text-base font-semibold text-fd-primary-foreground shadow-[0_8px_24px_-6px_hsl(var(--fd-primary)/0.6)] transition hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full"
          />
          {loading ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              Requesting…
            </>
          ) : (
            <>
              Request tokens
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>

        {status.kind === "success" && (
          <div className="relative flex items-start gap-3 rounded-xl border border-fd-primary/30 bg-fd-primary/5 px-4 py-3.5 text-sm leading-relaxed text-fd-foreground">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-fd-primary" />
            <div className="min-w-0 flex-1">
              <div className="font-semibold">
                {status.amount ? `${status.amount} sent` : "Tokens sent"}
              </div>
              {/*
              {status.txHash && (
                <div className="mt-1 truncate font-mono text-xs text-fd-muted-foreground">
                  Tx: {status.txHash}
                </div>
              )}
              {status.explorerUrl && (
                <a
                  href={status.explorerUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-fd-primary hover:underline"
                >
                  View on explorer
                  <ArrowUpRight className="size-3" />
                </a>
              )}
              */}
            </div>
          </div>
        )}

        {status.kind === "error" && (
          <div className="relative flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3.5 text-sm leading-relaxed text-red-600 dark:text-red-400">
            <XCircle className="mt-0.5 size-5 shrink-0" />
            <div>{status.message}</div>
          </div>
        )}
      </form>
    </div>
  );
}

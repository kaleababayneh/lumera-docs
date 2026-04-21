"use client";

import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Droplets,
  Loader2,
  XCircle,
} from "lucide-react";

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; txHash?: string; amount?: string }
  | { kind: "error"; message: string };

const ADDRESS_PATTERN = /^lumera[0-9a-z]{30,}$/;

export function FaucetForm() {
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const addr = address.trim();
    if (!addr) return;
    if (!ADDRESS_PATTERN.test(addr)) {
      setStatus({
        kind: "error",
        message: "That doesn't look like a Lumera address (expected prefix: lumera…).",
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
        error?: string;
      };
      if (!res.ok) {
        setStatus({
          kind: "error",
          message: data.error ?? `Faucet request failed (${res.status})`,
        });
        return;
      }
      setStatus({ kind: "success", txHash: data.txHash, amount: data.amount });
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : "Network error",
      });
    }
  }

  const loading = status.kind === "loading";

  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-10 -top-10 -bottom-4 -z-10 rounded-[2rem] bg-[radial-gradient(ellipse_at_top,hsl(var(--fd-primary)/0.12),transparent_60%)] blur-2xl"
      />

      <form
        onSubmit={submit}
        className="flex flex-col gap-5 rounded-2xl border border-fd-border bg-fd-card/80 p-6 shadow-[0_1px_0_0_hsl(var(--fd-border)),0_20px_50px_-25px_hsl(var(--fd-primary)/0.25)] backdrop-blur-sm md:p-8"
      >
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-fd-primary/10 text-fd-primary ring-1 ring-fd-primary/20">
            <Droplets className="size-5" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-fd-foreground">
              Get testnet tokens
            </div>
            <div className="text-xs text-fd-muted-foreground">
              0.25 LUME · once per 24 hours
            </div>
          </div>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-fd-muted-foreground">
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
            className="rounded-lg border border-fd-border bg-fd-background px-3.5 py-3 font-mono text-sm text-fd-foreground outline-none transition placeholder:text-fd-muted-foreground/60 focus:border-fd-primary/60 focus:ring-2 focus:ring-fd-primary/20 disabled:opacity-60"
          />
          <span className="text-[11px] text-fd-muted-foreground/80">
            Addresses start with <code className="rounded bg-fd-muted px-10 py-0.5 font-mono text-[10px]">lumera1…</code>
          </span>
        </label>

        <button
          type="submit"
          disabled={loading || !address.trim()}
          className="group inline-flex items-center justify-center gap-2 rounded-lg bg-fd-primary px-4 py-3 text-sm font-semibold text-fd-primary-foreground shadow-[0_4px_14px_-4px_hsl(var(--fd-primary)/0.5)] transition hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Requesting…
            </>
          ) : (
            <>
              Request tokens
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>

        {status.kind === "success" && (
          <div className="flex items-start gap-2.5 rounded-lg border border-fd-primary/30 bg-fd-primary/5 px-3.5 py-3 text-xs leading-relaxed text-fd-foreground">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-fd-primary" />
            <div className="min-w-0 flex-1">
              <div className="font-semibold">Tokens sent</div>
              {status.amount && (
                <div className="mt-0.5 text-fd-muted-foreground">
                  Amount: {status.amount}
                </div>
              )}
              {status.txHash && (
                <div className="mt-0.5 truncate font-mono text-fd-muted-foreground">
                  Tx: {status.txHash}
                </div>
              )}
            </div>
          </div>
        )}

        {status.kind === "error" && (
          <div className="flex items-start gap-2.5 rounded-lg border border-red-500/30 bg-red-500/5 px-3.5 py-3 text-xs leading-relaxed text-red-600 dark:text-red-400">
            <XCircle className="mt-0.5 size-4 shrink-0" />
            <div>{status.message}</div>
          </div>
        )}
      </form>
    </div>
  );
}

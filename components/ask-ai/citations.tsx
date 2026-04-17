"use client";

import Link from "next/link";
import { ArrowUpRight, BookOpen } from "lucide-react";

export type Citation = { title: string; url: string };

export function Citations({ items }: { items: Citation[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mt-3 flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-fd-muted-foreground">
        <BookOpen className="size-3" />
        Sources
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((c, i) => (
          <Link
            key={`${c.url}-${i}`}
            href={c.url}
            className="group inline-flex items-center gap-1.5 rounded-md border border-fd-border bg-fd-card px-2 py-1 text-xs text-fd-muted-foreground transition hover:border-fd-primary/50 hover:bg-fd-accent hover:text-fd-foreground"
          >
            <span className="grid size-4 place-items-center rounded-sm bg-fd-primary/15 text-[10px] font-bold text-fd-primary">
              {i + 1}
            </span>
            <span className="max-w-[220px] truncate">{c.title}</span>
            <ArrowUpRight className="size-3 text-fd-muted-foreground transition group-hover:text-fd-primary" />
          </Link>
        ))}
      </div>
    </div>
  );
}

"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { Citations, type Citation } from "./citations";

type Props = {
  role: "user" | "assistant" | "system";
  content: string;
  citations?: Citation[];
  streaming?: boolean;
};

export function ChatMessage({ role, content, citations, streaming }: Props) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-gradient-to-br from-teal-500 to-emerald-500 px-3.5 py-2 text-sm text-white shadow-sm dark:from-teal-400 dark:to-emerald-400 dark:text-teal-950">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="prose-chat text-sm leading-relaxed text-fd-foreground">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            a: ({ href, children, ...p }) => {
              const h = href ?? "";
              const internal = h.startsWith("/") || h.startsWith("#");
              if (internal) {
                return (
                  <Link
                    href={h}
                    className="text-teal-600 underline decoration-teal-500/40 underline-offset-2 hover:decoration-teal-500 dark:text-teal-300"
                  >
                    {children}
                  </Link>
                );
              }
              return (
                <a
                  href={h}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-teal-600 underline decoration-teal-500/40 underline-offset-2 hover:decoration-teal-500 dark:text-teal-300"
                  {...p}
                >
                  {children}
                </a>
              );
            },
            code: ({ className, children, ...p }) => {
              const isInline = !className;
              if (isInline) {
                return (
                  <code
                    className="rounded-md border border-fd-border bg-fd-muted px-1 py-0.5 text-[0.85em] text-teal-700 dark:text-teal-300"
                    {...p}
                  >
                    {children}
                  </code>
                );
              }
              return (
                <code className={className} {...p}>
                  {children}
                </code>
              );
            },
            pre: ({ children }) => (
              <pre className="my-3 overflow-x-auto rounded-lg border border-fd-border bg-fd-muted/60 p-3 text-[0.82em] leading-relaxed">
                {children}
              </pre>
            ),
            ul: ({ children }) => (
              <ul className="my-2 ml-4 list-disc space-y-1 marker:text-teal-500">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="my-2 ml-4 list-decimal space-y-1 marker:text-teal-500">
                {children}
              </ol>
            ),
            h1: ({ children }) => (
              <h3 className="mt-3 text-base font-semibold">{children}</h3>
            ),
            h2: ({ children }) => (
              <h3 className="mt-3 text-base font-semibold">{children}</h3>
            ),
            h3: ({ children }) => (
              <h4 className="mt-3 text-sm font-semibold">{children}</h4>
            ),
            table: ({ children }) => (
              <div className="my-3 overflow-x-auto rounded-lg border border-fd-border">
                <table className="w-full text-xs">{children}</table>
              </div>
            ),
            th: ({ children }) => (
              <th className="border-b border-fd-border bg-fd-muted px-2 py-1 text-left font-semibold">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="border-b border-fd-border/50 px-2 py-1">{children}</td>
            ),
            p: ({ children }) => <p className="my-1.5">{children}</p>,
          }}
        >
          {content}
        </ReactMarkdown>
        {streaming && (
          <span className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-[2px] animate-pulse bg-teal-500" />
        )}
      </div>
      {citations && citations.length > 0 && <Citations items={citations} />}
    </div>
  );
}

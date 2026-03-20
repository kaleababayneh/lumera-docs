"use client";
import { type ComponentProps, useMemo, useState } from "react";
import { Check, ChevronDown, Copy, ExternalLink, FileText } from "lucide-react";
import { buttonVariants } from "fumadocs-ui/components/ui/button";

export function CopyMarkdownButton({
  markdownUrl,
  ...props
}: ComponentProps<"button"> & { markdownUrl: string }) {
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch(markdownUrl);
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      setChecked(true);
      setTimeout(() => setChecked(false), 2000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      disabled={loading}
      onClick={handleClick}
      {...props}
      className={buttonVariants({
        color: "secondary",
        size: "sm",
        className:
          "gap-2 px-3 py-1.5 text-sm [&_svg]:size-3.5 [&_svg]:text-fd-muted-foreground",
      })}
    >
      {checked ? <Check /> : <Copy />}
      Copy Markdown
    </button>
  );
}

export function OpenPopover({
  githubUrl,
  pageUrl,
}: {
  githubUrl?: string;
  pageUrl: string;
}) {
  const [open, setOpen] = useState(false);

  const items = useMemo(() => {
    const fullUrl =
      typeof window === "undefined"
        ? pageUrl
        : new URL(pageUrl, window.location.origin).toString();
    const q = `Read ${fullUrl}, I want to ask questions about it.`;

    return [
      githubUrl
        ? { title: "Open in GitHub", href: githubUrl, icon: <GithubIcon /> }
        : null,
      {
        title: "Open in ChatGPT",
        href: `https://chatgpt.com/?${new URLSearchParams({ hints: "search", q })}`,
        icon: <OpenAIIcon />,
      },
      {
        title: "Open in Claude",
        href: `https://claude.ai/new?${new URLSearchParams({ q })}`,
        icon: <ClaudeIcon />,
      },
    ].filter(Boolean) as { title: string; href: string; icon: React.ReactNode }[];
  }, [githubUrl, pageUrl]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className={buttonVariants({
          color: "secondary",
          size: "sm",
          className:
            "gap-2 px-3 py-1.5 text-sm [&_svg]:size-3.5 [&_svg]:text-fd-muted-foreground",
        })}
      >
        Open
        <ChevronDown />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 min-w-[200px] rounded-lg border bg-fd-popover p-1 shadow-lg">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-fd-popover-foreground transition-colors hover:bg-fd-accent"
            >
              <span className="[&_svg]:size-4">{item.icon}</span>
              {item.title}
              <ExternalLink className="ml-auto size-3 text-fd-muted-foreground" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function OpenAIIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
    </svg>
  );
}

function ClaudeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.709 15.955l4.72-2.756.08-.046 2.698-1.575c.073-.042.078-.144.01-.193a5.232 5.232 0 0 0-1.474-.755 4.188 4.188 0 0 0-3.6.335L4.71 12.548v3.407zm13.972-3.62c.044-.072.002-.166-.08-.175a5.18 5.18 0 0 0-1.656.027 4.188 4.188 0 0 0-2.776 2.166l-1.252 2.39-.042.079-2.469 4.714 3.408-.001 2.433-4.648.04-.078 1.242-2.374c.344-.657.78-1.493 1.152-2.1zM11.085 3.456c-.044-.072-.155-.076-.206-.007a5.19 5.19 0 0 0-.814 1.41 4.188 4.188 0 0 0 .776 3.834l2.454 2.998.08.098 4.084 4.992-.003-3.407L13.433 8.3l-.08-.098L11.085 3.456z" />
    </svg>
  );
}

import { source } from "@/lib/source";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { SidebarCollapseTrigger } from "fumadocs-ui/layouts/docs/sidebar";
import { SearchToggle } from "fumadocs-ui/components/layout/search-toggle";
import type { ReactNode } from "react";
import { baseOptions } from "../layout.config";
import { AskAi } from "@/components/ask-ai";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <AskAi>
      <DocsLayout
        tree={source.pageTree}
        {...baseOptions}
        nav={{
          ...baseOptions.nav,
          children: (
            <SidebarCollapseTrigger className="ms-auto max-md:hidden" />
          ),
        }}
        sidebar={{ collapsible: true }}
      >
        <div
          id="collapsed-floating-bar"
          className="fixed top-3 z-30 flex items-center gap-0.5 rounded-lg border p-1 max-md:hidden"
          style={{ insetInlineStart: "calc(var(--fd-layout-offset) + 0.5rem)" }}
        >
          <SidebarCollapseTrigger className="size-8 rounded-md" />
          <SearchToggle hideIfDisabled className="size-8 rounded-md" />
        </div>
        {children}
      </DocsLayout>
    </AskAi>
  );
}

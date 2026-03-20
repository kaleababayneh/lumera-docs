import { source } from "@/lib/source";
import {
  DocsPage,
  DocsBody,
  DocsDescription,
  DocsTitle,
} from "fumadocs-ui/page";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { CopyMarkdownButton, OpenPopover } from "@/lib/page-actions";

export default async function HomePage() {
  const page = source.getPage([]);
  if (!page) return null;

  const MDX = page.data.body;

  return (
    <DocsPage
      toc={page.data.toc}
      tableOfContent={{
        style: "clerk",
      }}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <div className="flex flex-row flex-wrap items-center gap-2 border-b border-fd-foreground/10 pb-6">
        <CopyMarkdownButton
          markdownUrl={`/api/mdx?path=${encodeURIComponent("content/docs/index.mdx")}`}
        />
        <OpenPopover
          githubUrl="https://github.com/kaleababayneh/lumera-docs/blob/main/content/docs/index.mdx"
          pageUrl="/docs"
        />
      </div>
      <DocsBody>
        <MDX components={{ ...defaultMdxComponents }} />
      </DocsBody>
    </DocsPage>
  );
}

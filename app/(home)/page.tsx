import { source } from "@/lib/source";
import {
  DocsPage,
  DocsBody,
  DocsDescription,
  DocsTitle,
} from "fumadocs-ui/page";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { Diagram } from "@/components/diagram";
import { YouTube } from "@/components/youtube";
import { Edit } from "lucide-react";
import { CopyMarkdownButton, OpenPopover } from "@/lib/page-actions";

const owner = "kaleababayneh";
const repo = "lumera-docs";
const filePath = "content/docs/index.mdx";
const editUrl = `https://github.com/${owner}/${repo}/edit/main/${filePath}`;
const githubUrl = `https://github.com/${owner}/${repo}/blob/main/${filePath}`;

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
      lastUpdate={page.data.lastModified}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className="mb-2">{page.data.description}</DocsDescription>
      <div className="flex flex-row flex-wrap items-center gap-2 border-b border-fd-foreground/10 pb-6">
        <CopyMarkdownButton
          markdownUrl={`/api/mdx?path=${encodeURIComponent(filePath)}`}
        />
        <OpenPopover
          githubUrl={githubUrl}
          pageUrl="/docs"
        />
      </div>
      <DocsBody>
        <MDX components={{ ...defaultMdxComponents, Diagram, YouTube }} />
      </DocsBody>
      <a
        href={editUrl}
        target="_blank"
        rel="noreferrer noopener"
        className="inline-flex items-center gap-1.5 text-sm text-fd-muted-foreground hover:text-fd-foreground transition-colors mt-6"
      >
        <Edit className="size-3.5" />
        Edit this page
      </a>
    </DocsPage>
  );
}

import { source } from "@/lib/source";
import {
  DocsPage,
  DocsBody,
  DocsDescription,
  DocsTitle,
} from "fumadocs-ui/page";
import { notFound } from "next/navigation";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { Diagram } from "@/components/diagram";
import { type Metadata } from "next";
import { CopyMarkdownButton, OpenPopover } from "@/lib/page-actions";

const owner = "kaleababayneh";
const repo = "lumera-docs";

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const filePath = `content/docs/${page.file.path}`;
  const githubUrl = `https://github.com/${owner}/${repo}/blob/main/${filePath}`;
  const pageSlug = params.slug?.join("/") ?? "";
  const pageUrl = `/docs${pageSlug ? `/${pageSlug}` : ""}`;

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      tableOfContent={{
        style: "clerk",
      }}
      lastUpdate={page.data.lastModified}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className="mb-2">{page.data.description}</DocsDescription>
      <div className="flex flex-row flex-wrap items-center gap-2 border-b border-fd-foreground/10 pb-6">
        <CopyMarkdownButton markdownUrl={`/api/mdx?path=${encodeURIComponent(filePath)}`} />
        <OpenPopover githubUrl={githubUrl} pageUrl={pageUrl} />
      </div>
      <DocsBody>
        <MDX components={{ ...defaultMdxComponents, Diagram }} />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}

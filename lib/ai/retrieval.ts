import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { source } from "@/lib/source";

export type DocChunk = {
  title: string;
  url: string;
  description?: string;
  content: string;
};

type CorpusEntry = {
  title: string;
  description: string;
  url: string;
  body: string;
  bodyLower: string;
  filePath: string;
};

let corpusCache: CorpusEntry[] | null = null;

async function loadCorpus(): Promise<CorpusEntry[]> {
  if (corpusCache) return corpusCache;

  const pages = source.getPages();
  const entries = await Promise.all(
    pages.map(async (page) => {
      const rel = (page.file?.path ?? "") as string;
      const full = join(process.cwd(), "content/docs", rel);
      let body = "";
      try {
        const raw = await readFile(full, "utf-8");
        body = raw.replace(/^---[\s\S]*?---\s*/m, "");
      } catch {
        body = (page.data.description as string) ?? "";
      }
      const title = (page.data.title as string) ?? page.url;
      const description = (page.data.description as string) ?? "";
      return {
        title,
        description,
        url: page.url,
        body,
        bodyLower: body.toLowerCase(),
        filePath: rel,
      };
    }),
  );

  corpusCache = entries;
  return entries;
}

const STOP = new Set([
  "the", "and", "for", "how", "what", "why", "can", "with",
  "this", "that", "you", "your", "are", "from", "into", "use",
  "using", "does", "did", "was", "were", "but", "not", "has",
  "have", "had", "a", "an", "is", "to", "of", "in", "on", "at",
]);

function tokenize(q: string): string[] {
  return q
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP.has(t));
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function retrieveDocs(
  query: string,
  topK = 5,
): Promise<DocChunk[]> {
  const corpus = await loadCorpus();
  const terms = tokenize(query);
  if (terms.length === 0) return [];

  const scored = corpus.map((e) => {
    const titleLower = e.title.toLowerCase();
    const descLower = e.description.toLowerCase();
    let score = 0;
    for (const t of terms) {
      if (titleLower.includes(t)) score += 12;
      if (descLower.includes(t)) score += 5;
      const rx = new RegExp(escapeRegExp(t), "g");
      const count = (e.bodyLower.match(rx) ?? []).length;
      score += Math.min(count, 6);
    }
    return { e, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored
    .filter((s) => s.score > 0)
    .slice(0, topK)
    .map(({ e }) => ({
      title: e.title,
      url: e.url,
      description: e.description || undefined,
      content: e.body.slice(0, 3200),
    }));
}

export function formatContextBlock(chunks: DocChunk[]): string {
  if (chunks.length === 0) {
    return "No documentation chunks matched the query. Answer from general knowledge but tell the user the docs don't cover it yet.";
  }
  return chunks
    .map((c, i) => {
      const head = `[${i + 1}] ${c.title} — ${c.url}`;
      const desc = c.description ? `\n${c.description}` : "";
      return `${head}${desc}\n\n${c.content}`;
    })
    .join("\n\n---\n\n");
}

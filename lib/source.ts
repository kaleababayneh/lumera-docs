import { docs } from "@/.source";
import { loader } from "fumadocs-core/source";
import type { PageTree } from "fumadocs-core/server";
import { createIcon } from "./icons";

export const source = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
  icon(icon) {
    return createIcon(icon);
  },
});

/**
 * Hosts we treat as "Lukso-only deployments". When the request comes in on
 * one of these, the docs layout swaps the full sidebar tree for a tree
 * containing only the Lukso section.
 *
 * Configurable via env so a preview deployment or a second custom domain
 * can be added without code changes. Comma-separated.
 */
export const LUKSO_HOSTS = new Set(
  (process.env.LUKSO_HOSTS ?? "lukso.lumera.help")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),
);

export function isLuksoHost(host: string | null | undefined): boolean {
  if (!host) return false;
  const bare = host.toLowerCase().split(":")[0] ?? "";
  return LUKSO_HOSTS.has(host.toLowerCase()) || LUKSO_HOSTS.has(bare);
}

const LUKSO_BASE_URL = "/docs/lukso";

/**
 * Reduce the full Fumadocs page tree to one that contains only the Lukso
 * section. The Lukso *folder* is kept intact (with its name, icon, and
 * collapsible header) and just becomes the single top-level child of the
 * sidebar tree. `defaultOpen` is forced so the section is expanded on
 * first paint instead of requiring the user to click the chevron.
 *
 * Falls back to the unfiltered tree if the Lukso folder can't be found
 * (e.g. someone removed the section). That's a safe fallback: the
 * Lukso-only host still resolves to /docs/lukso correctly via middleware,
 * and the sidebar would just show everything as before.
 */
export function buildLuksoTree(tree: PageTree.Root): PageTree.Root {
  const luksoFolder = findFolderByBaseUrl(tree.children, LUKSO_BASE_URL);
  if (!luksoFolder) return tree;

  return {
    name: tree.name,
    children: [{ ...luksoFolder, defaultOpen: true }],
  };
}

/**
 * Same shape as Lukso, but scoped to the Injective section. The host
 * defaults to `injective.lumera.help` and is overridable via the
 * `INJECTIVE_HOSTS` env var (comma-separated).
 */
export const INJECTIVE_HOSTS = new Set(
  (process.env.INJECTIVE_HOSTS ?? "injective.lumera.help")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),
);

export function isInjectiveHost(host: string | null | undefined): boolean {
  if (!host) return false;
  const bare = host.toLowerCase().split(":")[0] ?? "";
  return INJECTIVE_HOSTS.has(host.toLowerCase()) || INJECTIVE_HOSTS.has(bare);
}

const INJECTIVE_BASE_URL = "/docs/injective";

export function buildInjectiveTree(tree: PageTree.Root): PageTree.Root {
  const folder = findFolderByBaseUrl(tree.children, INJECTIVE_BASE_URL);
  if (!folder) return tree;

  return {
    name: tree.name,
    children: [{ ...folder, defaultOpen: true }],
  };
}

/**
 * Sections that live on their own scoped subdomains and should not appear
 * in the main docs sidebar. They stay in the underlying `source.pageTree`
 * (and therefore in `content/docs/meta.json` `pages[]`) so that the scoped
 * trees above can still find them — `findFolderByBaseUrl` walks the same
 * tree, and removing them at the source would make Lukso/Injective hosts
 * fall back to the unfiltered tree.
 */
const SCOPED_SECTION_BASE_URLS = [LUKSO_BASE_URL, INJECTIVE_BASE_URL];

/**
 * Reduce the full page tree to the one used by the main docs host
 * (everything except sections that live on their own subdomain). Used as
 * the default branch in `app/docs/layout.tsx` and the footer-neighbour
 * computation in `app/docs/[[...slug]]/page.tsx`, so the main-host sidebar
 * and the "next/previous" links stay scoped to the main content.
 */
export function buildMainTree(tree: PageTree.Root): PageTree.Root {
  return {
    name: tree.name,
    children: tree.children.filter((node) => {
      if (node.type !== "folder") return true;
      const url = node.index?.url;
      return !SCOPED_SECTION_BASE_URLS.some(
        (base) => url === base || url?.startsWith(`${base}/`),
      );
    }),
  };
}

function findFolderByBaseUrl(
  nodes: PageTree.Node[],
  baseUrl: string,
): PageTree.Folder | undefined {
  for (const node of nodes) {
    if (node.type !== "folder") continue;
    if (node.index?.url === baseUrl) return node;
    if (node.index?.url?.startsWith(`${baseUrl}/`)) return node;
    const nested = findFolderByBaseUrl(node.children, baseUrl);
    if (nested) return nested;
  }
  return undefined;
}

/**
 * Compute previous/next-page neighbours for the docs Footer, deduping
 * entries that share a URL.
 *
 * Why: when a folder lists `"index"` in its `meta.json` `pages[]`, the same
 * page ends up in the page tree twice — once as `folder.index` (the section
 * root, also the target of the folder's clickable header) and once as a
 * child Page (the sidebar item under the folder). Fumadocs's default
 * Footer flattens those into a sequential list and finds neighbours by
 * index, so the section root's "next" resolves to the duplicate (same
 * URL), making the next-page button link back to the current page.
 *
 * Removing `"index"` from `pages[]` would delete the sidebar child entry,
 * which we want to keep. Instead, dedupe inside the navigation list only:
 * the sidebar still renders both entries, but the Footer skips the
 * duplicate and advances to the genuine next sibling.
 */
export type FooterItem = { name: string; url: string };

export function findNeighboursDeduped(
  tree: PageTree.Root,
  url: string,
): { previous?: FooterItem; next?: FooterItem } {
  const list: FooterItem[] = [];
  const seen = new Set<string>();
  const push = (item: PageTree.Item): void => {
    if (seen.has(item.url)) return;
    seen.add(item.url);
    list.push({ name: itemName(item), url: item.url });
  };
  const walk = (nodes: PageTree.Node[]): void => {
    for (const node of nodes) {
      if (node.type === "folder") {
        if (node.index) push(node.index);
        walk(node.children);
      } else if (node.type === "page" && !node.external) {
        push(node);
      }
    }
  };
  walk(tree.children);
  const idx = list.findIndex((item) => item.url === url);
  if (idx === -1) return {};
  return { previous: list[idx - 1], next: list[idx + 1] };
}

function itemName(item: PageTree.Item): string {
  // Frontmatter titles always come through as strings; the ReactNode type on
  // PageTree.Item.name is the broader theoretical surface. Fall back through
  // toString() rather than rendering, since the Footer is a Server Component.
  return typeof item.name === "string" ? item.name : String(item.name ?? "");
}

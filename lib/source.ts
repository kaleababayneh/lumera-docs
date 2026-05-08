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
 * section, with the Lukso folder's children promoted to the root so the
 * sidebar reads as a Lukso-only docs site (no parent folder grouping).
 *
 * Falls back to the unfiltered tree if the Lukso folder can't be found
 * (e.g. someone removed the section). That's a safe fallback: the
 * Lukso-only host still resolves to /docs/lukso correctly via middleware,
 * and the sidebar would just show everything as before.
 */
export function buildLuksoTree(tree: PageTree.Root): PageTree.Root {
  const luksoFolder = findLuksoFolder(tree.children);
  if (!luksoFolder) return tree;

  const seen = new Set<string>();
  const out: PageTree.Node[] = [];
  if (luksoFolder.index) {
    out.push(luksoFolder.index);
    seen.add(luksoFolder.index.url);
  }
  for (const child of luksoFolder.children) {
    if (child.type === "page" && seen.has(child.url)) continue;
    out.push(child);
  }

  return {
    name: luksoFolder.name,
    children: out,
  };
}

function findLuksoFolder(nodes: PageTree.Node[]): PageTree.Folder | undefined {
  for (const node of nodes) {
    if (node.type !== "folder") continue;
    if (node.index?.url === LUKSO_BASE_URL) return node;
    if (node.index?.url?.startsWith(`${LUKSO_BASE_URL}/`)) return node;
    const nested = findLuksoFolder(node.children);
    if (nested) return nested;
  }
  return undefined;
}

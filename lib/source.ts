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
  const luksoFolder = findLuksoFolder(tree.children);
  if (!luksoFolder) return tree;

  return {
    name: tree.name,
    children: [{ ...luksoFolder, defaultOpen: true }],
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

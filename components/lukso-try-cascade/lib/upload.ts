"use client";

import { keccak256 } from "viem";

const API = "https://api.lumera.help";

export type CascadeUpload = {
  url: string;
  hash: `0x${string}`;
  meta: {
    action_id: string;
    tx_hash?: string;
    block_height?: number;
    task_id?: string;
    filename?: string;
    size_bytes?: number;
  };
};

/**
 * Browser-direct upload to cascade-api using the public docs key.
 *
 * The `NEXT_PUBLIC_CASCADE_API_KEY` is intentionally exposed to the
 * client bundle: cascade-api supports per-key quotas, and this key is
 * meant for in-docs interactive demos. If it gets abused, the operator
 * rotates it. See the comment in `.env.local` for the rotation procedure.
 */
export async function uploadToCascade(
  file: Blob,
  fileName: string,
): Promise<CascadeUpload> {
  const apiKey = process.env.NEXT_PUBLIC_CASCADE_API_KEY ?? "";
  if (!apiKey) throw new Error("NEXT_PUBLIC_CASCADE_API_KEY not configured");

  const bytes = new Uint8Array(await file.arrayBuffer());
  const hash = keccak256(bytes) as `0x${string}`;

  const form = new FormData();
  form.append("file", file, fileName);

  const res = await fetch(`${API}/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`cascade-api ${res.status}: ${text.slice(0, 200)}`);
  }

  const meta = (await res.json()) as CascadeUpload["meta"];
  if (!meta.action_id) {
    throw new Error("cascade-api response missing action_id");
  }
  return {
    url: `${API}/download/${encodeURIComponent(String(meta.action_id))}`,
    hash,
    meta: { ...meta, action_id: String(meta.action_id) },
  };
}

export async function uploadJSONToCascade(
  value: unknown,
  fileName: string,
): Promise<CascadeUpload> {
  const blob = new Blob([JSON.stringify(value)], { type: "application/json" });
  return uploadToCascade(blob, fileName);
}

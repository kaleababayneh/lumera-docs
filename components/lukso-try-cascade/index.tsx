"use client";

import { useState } from "react";
import {
  Wallet,
  ImagePlus,
  PaintBucket,
  Sparkles,
  Plus,
  X,
  ExternalLink,
  Check,
} from "lucide-react";
import { connectUP, setUPData } from "./lib/wallet";
import { buildProfile, detectFileType } from "./lib/lsp3";
import { encodeLSP3Profile } from "./lib/encode";
import { resizeImage } from "./lib/resize";
import {
  uploadToCascade,
  uploadJSONToCascade,
  type CascadeUpload,
} from "./lib/upload";

type LedgerEntry = {
  kind: "profile" | "background" | "avatar" | "lsp3-json";
  label: string;
  fileName: string;
  bytes: number;
  url: string;
  hash: `0x${string}`;
  actionId: string;
  txHash?: string;
  blockHeight?: number;
};

const PROFILE_SIZES = [256, 512, 1024] as const;

function ledgerFromUpload(
  kind: LedgerEntry["kind"],
  label: string,
  fileName: string,
  bytes: number,
  r: CascadeUpload,
): LedgerEntry {
  return {
    kind,
    label,
    fileName,
    bytes,
    url: r.url,
    hash: r.hash,
    actionId: r.meta.action_id,
    txHash: r.meta.tx_hash,
    blockHeight: r.meta.block_height,
  };
}

export function LuksoTryCascade() {
  const [account, setAccount] = useState<`0x${string}` | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("lumera, cascade");
  const [links, setLinks] = useState<{ title: string; url: string }[]>([]);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);

  const append = (line: string) => setLog((l) => [...l, line]);
  const recordUpload = (entry: LedgerEntry) => setLedger((l) => [...l, entry]);

  async function onConnect() {
    try {
      setBusy(true);
      const a = await connectUP();
      setAccount(a);
      append(`Connected as ${a}`);
    } catch (err) {
      append(`Error: ${(err as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!account) return;
    setBusy(true);
    setTxHash(null);
    setLedger([]);
    setLog([]);
    try {
      const profileImage: {
        width: number;
        height: number;
        url: string;
        verification: { method: "keccak256(bytes)"; data: `0x${string}` };
      }[] = [];
      if (profileFile) {
        append(
          `Resizing profile image to ${PROFILE_SIZES.join("/")}px + source…`,
        );
        const variants = await resizeImage(profileFile, [...PROFILE_SIZES]);
        for (const v of variants) {
          const fileName = `profile-${v.width}.jpg`;
          append(`Uploading ${fileName} (${(v.blob.size / 1024).toFixed(1)} KB)…`);
          const r = await uploadToCascade(v.blob, fileName);
          recordUpload(
            ledgerFromUpload("profile", `${v.width}×${v.height}`, fileName, v.blob.size, r),
          );
          profileImage.push({
            width: v.width,
            height: v.height,
            url: r.url,
            verification: { method: "keccak256(bytes)", data: r.hash },
          });
        }
      }

      const backgroundImage: {
        width: number;
        height: number;
        url: string;
        verification: { method: "keccak256(bytes)"; data: `0x${string}` };
      }[] = [];
      if (backgroundFile) {
        const bm = await createImageBitmap(backgroundFile);
        append(
          `Uploading background ${bm.width}×${bm.height} (${(backgroundFile.size / 1024).toFixed(1)} KB)…`,
        );
        const r = await uploadToCascade(backgroundFile, backgroundFile.name);
        recordUpload(
          ledgerFromUpload(
            "background",
            `${bm.width}×${bm.height}`,
            backgroundFile.name,
            backgroundFile.size,
            r,
          ),
        );
        backgroundImage.push({
          width: bm.width,
          height: bm.height,
          url: r.url,
          verification: { method: "keccak256(bytes)", data: r.hash },
        });
      }

      const avatar: {
        hashFunction: "keccak256(bytes)";
        hash: `0x${string}`;
        url: string;
        fileType: string;
      }[] = [];
      if (avatarFile) {
        const fileType = detectFileType(avatarFile);
        append(
          `Uploading avatar ${avatarFile.name} (.${fileType}, ${(avatarFile.size / 1024).toFixed(1)} KB)…`,
        );
        const r = await uploadToCascade(avatarFile, avatarFile.name);
        recordUpload(
          ledgerFromUpload("avatar", `.${fileType}`, avatarFile.name, avatarFile.size, r),
        );
        avatar.push({
          hashFunction: "keccak256(bytes)",
          hash: r.hash,
          url: r.url,
          fileType,
        });
      }

      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const cleanLinks = links
        .map(({ title, url }) => ({ title: title.trim(), url: url.trim() }))
        .filter((l) => l.title && l.url);

      const profile = buildProfile({
        name,
        description,
        links: cleanLinks,
        tags,
        profileImage,
        backgroundImage,
        avatar,
      });

      append("Uploading LSP-3 JSON to Cascade…");
      const jsonResult = await uploadJSONToCascade(profile, `${account}-lsp3.json`);
      const jsonBytes = new Blob([JSON.stringify(profile)]).size;
      recordUpload(
        ledgerFromUpload("lsp3-json", "metadata", `${account}-lsp3.json`, jsonBytes, jsonResult),
      );

      append("Encoding VerifiableURI with erc725.js…");
      const { key, value } = encodeLSP3Profile(account, profile, jsonResult.url);
      append("Calling setData on the Universal Profile…");
      const tx = await setUPData(account, key, value);
      setTxHash(tx);
      append(`tx = ${tx}`);
      append("Done. View on universalprofile.cloud once the tx confirms.");
    } catch (err) {
      append(`Error: ${(err as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  const totalBytes = ledger.reduce((sum, e) => sum + e.bytes, 0);

  const inputCls =
    "w-full rounded-md border border-fd-border bg-fd-secondary px-3 py-2 text-sm outline-none transition-colors placeholder:text-fd-muted-foreground focus:border-fd-primary disabled:opacity-50";
  const labelCls =
    "mb-1.5 block text-xs font-medium uppercase tracking-wide text-fd-muted-foreground";

  return (
    <div className="not-prose space-y-4">
      <div className="rounded-lg border border-fd-border bg-fd-card p-6">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
          <Wallet className="size-4 text-fd-primary" />
          Wallet
        </h3>
        {account ? (
          <p className="text-xs text-fd-muted-foreground">
            Connected:{" "}
            <span className="font-mono text-fd-foreground">{account}</span>
          </p>
        ) : (
          <button
            onClick={onConnect}
            disabled={busy}
            className="rounded-md bg-fd-primary px-3 py-2 text-sm font-medium text-fd-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Connect Universal Profile
          </button>
        )}
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="rounded-lg border border-fd-border bg-fd-card p-6">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="size-4 text-fd-primary" />
            Profile
          </h3>

          <div className="space-y-3">
            <div>
              <label htmlFor="lukso-name" className={labelCls}>Name</label>
              <input
                id="lukso-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={!account || busy}
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="lukso-description" className={labelCls}>Description</label>
              <textarea
                id="lukso-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={!account || busy}
                rows={3}
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="lukso-tags" className={labelCls}>Tags (comma-separated)</label>
              <input
                id="lukso-tags"
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="lumera, cascade, devrel"
                disabled={!account || busy}
                className={inputCls}
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-fd-border bg-fd-card p-6">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <ExternalLink className="size-4 text-fd-primary" />
            Links
          </h3>
          <div className="space-y-2">
            {links.map((link, i) => (
              <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-2">
                <input
                  type="text"
                  placeholder="Title (e.g. X, GitHub)"
                  value={link.title}
                  onChange={(e) => {
                    const next = [...links];
                    next[i] = { ...next[i]!, title: e.target.value };
                    setLinks(next);
                  }}
                  disabled={!account || busy}
                  className={inputCls}
                />
                <input
                  type="url"
                  placeholder="https://…"
                  value={link.url}
                  onChange={(e) => {
                    const next = [...links];
                    next[i] = { ...next[i]!, url: e.target.value };
                    setLinks(next);
                  }}
                  disabled={!account || busy}
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={() => setLinks(links.filter((_, j) => j !== i))}
                  disabled={!account || busy}
                  aria-label="Remove link"
                  className="inline-flex size-9 items-center justify-center rounded-md border border-fd-border text-fd-muted-foreground transition-colors hover:bg-fd-accent disabled:opacity-40"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setLinks([...links, { title: "", url: "" }])}
              disabled={!account || busy}
              className="inline-flex items-center gap-1.5 rounded-md border border-fd-border bg-fd-secondary px-3 py-1.5 text-xs font-medium text-fd-secondary-foreground transition-colors hover:bg-fd-accent disabled:opacity-40"
            >
              <Plus className="size-3.5" />
              Add link
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-fd-border bg-fd-card p-6">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <ImagePlus className="size-4 text-fd-primary" />
            Media (uploaded to Cascade)
          </h3>
          <div className="space-y-3">
            <div>
              <label htmlFor="lukso-profile-img" className={labelCls}>
                Profile image — resized to 256/512/1024 + source
              </label>
              <input
                id="lukso-profile-img"
                type="file"
                accept="image/*"
                onChange={(e) => setProfileFile(e.target.files?.[0] ?? null)}
                disabled={!account || busy}
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="lukso-bg" className={labelCls}>
                Background image (uploaded as-is)
              </label>
              <input
                id="lukso-bg"
                type="file"
                accept="image/*"
                onChange={(e) => setBackgroundFile(e.target.files?.[0] ?? null)}
                disabled={!account || busy}
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="lukso-avatar" className={labelCls}>
                3D avatar (.vrm, .glb, .gltf) or image fallback
              </label>
              <input
                id="lukso-avatar"
                type="file"
                accept=".vrm,.glb,.gltf,.fbx,image/*"
                onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
                disabled={!account || busy}
                className={inputCls}
              />
              <p className="mt-1 text-xs text-fd-muted-foreground">
                Renders in WebGL on universaleverything.io.
              </p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={!account || busy || !name}
          className="w-full rounded-md bg-fd-primary px-4 py-2.5 text-sm font-semibold text-fd-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? (
            <span className="inline-flex items-center gap-2">
              <span className="size-3.5 animate-spin rounded-full border-2 border-fd-primary-foreground/30 border-t-fd-primary-foreground" />
              Working…
            </span>
          ) : (
            "Save to Cascade"
          )}
        </button>
      </form>

      {ledger.length > 0 && (
        <div className="rounded-lg border border-fd-border bg-fd-card p-6">
          <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold">
            <PaintBucket className="size-4 text-fd-primary" />
            Cascade ledger
          </h3>
          <p className="mb-3 text-xs text-fd-muted-foreground">
            {ledger.length} file{ledger.length === 1 ? "" : "s"} uploaded ·{" "}
            {(totalBytes / 1024).toFixed(1)} KB total · each row is its own
            on-chain action on lumera-testnet-2
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-fd-muted-foreground">
                <tr>
                  <th className="border-b border-fd-border px-2 py-1.5 font-medium uppercase">Kind</th>
                  <th className="border-b border-fd-border px-2 py-1.5 font-medium uppercase">Detail</th>
                  <th className="border-b border-fd-border px-2 py-1.5 font-medium uppercase">Size</th>
                  <th className="border-b border-fd-border px-2 py-1.5 font-medium uppercase">action_id</th>
                  <th className="border-b border-fd-border px-2 py-1.5 font-medium uppercase">tx_hash</th>
                  <th className="border-b border-fd-border px-2 py-1.5 font-medium uppercase">URL</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((e, i) => (
                  <tr key={i} className="text-fd-foreground">
                    <td className="border-b border-fd-border/40 px-2 py-1.5">{e.kind}</td>
                    <td className="border-b border-fd-border/40 px-2 py-1.5 text-fd-muted-foreground">
                      {e.label} · {e.fileName}
                    </td>
                    <td className="border-b border-fd-border/40 px-2 py-1.5">{(e.bytes / 1024).toFixed(1)} KB</td>
                    <td className="border-b border-fd-border/40 px-2 py-1.5 font-mono">{e.actionId}</td>
                    <td className="border-b border-fd-border/40 px-2 py-1.5 font-mono">
                      {e.txHash ? (
                        <a
                          href={`https://explorer.lumera.io/lumera-testnet-2/tx/${e.txHash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-fd-primary hover:underline"
                        >
                          {e.txHash.slice(0, 8)}…
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="border-b border-fd-border/40 px-2 py-1.5">
                      <a
                        href={e.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-fd-primary hover:underline"
                      >
                        open ↗
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {log.length > 0 && (
        <pre className="rounded-md border border-fd-border bg-fd-secondary p-3 text-xs whitespace-pre-wrap break-words font-mono text-fd-muted-foreground">
          {log.join("\n")}
        </pre>
      )}

      {txHash && account && (
        <div className="flex flex-wrap items-center gap-3 rounded-md border border-fd-primary/20 bg-fd-primary/5 px-4 py-3 text-sm">
          <Check className="size-4 text-fd-primary" />
          <span className="text-fd-foreground">Profile updated.</span>
          <a
            href={`https://universalprofile.cloud/${account}`}
            target="_blank"
            rel="noreferrer"
            className="text-fd-primary hover:underline"
          >
            View on universalprofile.cloud →
          </a>
          <a
            href={`https://universaleverything.io/${account}`}
            target="_blank"
            rel="noreferrer"
            className="text-fd-primary hover:underline"
          >
            View on universaleverything.io →
          </a>
        </div>
      )}
    </div>
  );
}

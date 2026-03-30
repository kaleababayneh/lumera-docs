"use client";

import { useState, useRef, useCallback } from "react";

const BACKEND_URL = "https://lumerapp.up.railway.app";

import {
  Upload,
  Download,
  Copy,
  Check,
  ExternalLink,
  FileUp,
} from "lucide-react";

export function StorageApp() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <UploadCard />
      <DownloadCard />
    </div>
  );
}

function UploadCard() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<{
    type: "idle" | "loading" | "success" | "error";
    message: string;
  }>({ type: "idle", message: "" });
  const [result, setResult] = useState<{
    actionId: string;
    explorerUrl: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback((f: File) => {
    setFile(f);
    setResult(null);
    setStatus({ type: "idle", message: "" });
  }, []);

  const upload = async () => {
    if (!file) return;
    setStatus({
      type: "loading",
      message:
        "Uploading to Lumera blockchain... This may take up to a minute.",
    });
    setResult(null);

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch(`${BACKEND_URL}/api/upload`, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setResult({ actionId: data.actionId, explorerUrl: data.explorerUrl });
      setStatus({ type: "success", message: "Upload successful!" });
    } catch (err: any) {
      setStatus({ type: "error", message: err.message });
    }
  };

  const copyId = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.actionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-fd-border bg-fd-card p-6">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
        <Upload className="size-4 text-fd-primary" />
        Upload Document
      </h3>

      <div
        className={`cursor-pointer rounded-md border-2 border-dashed p-8 text-center transition-colors ${
          dragOver
            ? "border-fd-primary bg-fd-accent"
            : "border-fd-border hover:border-fd-primary/50"
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) handleFile(e.target.files[0]);
          }}
        />
        <FileUp className="mx-auto mb-2 size-8 text-fd-muted-foreground" />
        <p className="text-xs text-fd-muted-foreground">
          Drag & drop or{" "}
          <span className="text-fd-primary underline">browse files</span>
        </p>
      </div>

      {file && (
        <div className="mt-3 rounded-md bg-fd-secondary px-3 py-2 text-xs">
          {file.name}{" "}
          <span className="text-fd-muted-foreground">
            ({(file.size / 1024).toFixed(1)} KB)
          </span>
        </div>
      )}

      <button
        onClick={upload}
        disabled={!file || status.type === "loading"}
        className="mt-3 w-full rounded-md bg-fd-primary px-3 py-2 text-sm font-medium text-fd-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {status.type === "loading" ? (
          <span className="inline-flex items-center gap-2">
            <span className="size-3.5 animate-spin rounded-full border-2 border-fd-primary-foreground/30 border-t-fd-primary-foreground" />
            Uploading...
          </span>
        ) : (
          "Upload to Lumera"
        )}
      </button>

      <StatusMessage status={status} />

      {result && (
        <div className="mt-3 rounded-md border border-fd-primary/20 bg-fd-primary/5 p-4">
          <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-fd-primary">
            Action ID
          </p>
          <p className="font-mono text-lg font-bold">{result.actionId}</p>
          <div className="mt-2 flex items-center gap-3">
            <button
              onClick={copyId}
              className="inline-flex items-center gap-1 rounded-md bg-fd-secondary px-2.5 py-1 text-xs font-medium text-fd-secondary-foreground transition-colors hover:bg-fd-accent"
            >
              {copied ? (
                <Check className="size-3" />
              ) : (
                <Copy className="size-3" />
              )}
              {copied ? "Copied" : "Copy"}
            </button>
            <a
              href={result.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-fd-muted-foreground transition-colors hover:text-fd-foreground"
            >
              <ExternalLink className="size-3" />
              Explorer
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function DownloadCard() {
  const [actionId, setActionId] = useState("");
  const [status, setStatus] = useState<{
    type: "idle" | "loading" | "success" | "error";
    message: string;
  }>({ type: "idle", message: "" });

  const download = async () => {
    const id = actionId.trim();
    if (!id) {
      setStatus({ type: "error", message: "Please enter an Action ID" });
      return;
    }

    setStatus({
      type: "loading",
      message: "Retrieving file from decentralized storage...",
    });

    try {
      const res = await fetch(`${BACKEND_URL}/api/download/${encodeURIComponent(id)}`);
      if (!res.ok) {
        const err = await res
          .json()
          .catch(() => ({ error: "Download failed" }));
        throw new Error(err.error || "Download failed");
      }

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") || "";
      const match = disposition.match(/filename="?(.+?)"?$/);
      const filename = match ? match[1] : `lumera-${id}`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setStatus({
        type: "success",
        message: `Downloaded (${(blob.size / 1024).toFixed(1)} KB)`,
      });
    } catch (err: any) {
      setStatus({ type: "error", message: err.message });
    }
  };

  return (
    <div className="rounded-lg border border-fd-border bg-fd-card p-6">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
        <Download className="size-4 text-fd-primary" />
        Download Document
      </h3>

      <input
        type="text"
        value={actionId}
        onChange={(e) => setActionId(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && download()}
        placeholder="Enter your Action ID (e.g. 13475)"
        className="w-full rounded-md border border-fd-border bg-fd-secondary px-3 py-2 text-sm outline-none transition-colors placeholder:text-fd-muted-foreground focus:border-fd-primary"
      />

      <button
        onClick={download}
        disabled={status.type === "loading"}
        className="mt-3 w-full rounded-md bg-fd-primary px-3 py-2 text-sm font-medium text-fd-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {status.type === "loading" ? (
          <span className="inline-flex items-center gap-2">
            <span className="size-3.5 animate-spin rounded-full border-2 border-fd-primary-foreground/30 border-t-fd-primary-foreground" />
            Downloading...
          </span>
        ) : (
          "Download"
        )}
      </button>

      <StatusMessage status={status} />
    </div>
  );
}

function StatusMessage({
  status,
}: {
  status: { type: string; message: string };
}) {
  if (status.type === "idle") return null;

  const styles: Record<string, string> = {
    loading: "bg-fd-secondary text-fd-muted-foreground",
    success: "bg-fd-primary/10 text-fd-primary",
    error: "bg-red-500/10 text-red-400",
  };

  return (
    <div
      className={`mt-3 rounded-md px-3 py-2 text-xs ${styles[status.type]}`}
    >
      {status.message}
    </div>
  );
}

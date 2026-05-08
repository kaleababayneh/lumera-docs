"use client";

export type ResizedVariant = {
  width: number;
  height: number;
  blob: Blob;
};

const SOURCE_VARIANT_TOLERANCE = 32;

export async function resizeImage(
  file: File,
  sizes: number[],
  mime: "image/jpeg" | "image/png" | "image/webp" = "image/jpeg",
): Promise<ResizedVariant[]> {
  const bitmap = await createImageBitmap(file);
  const minSrc = Math.min(bitmap.width, bitmap.height);
  const sx = (bitmap.width - minSrc) / 2;
  const sy = (bitmap.height - minSrc) / 2;

  const out: ResizedVariant[] = [];
  for (const size of sizes) {
    if (size > minSrc) continue;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D canvas unsupported");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, sx, sy, minSrc, minSrc, 0, 0, size, size);
    const blob: Blob = await new Promise((resolve, reject) =>
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("toBlob returned null"))),
        mime,
        0.92,
      ),
    );
    out.push({ width: size, height: size, blob });
  }

  if (!sizes.some((s) => Math.abs(s - minSrc) <= SOURCE_VARIANT_TOLERANCE)) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = minSrc;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D canvas unsupported");
    ctx.drawImage(bitmap, sx, sy, minSrc, minSrc, 0, 0, minSrc, minSrc);
    const blob: Blob = await new Promise((resolve, reject) =>
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("toBlob returned null"))),
        mime,
        0.95,
      ),
    );
    out.push({ width: minSrc, height: minSrc, blob });
  }
  return out;
}

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.LUMERA_BACKEND_URL || "http://localhost:3001";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ actionId: string }> },
) {
  try {
    const { actionId } = await params;

    const res = await fetch(
      `${BACKEND_URL}/api/download/${encodeURIComponent(actionId)}`,
    );

    if (!res.ok) {
      const err = await res
        .json()
        .catch(() => ({ error: "Download failed" }));
      return NextResponse.json(
        { error: err.error || "Download failed" },
        { status: res.status },
      );
    }

    const arrayBuffer = await res.arrayBuffer();
    const disposition = res.headers.get("Content-Disposition") || "";

    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition":
          disposition || `attachment; filename="lumera-${actionId}"`,
      },
    });
  } catch (err: any) {
    console.error("Download proxy error:", err);
    return NextResponse.json(
      { error: err.message || "Download failed" },
      { status: 500 },
    );
  }
}

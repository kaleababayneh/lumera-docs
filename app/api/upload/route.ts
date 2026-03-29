import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.LUMERA_BACKEND_URL || "http://localhost:3001";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const res = await fetch(`${BACKEND_URL}/api/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.error || "Upload failed" },
        { status: res.status },
      );
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Upload proxy error:", err);
    return NextResponse.json(
      { error: err.message || "Upload failed" },
      { status: 500 },
    );
  }
}

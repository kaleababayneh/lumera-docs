export const runtime = "nodejs";

const ADDRESS_PATTERN = /^lumera[0-9a-z]{30,}$/;

type Body = { address?: string };

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const address = body.address?.trim();
  if (!address || !ADDRESS_PATTERN.test(address)) {
    return Response.json({ error: "Invalid Lumera address" }, { status: 400 });
  }

  const endpoint = process.env.FAUCET_API_URL;
  if (!endpoint) {
    return Response.json(
      { error: "Faucet is not configured (FAUCET_API_URL missing)" },
      { status: 503 },
    );
  }

  try {
    const upstream = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.FAUCET_API_KEY
          ? { Authorization: `Bearer ${process.env.FAUCET_API_KEY}` }
          : {}),
      },
      body: JSON.stringify({ address, amount: "0.25", denom: "LUME" }),
    });

    const data = (await upstream.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;

    if (!upstream.ok) {
      const msg =
        (typeof data.error === "string" && data.error) ||
        (typeof data.message === "string" && data.message) ||
        `Faucet upstream responded ${upstream.status}`;
      return Response.json({ error: msg }, { status: upstream.status });
    }

    return Response.json({
      txHash: typeof data.txHash === "string" ? data.txHash : undefined,
      amount:
        typeof data.amount === "string" ? data.amount : "0.25 LUME",
    });
  } catch (err) {
    console.error("[faucet] upstream error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Faucet request failed" },
      { status: 502 },
    );
  }
}

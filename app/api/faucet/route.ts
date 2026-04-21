export const runtime = "nodejs";

const FAUCET_ENDPOINT = "https://lumerapp.up.railway.app/api/faucet";
const ADDRESS_PATTERN = /^lumera1[a-z0-9]{38,58}$/;

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

  try {
    const upstream = await fetch(FAUCET_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address }),
    });

    const data = (await upstream.json().catch(() => ({}))) as {
      txHash?: string;
      amount?: string;
      to?: string;
      explorerUrl?: string;
      error?: string;
      retryAfterHours?: number;
      retryAfterMinutes?: number;
    };

    if (!upstream.ok) {
      const raw = data.error ?? `Faucet upstream responded ${upstream.status}`;
      const friendly = /bech32|invalid checksum|invalid to address|decoding bech32/i.test(
        raw,
      )
        ? "Invalid Lumera address — the checksum doesn't match. Double-check the address and try again."
        : raw;
      return Response.json(
        {
          error: friendly,
          retryAfterHours: data.retryAfterHours,
          retryAfterMinutes: data.retryAfterMinutes,
        },
        { status: upstream.status },
      );
    }

    return Response.json({
      txHash: data.txHash,
      amount: data.amount ?? "0.25 LUME",
      explorerUrl: data.explorerUrl,
    });
  } catch (err) {
    console.error("[faucet] upstream error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Faucet request failed" },
      { status: 502 },
    );
  }
}

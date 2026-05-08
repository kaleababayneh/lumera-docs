"use client";

import { ERC725 } from "@erc725/erc725.js";
import LSP3ProfileSchema from "@erc725/erc725.js/schemas/LSP3ProfileMetadata.json";
import type { LSP3ProfileJSON } from "./lsp3";

const LUKSO_RPC =
  process.env.NEXT_PUBLIC_LUKSO_RPC ?? "https://rpc.mainnet.lukso.network";

export function encodeLSP3Profile(
  profileAddress: `0x${string}`,
  json: LSP3ProfileJSON,
  url: string,
): { key: `0x${string}`; value: `0x${string}` } {
  const erc725 = new ERC725(
    LSP3ProfileSchema as never,
    profileAddress,
    LUKSO_RPC,
  );
  const encoded = erc725.encodeData([
    { keyName: "LSP3Profile", value: { json, url } },
  ]);
  return {
    key: encoded.keys[0] as `0x${string}`,
    value: encoded.values[0] as `0x${string}`,
  };
}

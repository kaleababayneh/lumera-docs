"use client";

import { createWalletClient, custom, parseAbi } from "viem";
import { lukso } from "viem/chains";

declare global {
  interface Window {
    lukso?: import("viem").EIP1193Provider;
  }
}

const UP_ABI = parseAbi([
  "function setData(bytes32 dataKey, bytes dataValue) external payable",
]);

export async function connectUP(): Promise<`0x${string}`> {
  if (!window.lukso) {
    throw new Error(
      "Universal Profile Browser Extension not found. Install from https://my.universalprofile.cloud",
    );
  }
  const client = createWalletClient({
    chain: lukso,
    transport: custom(window.lukso),
  });
  const [account] = await client.requestAddresses();
  if (!account) throw new Error("No account returned by UP extension");
  return account;
}

export async function setUPData(
  upAddress: `0x${string}`,
  key: `0x${string}`,
  value: `0x${string}`,
): Promise<`0x${string}`> {
  if (!window.lukso) throw new Error("UP extension not available");
  const client = createWalletClient({
    chain: lukso,
    transport: custom(window.lukso),
  });
  return client.writeContract({
    account: upAddress,
    address: upAddress,
    abi: UP_ABI,
    functionName: "setData",
    args: [key, value],
  });
}

/* eslint-disable @typescript-eslint/no-require-imports */

// Polyfill import.meta.url for CJS context - the SDK's WASM loader needs it
if (typeof (globalThis as any).importMetaUrl === "undefined") {
  (globalThis as any).importMetaUrl = `file://${__filename}`;
}

const MNEMONIC =
  "donate rib remove mansion convince around room bottom credit man fancy toast";

let clientPromise: Promise<any> | null = null;

export function getLumeraClient() {
  if (!clientPromise) {
    clientPromise = initClient();
  }
  return clientPromise;
}

async function initClient() {
  // Dynamic import to defer ESM resolution to runtime where
  // serverExternalPackages ensures Node handles it natively.
  const { EventSource } = await import("eventsource");
  (globalThis as any).EventSource = EventSource;

  const { createLumeraClient } = await import("@0xkaleab/sdk-js");
  const { DirectSecp256k1HdWallet } = await import("@cosmjs/proto-signing");
  const { Secp256k1HdWallet, makeSignDoc: makeAminoSignDoc } = await import(
    "@cosmjs/amino"
  );

  const directWallet = await DirectSecp256k1HdWallet.fromMnemonic(MNEMONIC, {
    prefix: "lumera",
  });
  const aminoWallet = await Secp256k1HdWallet.fromMnemonic(MNEMONIC, {
    prefix: "lumera",
  });
  const [account] = await directWallet.getAccounts();

  const signer = {
    getAccounts: () => directWallet.getAccounts(),
    signDirect: (addr: string, doc: any) =>
      directWallet.signDirect(addr, doc),
    signAmino: (addr: string, doc: any) => aminoWallet.signAmino(addr, doc),
    async signArbitrary(
      _chainId: string,
      signerAddress: string,
      data: string,
    ) {
      const signDoc = makeAminoSignDoc(
        [
          {
            type: "sign/MsgSignData",
            value: {
              signer: signerAddress,
              data: Buffer.from(data).toString("base64"),
            },
          },
        ],
        { gas: "0", amount: [] },
        "",
        "",
        0,
        0,
      );
      const { signature } = await aminoWallet.signAmino(
        signerAddress,
        signDoc,
      );
      return {
        signed: data,
        signature: signature.signature,
        pub_key: signature.pub_key,
      };
    },
  };

  const client = await createLumeraClient({
    preset: "testnet",
    signer: signer as any,
    address: account.address,
    gasPrice: "0.025ulume",
  });

  console.log(`Lumera client initialized for ${account.address}`);
  return client;
}

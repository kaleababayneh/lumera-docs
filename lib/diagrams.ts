// ── Types ────────────────────────────────────────────────────────────────────

export interface BoxElement {
  type: "box";
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  variant?: "default" | "accent" | "inner";
  items?: string[];
  dashed?: boolean;
}

export interface ArrowElement {
  type: "arrow";
  id: string;
  points: [number, number][];
  label?: string;
  labelPos?: [number, number];
  dashed?: boolean;
  bidirectional?: boolean;
}

export interface TextElement {
  type: "text";
  id: string;
  x: number;
  y: number;
  text: string;
  size?: number;
  bold?: boolean;
  muted?: boolean;
  anchor?: "start" | "middle" | "end";
}

export type DiagramElement = BoxElement | ArrowElement | TextElement;

export interface DiagramDef {
  viewBox: string;
  title?: string;
  labelSize?: number;       // box label font size (default 16)
  itemSize?: number;        // box item font size (default 14)
  arrowLabelSize?: number;  // arrow label font size (default 13)
  labelLineHeight?: number; // gap between label lines (default labelSize + 6)
  itemLineHeight?: number;  // gap between item lines (default itemSize + 5)
  itemGap?: number;         // gap between last label line and first item (default 6)
  pad?: number;             // extra padding around boxes (default 10)
  borderRadius?: number;    // box corner radius (default 16)
  strokeWidth?: number;     // box border thickness (default 1.3)
  arrowWidth?: number;      // arrow line thickness (default 1.3)
  elements: DiagramElement[];
}

// ── Diagram definitions ─────────────────────────────────────────────────────

const architecture: DiagramDef = {
  viewBox: "0 0 700 420",
  title: "Cascade Architecture — Control Plane & Data Plane",
  elements: [
    // Control Plane
    {
      type: "text",
      id: "cp-label",
      x: 350,
      y: 15,
      text: "CONTROL PLANE",
      size: 10,
      bold: true,
      muted: true,
    },
    {
      type: "box",
      id: "blockchain",
      x: 125,
      y: 28,
      w: 450,
      h: 180,
      label: "Lumera Blockchain\n(Cosmos SDK L1)",
    },
    {
      type: "box",
      id: "action",
      x: 185,
      y: 78,
      w: 330,
      h: 115,
      label: "Action Module",
      variant: "inner",
      items: ["MsgRequest · MsgApprove", "Fee Escrow · State Machine"],
    },
    // SN-API gateway
    { type: "arrow", id: "a1", points: [[350, 208], [350, 238]] },
    {
      type: "box",
      id: "snapi",
      x: 225,
      y: 243,
      w: 250,
      h: 50,
      label: "SN-API (REST Gateway)",
      variant: "accent",
    },
    // Data Plane
    {
      type: "text",
      id: "dp-label",
      x: 350,
      y: 318,
      text: "DATA PLANE",
      size: 10,
      bold: true,
      muted: true,
    },
    { type: "arrow", id: "a2", points: [[270, 293], [155, 338]] },
    { type: "arrow", id: "a3", points: [[350, 293], [350, 338]] },
    { type: "arrow", id: "a4", points: [[430, 293], [545, 338]] },
    {
      type: "box",
      id: "sn1",
      x: 75,
      y: 343,
      w: 160,
      h: 55,
      label: "Supernode #1\n(chunks)",
    },
    {
      type: "box",
      id: "sn2",
      x: 270,
      y: 343,
      w: 160,
      h: 55,
      label: "Supernode #2\n(chunks)",
    },
    {
      type: "box",
      id: "sn3",
      x: 465,
      y: 343,
      w: 160,
      h: 55,
      label: "Supernode #N\n(chunks)",
    },
  ],
};

const howCascadeWorks: DiagramDef = {
  viewBox: "0 0 2300 960",
  title: "How Cascade Works",
  labelSize: 42,
  arrowLabelSize: 42,
  labelLineHeight: 50,
  pad: 20,
  borderRadius: 24,
  strokeWidth: 6,
  arrowWidth: 3,
  elements: [
    // Row 1: App → SDK ⇄ Chain  (180px gap App→SDK, 560px gap SDK→Chain)
    {
      type: "box",
      id: "app",
      x: 40,
      y: 40,
      w: 420,
      h: 220,
      label: "Your App\n(Browser / Node.js)",
    },
    { type: "arrow", id: "a1", points: [[460, 150], [640, 150]] },
    {
      type: "box",
      id: "sdk",
      x: 640,
      y: 40,
      w: 420,
      h: 220,
      label: "Lumera SDK\n(JS / Go / Rust)",
    },
    // ① SDK sends MsgRequestAction to chain
    {
      type: "arrow",
      id: "a2",
      points: [[1060, 115], [1620, 115]],
      label: "① MsgRequestAction",
      labelPos: [1340, 75],
    },
    // ② Chain returns action_id to SDK
    {
      type: "arrow",
      id: "a2b",
      points: [[1620, 185], [1060, 185]],
      label: "② action_id",
      labelPos: [1340, 230],
    },
    {
      type: "box",
      id: "chain",
      x: 1620,
      y: 40,
      w: 420,
      h: 220,
      label: "Lumera Chain\n(Cosmos SDK L1)",
    },
    // ③ SDK uploads file to SN-API  (360px vertical gap)
    {
      type: "arrow",
      id: "a3",
      points: [[850, 280], [850, 590]],
      label: "③ File upload",
      labelPos: [850, 440],
    },
    // ⑤ Supernodes finalize action back to chain
    {
      type: "arrow",
      id: "a4",
      points: [[1830, 570], [1830, 260]],
      label: "⑤ MsgFinalizeAction",
      labelPos: [1830, 440],
    },
    // Row 2: SN-API → Supernode Mesh  (y=590)
    {
      type: "box",
      id: "snapi",
      x: 640,
      y: 590,
      w: 420,
      h: 220,
      label: "SN-API\n(REST API)",
      variant: "accent",
    },
    {
      type: "arrow",
      id: "a5",
      points: [[1060, 730], [1620, 730]],
      label: "④ RaptorQ encode",
      labelPos: [1340, 690],
    },
    {
      type: "box",
      id: "mesh",
      x: 1620,
      y: 590,
      w: 420,
      h: 220,
      label: "Supernode Mesh\n(RaptorQ chunks)",
    },
  ],
};

const erasureCoding: DiagramDef = {
  viewBox: "0 0 650 290",
  title: "RaptorQ Encoding Flow",
  elements: [
    {
      type: "box",
      id: "file",
      x: 175,
      y: 10,
      w: 300,
      h: 45,
      label: "Original File (K source symbols)",
    },
    { type: "arrow", id: "a1", points: [[325, 55], [325, 80]] },
    {
      type: "box",
      id: "encoder",
      x: 175,
      y: 85,
      w: 300,
      h: 50,
      label: "RaptorQ Encoder (WASM)",
      variant: "accent",
    },
    // Fan out
    { type: "arrow", id: "a2", points: [[210, 135], [95, 200]] },
    { type: "arrow", id: "a3", points: [[275, 135], [220, 200]] },
    { type: "arrow", id: "a4", points: [[375, 135], [430, 200]] },
    { type: "arrow", id: "a5", points: [[440, 135], [555, 200]] },
    {
      type: "text",
      id: "t1",
      x: 325,
      y: 165,
      text: "N encoded symbols (N > K)",
      muted: true,
      size: 11,
    },
    // Supernodes
    { type: "box", id: "sn1", x: 35, y: 205, w: 120, h: 45, label: "SN #1" },
    {
      type: "box",
      id: "sn2",
      x: 165,
      y: 205,
      w: 110,
      h: 45,
      label: "SN #2",
    },
    {
      type: "text",
      id: "dots",
      x: 325,
      y: 228,
      text: "· · ·",
      muted: true,
      size: 18,
    },
    {
      type: "box",
      id: "sn3",
      x: 375,
      y: 205,
      w: 110,
      h: 45,
      label: "SN #3",
    },
    {
      type: "box",
      id: "sn4",
      x: 495,
      y: 205,
      w: 120,
      h: 45,
      label: "SN #4",
    },
  ],
};

const interchainAccounts: DiagramDef = {
  viewBox: "0 0 800 380",
  title: "Interchain Accounts (ICA) Flow",
  elements: [
    // Controller Chain
    {
      type: "box",
      id: "controller",
      x: 20,
      y: 15,
      w: 320,
      h: 225,
      label: "Controller Chain\n(e.g., Injective)",
    },
    {
      type: "box",
      id: "ica-ctrl",
      x: 50,
      y: 80,
      w: 260,
      h: 90,
      label: "ICA Controller",
      variant: "inner",
      items: ["Packs MsgRequest"],
    },
    // IBC connection
    {
      type: "arrow",
      id: "ibc",
      points: [[340, 125], [460, 125]],
      bidirectional: true,
    },
    {
      type: "text",
      id: "ibc-t1",
      x: 400,
      y: 108,
      text: "IBC",
      size: 12,
      bold: true,
      muted: true,
    },
    {
      type: "text",
      id: "ibc-t2",
      x: 400,
      y: 125,
      text: "MsgSendTx (ICS-27)",
      size: 10,
      muted: true,
    },
    {
      type: "text",
      id: "ibc-t3",
      x: 400,
      y: 142,
      text: "Channel / Connection",
      size: 10,
      muted: true,
    },
    // Lumera Chain
    {
      type: "box",
      id: "lumera",
      x: 460,
      y: 15,
      w: 320,
      h: 225,
      label: "Lumera Chain\n(Host Chain)",
    },
    {
      type: "box",
      id: "ica-host",
      x: 490,
      y: 80,
      w: 260,
      h: 90,
      label: "ICA Host",
      variant: "inner",
      items: ["Executes MsgRequest"],
    },
    // Supernode Mesh
    { type: "arrow", id: "a-mesh", points: [[620, 240], [620, 290]] },
    {
      type: "box",
      id: "mesh",
      x: 510,
      y: 295,
      w: 220,
      h: 55,
      label: "Supernode Mesh\n(File Upload)",
      variant: "accent",
    },
  ],
};

const encryptedStorage: DiagramDef = {
  viewBox: "0 0 720 310",
  title: "Encrypted Storage Architecture",
  elements: [
    // Top row
    {
      type: "box",
      id: "plain",
      x: 15,
      y: 25,
      w: 170,
      h: 55,
      label: "Plaintext File",
    },
    { type: "arrow", id: "a1", points: [[185, 52], [240, 52]] },
    {
      type: "box",
      id: "encrypt",
      x: 245,
      y: 25,
      w: 180,
      h: 55,
      label: "Encrypt\n(XChaCha20)",
      variant: "accent",
    },
    { type: "arrow", id: "a2", points: [[425, 52], [480, 52]] },
    {
      type: "box",
      id: "cascade",
      x: 485,
      y: 25,
      w: 185,
      h: 55,
      label: "Cascade\n(Encrypted)",
    },
    // Key derivation
    { type: "arrow", id: "a3", points: [[335, 80], [335, 120]] },
    {
      type: "box",
      id: "dockey",
      x: 230,
      y: 125,
      w: 210,
      h: 50,
      label: "Document Key\n(random 256-bit)",
      variant: "inner",
    },
    { type: "arrow", id: "a4", points: [[335, 175], [335, 210]] },
    {
      type: "box",
      id: "walletkey",
      x: 205,
      y: 215,
      w: 260,
      h: 55,
      label: "Wallet-Derived Key\n(ADR-036 + BLAKE2b)",
      variant: "inner",
    },
  ],
};

const sdkArchitecture: DiagramDef = {
  viewBox: "0 0 1000 520",
  title: "JavaScript SDK Architecture",
  labelSize: 26,
  itemSize: 18,
  arrowLabelSize: 18,
  labelLineHeight: 32,
  itemLineHeight: 24,
  itemGap: 8,
  pad: 14,
  borderRadius: 16,
  strokeWidth: 3,
  arrowWidth: 2,
  elements: [
    // ── Row 1: Core modules
    {
      type: "box",
      id: "blockchain",
      x: 30,
      y: 20,
      w: 440,
      h: 170,
      label: "client.Blockchain",
      items: [
        "CosmJS · SigningStargateClient",
        "Action queries · Supernode queries",
        "Fee estimation · Gas simulation",
      ],
    },
    {
      type: "box",
      id: "cascade",
      x: 530,
      y: 20,
      w: 440,
      h: 170,
      label: "client.Cascade",
      items: [
        "CascadeUploader · CascadeDownloader",
        "SNApiClient (REST) · TaskManager",
        "LEP-1 encoding (RaptorQ · blake3 · zstd)",
      ],
    },
    // ── Arrows to Wallet Layer
    {
      type: "arrow",
      id: "a-bc-wallet",
      points: [[250, 190], [380, 310]],
      label: "tx signing",
      labelPos: [260, 254],
    },
    {
      type: "arrow",
      id: "a-cascade-wallet",
      points: [[750, 190], [620, 310]],
      label: "ADR-036 signing",
      labelPos: [740, 254],
    },
    // ── Row 2: Wallet Layer (shared by both)
    {
      type: "box",
      id: "wallets",
      x: 190,
      y: 310,
      w: 620,
      h: 170,
      label: "Wallet Layer",
      variant: "accent",
      items: [
        "Keplr · Leap (browser extensions)",
        "DirectSecp256k1HdWallet (Node.js)",
        "signDirect · signAmino · signArbitrary",
      ],
    },
  ],
};

const researchArchive: DiagramDef = {
  viewBox: "0 0 780 420",
  title: "Research Archive Architecture",
  elements: [
    // Browser SPA outer
    {
      type: "box",
      id: "spa",
      x: 15,
      y: 10,
      w: 750,
      h: 300,
      label: "Browser SPA",
    },
    // Top modules
    {
      type: "box",
      id: "ui",
      x: 40,
      y: 48,
      w: 210,
      h: 42,
      label: "UI (DOM)",
      variant: "inner",
    },
    {
      type: "box",
      id: "crypto",
      x: 275,
      y: 48,
      w: 210,
      h: 42,
      label: "Crypto (libsodium)",
      variant: "inner",
    },
    {
      type: "box",
      id: "cascade-mod",
      x: 510,
      y: 48,
      w: 210,
      h: 42,
      label: "Cascade (SDK)",
      variant: "inner",
    },
    // Arrows down
    { type: "arrow", id: "a1", points: [[145, 90], [145, 115]] },
    { type: "arrow", id: "a2", points: [[380, 90], [380, 115]] },
    { type: "arrow", id: "a3", points: [[615, 90], [615, 115]] },
    // Application Logic
    {
      type: "box",
      id: "logic",
      x: 30,
      y: 120,
      w: 720,
      h: 115,
      label: "Application Logic",
      variant: "accent",
    },
    {
      type: "box",
      id: "wallet",
      x: 55,
      y: 158,
      w: 200,
      h: 50,
      label: "Wallet (Keplr)",
      variant: "inner",
    },
    {
      type: "box",
      id: "drafts",
      x: 280,
      y: 158,
      w: 200,
      h: 50,
      label: "Drafts (encrypt)",
      variant: "inner",
    },
    {
      type: "box",
      id: "papers",
      x: 505,
      y: 158,
      w: 200,
      h: 50,
      label: "Papers (plaintext)",
      variant: "inner",
    },
    // External services
    { type: "arrow", id: "a4", points: [[160, 310], [160, 340]] },
    { type: "arrow", id: "a5", points: [[390, 310], [390, 340]] },
    { type: "arrow", id: "a6", points: [[615, 310], [615, 340]] },
    {
      type: "box",
      id: "chain",
      x: 60,
      y: 345,
      w: 200,
      h: 50,
      label: "Lumera Chain\n(on-chain tx)",
    },
    {
      type: "box",
      id: "snapi",
      x: 290,
      y: 345,
      w: 200,
      h: 50,
      label: "SN-API\n(file I/O)",
    },
    {
      type: "box",
      id: "lumescope",
      x: 515,
      y: 345,
      w: 200,
      h: 50,
      label: "Lumescope\n(action index)",
    },
  ],
};

const nodeArchitecture: DiagramDef = {
  viewBox: "0 0 720 255",
  title: "Node.js Browser-First Architecture",
  elements: [
    // Row 1
    {
      type: "box",
      id: "browser",
      x: 20,
      y: 15,
      w: 170,
      h: 60,
      label: "Browser\n(Vite / CRA)",
    },
    { type: "arrow", id: "a1", points: [[190, 45], [240, 45]] },
    {
      type: "box",
      id: "sdk",
      x: 245,
      y: 15,
      w: 170,
      h: 60,
      label: "Lumera SDK\n(works!)",
    },
    { type: "arrow", id: "a2", points: [[415, 45], [465, 45]] },
    {
      type: "box",
      id: "cascade",
      x: 470,
      y: 15,
      w: 185,
      h: 60,
      label: "Cascade\n(SN-API)",
      variant: "accent",
    },
    // Arrow down from browser
    {
      type: "arrow",
      id: "a3",
      points: [[105, 75], [105, 158]],
      label: "API calls (metadata only)",
      labelPos: [105, 118],
      dashed: true,
    },
    // Node.js backend
    {
      type: "box",
      id: "api",
      x: 20,
      y: 163,
      w: 170,
      h: 60,
      label: "Your API\n(Node.js, no Cascade)",
    },
  ],
};

const collaborationFlow: DiagramDef = {
  viewBox: "0 0 560 420",
  title: "Collaboration Flow",
  elements: [
    // Step 1: Owner creates & uploads draft
    {
      type: "box",
      id: "create",
      x: 55,
      y: 10,
      w: 250,
      h: 115,
      label: "Owner",
      variant: "accent",
      items: [
        "1. Create draft",
        "2. Generate document key",
        "3. Encrypt with doc key",
        "4. Upload to Cascade",
      ],
    },
    // Arrow down
    { type: "arrow", id: "a1", points: [[180, 125], [180, 150]] },
    // Step 2: Owner creates invitation
    {
      type: "box",
      id: "invite",
      x: 55,
      y: 155,
      w: 250,
      h: 100,
      label: "Owner",
      variant: "accent",
      items: [
        "5. Create invitation",
        "6. Re-encrypt doc key",
        "7. Upload invitation",
      ],
    },
    // Handoff arrow (down then right then down)
    {
      type: "arrow",
      id: "handoff",
      points: [[180, 255], [180, 285], [400, 285], [400, 305]],
    },
    {
      type: "text",
      id: "handoff-label",
      x: 290,
      y: 272,
      text: "8. Share link (URL hash fragment)",
      size: 10,
      muted: true,
    },
    // Step 3: Collaborator decrypts
    {
      type: "box",
      id: "decrypt",
      x: 265,
      y: 310,
      w: 260,
      h: 100,
      label: "Collaborator",
      items: [
        "9. Open link",
        "10. Download invitation",
        "11. Store doc key locally",
        "12. Decrypt draft",
      ],
    },
  ],
};

// ── Export ────────────────────────────────────────────────────────────────────

export const diagrams: Record<string, DiagramDef> = {
  architecture,
  "how-cascade-works": howCascadeWorks,
  "erasure-coding": erasureCoding,
  "interchain-accounts": interchainAccounts,
  "encrypted-storage": encryptedStorage,
  "sdk-architecture": sdkArchitecture,
  "research-archive": researchArchive,
  "node-architecture": nodeArchitecture,
  "collaboration-flow": collaborationFlow,
};

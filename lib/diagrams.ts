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
  maxWidth?: string;        // cap rendered width (e.g. "400px"); without this, SVG fills container
  elements: DiagramElement[];
}

// ── Diagram definitions ─────────────────────────────────────────────────────

const architecture: DiagramDef = {
  viewBox: "0 0 740 540",
  title: "Cascade Architecture",
  elements: [
    // ── Client SDK ──
    {
      type: "box",
      id: "client",
      x: 245,
      y: 10,
      w: 250,
      h: 50,
      label: "Client SDK (JS / Go / Rust)",
    },

    // Arrow: Client -> Blockchain
    {
      type: "arrow",
      id: "a-client-chain",
      points: [[310, 60], [310, 110]],
      label: "tx",
      labelPos: [290, 86],
    },

    // Arrow: Client -> SN-API
    {
      type: "arrow",
      id: "a-client-snapi",
      points: [[430, 60], [430, 310]],
      label: "file I/O",
      labelPos: [468, 186],
    },

    // ── Control Plane ──
    {
      type: "text",
      id: "cp-label",
      x: 60,
      y: 100,
      text: "CONTROL PLANE",
      size: 9,
      bold: true,
      muted: true,
      anchor: "start",
    },
    {
      type: "box",
      id: "blockchain",
      x: 60,
      y: 115,
      w: 310,
      h: 160,
      label: " ",
      dashed: true,
    },
    {
      type: "text",
      id: "chain-title",
      x: 215,
      y: 142,
      text: "Lumera Blockchain",
      size: 13,
    },
    {
      type: "text",
      id: "chain-sub",
      x: 215,
      y: 162,
      text: "Cosmos SDK L1",
      size: 10,
      muted: true,
    },
    {
      type: "box",
      id: "action",
      x: 90,
      y: 185,
      w: 250,
      h: 65,
      label: "Action Module",
      variant: "inner",
      items: ["MsgRequest  ·  Fee Escrow  ·  State Machine"],
    },

    // ── SN-API ──
    {
      type: "arrow",
      id: "a-chain-snapi",
      points: [[215, 285], [215, 310]],
      dashed: true,
    },
    {
      type: "box",
      id: "snapi",
      x: 130,
      y: 315,
      w: 310,
      h: 50,
      label: "SN-API (REST Gateway)",
      variant: "accent",
    },

    // ── Data Plane ──
    {
      type: "text",
      id: "dp-label",
      x: 370,
      y: 395,
      text: "DATA PLANE",
      size: 9,
      bold: true,
      muted: true,
    },
    {
      type: "arrow",
      id: "a-sn1",
      points: [[210, 365], [130, 418]],
    },
    {
      type: "arrow",
      id: "a-sn2",
      points: [[285, 365], [370, 418]],
    },
    {
      type: "arrow",
      id: "a-sn3",
      points: [[380, 365], [590, 418]],
    },
    {
      type: "box",
      id: "sn1",
      x: 45,
      y: 423,
      w: 170,
      h: 55,
      label: "Supernode #1\n(chunks)",
    },
    {
      type: "box",
      id: "sn2",
      x: 280,
      y: 423,
      w: 170,
      h: 55,
      label: "Supernode #2\n(chunks)",
    },
    {
      type: "box",
      id: "sn3",
      x: 510,
      y: 423,
      w: 170,
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
      label: "RaptorQ Encoder",
      variant: "accent",
    },
    // Fan out
    { type: "arrow", id: "a2", points: [[210, 150], [95, 200]] },
    { type: "arrow", id: "a3", points: [[275, 150], [220, 200]] },
    { type: "arrow", id: "a4", points: [[375, 150], [430, 200]] },
    { type: "arrow", id: "a5", points: [[440, 150], [555, 200]] },
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
    { type: 
      "box", 
      id: "sn1",
      x: 35, 
      y: 220, 
      w: 80, 
      h: 40, 
      label: "SN #1" },
    {
      type: "box",
      id: "sn2",
      x: 165,
      y: 220,
      w: 80,
      h: 40,
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
      y: 220,
      w: 80,
      h: 40,
      label: "SN #3",
    },
    {
      type: "box",
      id: "sn4",
      x: 495,
      y: 220,
      w: 80,
      h: 40,
      label: "SN #4",
    },
  ],
};

const interchainAccounts: DiagramDef = {
  viewBox: "0 0 950 400",
  title: "Interchain Accounts (ICA) Flow",
  elements: [
    // ── Controller Chain (left) ──
    {
      type: "box",
      id: "controller",
      x: 20,
      y: 30,
      w: 330,
      h: 220,
      label: " ",
    },
    {
      type: "text",
      id: "ctrl-title",
      x: 185,
      y: 55,
      text: "Controller Chain",
      size: 14,
      bold: true,
    },
    {
      type: "text",
      id: "ctrl-sub",
      x: 185,
      y: 78,
      text: "(e.g., Osmosis)",
      size: 11,
      muted: true,
    },
    {
      type: "box",
      id: "ica-ctrl",
      x: 50,
      y: 100,
      w: 270,
      h: 80,
      label: "ICA Controller",
      variant: "inner",
      items: ["Packs MsgRequestAction"],
    },
    // ── IBC Connection ──
    {
      type: "text",
      id: "ibc-t1",
      x: 470,
      y: 115,
      text: "IBC",
      size: 13,
      bold: true,
      muted: true,
    },
    {
      type: "arrow",
      id: "ibc",
      points: [
        [360, 140],
        [580, 140],
      ],
      bidirectional: true,
    },
    {
      type: "text",
      id: "ibc-t2",
      x: 470,
      y: 162,
      text: "MsgSendTx (ICS-27)",
      size: 10,
      muted: true,
    },
    {
      type: "text",
      id: "ibc-t3",
      x: 470,
      y: 178,
      text: "Channel / Connection",
      size: 10,
      muted: true,
    },
    // ── Lumera Chain (right) ──
    {
      type: "box",
      id: "lumera",
      x: 590,
      y: 30,
      w: 330,
      h: 220,
      label: " ",
    },
    {
      type: "text",
      id: "lum-title",
      x: 755,
      y: 55,
      text: "Lumera Chain",
      size: 14,
      bold: true,
    },
    {
      type: "text",
      id: "lum-sub",
      x: 755,
      y: 78,
      text: "(Host Chain)",
      size: 11,
      muted: true,
    },
    {
      type: "box",
      id: "ica-host",
      x: 620,
      y: 100,
      w: 270,
      h: 80,
      label: "ICA Host",
      variant: "inner",
      items: ["Executes MsgRequestAction"],
    },
    // ── Supernode Mesh ──
    {
      type: "arrow",
      id: "a-mesh",
      points: [
        [755, 260],
        [755, 310],
      ],
    },
    {
      type: "box",
      id: "mesh",
      x: 640,
      y: 315,
      w: 230,
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
  viewBox: "0 0 740 340",
  title: "JavaScript SDK Architecture",
  itemSize: 12,
  elements: [
    // ── Row 1: Core modules
    {
      type: "box",
      id: "blockchain",
      x: 20,
      y: 15,
      w: 310,
      h: 115,
      label: "Blockchain",
      items: [
        "CosmJS · SigningStargateClient",
        "Action queries · Supernode queries",
        "Fee estimation · Gas simulation",
      ],
    },
    {
      type: "box",
      id: "cascade",
      x: 400,
      y: 15,
      w: 310,
      h: 115,
      label: "Cascade",
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
      points: [
        [175, 140],
        [275, 205],
      ],
      label: "tx signing",
      labelPos: [185, 175],
    },
    {
      type: "arrow",
      id: "a-cascade-wallet",
      points: [
        [555, 140],
        [455, 205],
      ],
      label: "ADR-036 signing",
      labelPos: [545, 175],
    },
    // ── Row 2: Wallet Layer
    {
      type: "box",
      id: "wallets",
      x: 140,
      y: 215,
      w: 450,
      h: 100,
      label: "Wallet Layer",
      variant: "accent",
      items: [
        "Keplr (browser extension)",
        "DirectSecp256k1HdWallet (Node.js)",
        "signDirect · signAmino · signArbitrary",
      ],
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
  viewBox: "0 0 200 415",
  title: "Collaboration Flow",
  maxWidth: "280px",
  labelSize: 12,
  itemSize: 10,
  pad: 4,
  elements: [
    // Step 1: Owner creates & uploads draft
    {
      type: "box",
      id: "create",
      x: 25,
      y: 20,
      w: 150,
      h: 95,
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
    { type: "arrow", id: "a1", points: [[100, 115], [100, 155]] },
    // Step 2: Owner creates invitation
    {
      type: "box",
      id: "invite",
      x: 25,
      y: 155,
      w: 150,
      h: 80,
      label: "Owner",
      variant: "accent",
      items: [
        "5. Create invitation",
        "6. Re-encrypt doc key",
        "7. Upload invitation",
      ],
    },
    // Straight arrow down with side label
    { type: "arrow", id: "handoff", points: [[100, 235], [100, 295]] },
    {
      type: "text",
      id: "handoff-label",
      x: 110,
      y: 265,
      text: "8. Share link",
      size: 7,
      muted: true,
      anchor: "start",
    },
    // Step 3: Collaborator decrypts
    {
      type: "box",
      id: "decrypt",
      x: 25,
      y: 295,
      w: 150,
      h: 95,
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

const supernodeArchitecture: DiagramDef = {
  viewBox: "0 0 820 620",
  title: "Supernode Architecture",
  elements: [
    // ── Lumera Chain (top, shared endpoint both hosts talk to) ──
    {
      type: "box",
      id: "chain",
      x: 210,
      y: 30,
      w: 400,
      h: 50,
      label: "Lumera Chain (testnet-2)",
      variant: "accent",
    },

    // ── Validator → Chain: block production ──
    {
      type: "arrow",
      id: "val-to-chain",
      points: [[250, 160], [340, 90]],
      label: "produces blocks",
      labelPos: [215, 125],
    },

    // ── Supernode → Chain: gRPC queries + tx broadcast ──
    {
      type: "arrow",
      id: "sn-to-chain",
      points: [[570, 160], [480, 90]],
      label: "gRPC queries + tx",
      labelPos: [620, 125],
    },

    // ── Validator Host ──
    {
      type: "box",
      id: "val-host",
      x: 50,
      y: 160,
      w: 300,
      h: 260,
      label: "Validator Host",
    },
    {
      type: "box",
      id: "lumerad",
      x: 85,
      y: 195,
      w: 230,
      h: 60,
      label: "lumerad\n(consensus)",
      variant: "accent",
    },
    {
      type: "box",
      id: "val-ports",
      x: 85,
      y: 335,
      w: 230,
      h: 60,
      label: "Ports: 26656",
      variant: "inner",
    },

    // ── Supernode Host ──
    {
      type: "box",
      id: "sn-host",
      x: 470,
      y: 160,
      w: 300,
      h: 260,
      label: "Supernode Host",
    },
    {
      type: "box",
      id: "sn-manager",
      x: 505,
      y: 195,
      w: 230,
      h: 60,
      label: "sn-manager\n(Cascade / Sense / AI)",
      variant: "accent",
    },
    {
      type: "box",
      id: "sn-ports",
      x: 505,
      y: 335,
      w: 230,
      h: 60,
      label: "Ports: 4444, 4445, 8002",
      variant: "inner",
    },

    // ── On-chain binding between Validator and Supernode ──
    {
      type: "arrow",
      id: "val-to-binding",
      points: [[200, 420], [270, 490]],
      dashed: true,
    },
    {
      type: "arrow",
      id: "sn-to-binding",
      points: [[620, 420], [550, 490]],
      dashed: true,
    },
    {
      type: "box",
      id: "binding",
      x: 240,
      y: 490,
      w: 320,
      h: 45,
      label: "Same Validator Operator Identity",
      variant: "inner",
      dashed: true,
    },
  ],
};

// ── Injective × Cascade diagrams ─────────────────────────────────────────────

const injectivePatternA: DiagramDef = {
  viewBox: "0 0 820 400",
  title: "Pattern A — User-Signed Cascade Write",
  elements: [
    // Wallet (left, tall — covers all three arrow connections)
    {
      type: "box",
      id: "wallet",
      x: 40,
      y: 80,
      w: 200,
      h: 240,
      label: "Wallet\n(Keplr)",
    },
    // Lumera / Cascade (top right) — accent = storage target
    {
      type: "box",
      id: "lumera",
      x: 560,
      y: 80,
      w: 220,
      h: 80,
      label: "Lumera\n(Cascade)",
      variant: "accent",
    },
    // Injective contract (bottom right)
    {
      type: "box",
      id: "injective",
      x: 560,
      y: 240,
      w: 220,
      h: 80,
      label: "Injective\n(your CW)",
    },
    // ① wallet → Lumera (sign Lumera tx)
    {
      type: "arrow",
      id: "a1",
      points: [[250, 105], [550, 105]],
      label: "① sign Lumera tx",
      labelPos: [400, 82],
    },
    // ② Lumera → wallet (action_id)
    {
      type: "arrow",
      id: "a2",
      points: [[550, 135], [250, 135]],
      label: "② action_id",
      labelPos: [400, 158],
    },
    // ③ wallet → Injective (submit pointer)
    {
      type: "arrow",
      id: "a3",
      points: [[250, 280], [550, 280]],
      label: "③ submit(cid: action_id)",
      labelPos: [400, 258],
    },
  ],
};

const injectivePatternB: DiagramDef = {
  viewBox: "0 0 1080 420",
  title: "Pattern B — Server-Signed via cascade-api",
  elements: [
    // User (left, tall)
    {
      type: "box",
      id: "user",
      x: 40,
      y: 80,
      w: 200,
      h: 280,
      label: "User\n(web)",
    },
    // Backend (middle) — proxies the upload
    {
      type: "box",
      id: "backend",
      x: 360,
      y: 80,
      w: 280,
      h: 160,
      label: "Your backend",
      items: ["forwards to cascade-api"],
    },
    // Lumera (top right) — accent
    {
      type: "box",
      id: "lumera",
      x: 760,
      y: 80,
      w: 240,
      h: 160,
      label: "Lumera\n(Cascade)",
      variant: "accent",
    },
    // Injective (bottom right)
    {
      type: "box",
      id: "injective",
      x: 760,
      y: 300,
      w: 240,
      h: 80,
      label: "Injective\n(your CW)",
    },
    // ① user → backend (POST /upload)
    {
      type: "arrow",
      id: "a1",
      points: [[250, 130], [350, 130]],
      label: "① POST /upload",
      labelPos: [300, 108],
    },
    // backend → user (action_id back)
    {
      type: "arrow",
      id: "a2",
      points: [[350, 190], [250, 190]],
      label: "action_id",
      labelPos: [300, 212],
    },
    // backend ↔ Lumera (signs + action_id)
    {
      type: "arrow",
      id: "a3",
      points: [[650, 160], [750, 160]],
      bidirectional: true,
      label: "signs · action_id",
      labelPos: [700, 138],
    },
    // ② user → Injective (single signature on Injective)
    {
      type: "arrow",
      id: "a4",
      points: [[250, 340], [750, 340]],
      label: "② sign Injective tx · submit(cid: action_id)",
      labelPos: [500, 318],
    },
  ],
};

const injectiveServerForward: DiagramDef = {
  viewBox: "0 0 920 240",
  title: "Server-Side Cascade Forward",
  elements: [
    {
      type: "box",
      id: "browser",
      x: 40,
      y: 60,
      w: 180,
      h: 120,
      label: "Browser",
    },
    {
      type: "box",
      id: "backend",
      x: 340,
      y: 60,
      w: 220,
      h: 120,
      label: "Your backend",
    },
    {
      type: "box",
      id: "cascade-api",
      x: 680,
      y: 60,
      w: 200,
      h: 120,
      label: "cascade-api",
      variant: "accent",
    },
    // ① browser → backend (multipart file)
    {
      type: "arrow",
      id: "a1",
      points: [[230, 105], [330, 105]],
      label: "① file",
      labelPos: [280, 86],
    },
    // ② backend → cascade-api (POST /upload + Bearer)
    {
      type: "arrow",
      id: "a2",
      points: [[570, 105], [670, 105]],
      label: "② POST /upload",
      labelPos: [620, 86],
    },
    // ③ cascade-api → backend (action_id, tx_hash, ...)
    {
      type: "arrow",
      id: "a3",
      points: [[670, 140], [570, 140]],
      label: "③ action_id",
      labelPos: [620, 162],
    },
    // backend → browser (action_id back to client)
    {
      type: "arrow",
      id: "a4",
      points: [[330, 140], [230, 140]],
      label: "to client",
      labelPos: [280, 162],
    },
  ],
};

const injectiveIntegration: DiagramDef = {
  viewBox: "0 0 920 640",
  title: "Injective × Cascade Integration Shape",
  elements: [
    // Frontend (top, full width)
    {
      type: "box",
      id: "frontend",
      x: 40,
      y: 20,
      w: 840,
      h: 90,
      label: "Frontend",
      items: ["signs Injective txs · optionally Lumera txs"],
    },
    // Injective contract (middle left) — holds state, funds, pointers
    {
      type: "box",
      id: "injective",
      x: 40,
      y: 220,
      w: 380,
      h: 200,
      label: "Injective contract",
      items: [
        "holds STATE",
        "holds FUNDS, emits EVENTS",
        "holds POINTERS (action_id)",
      ],
    },
    // Cascade (middle right) — accent = storage target
    {
      type: "box",
      id: "cascade",
      x: 500,
      y: 220,
      w: 380,
      h: 200,
      label: "Cascade (Lumera)",
      items: [
        "holds the BYTES",
        "one action_id per artifact",
      ],
      variant: "accent",
    },
    // Indexer (bottom, full width)
    {
      type: "box",
      id: "indexer",
      x: 40,
      y: 520,
      w: 840,
      h: 90,
      label: "Indexer",
      items: ["joins on-chain state with Cascade content"],
    },
    // Frontend → Injective contract (no label — prose covers it)
    {
      type: "arrow",
      id: "a1",
      points: [[180, 120], [180, 210]],
    },
    // Frontend → Cascade
    {
      type: "arrow",
      id: "a2",
      points: [[740, 120], [740, 210]],
    },
    // Injective ↔ Cascade (cid pointer)
    {
      type: "arrow",
      id: "a3",
      points: [[430, 320], [490, 320]],
      bidirectional: true,
      label: "cid pointer",
      labelPos: [460, 300],
    },
    // Injective → Indexer
    {
      type: "arrow",
      id: "a4",
      points: [[180, 430], [180, 510]],
    },
    // Cascade → Indexer
    {
      type: "arrow",
      id: "a5",
      points: [[740, 430], [740, 510]],
    },
  ],
};

const inscribeArchitecture: DiagramDef = {
  viewBox: "0 0 1100 760",
  title: "Inscribe Architecture",
  elements: [
    // Web (top)
    {
      type: "box",
      id: "web",
      x: 80,
      y: 20,
      w: 940,
      h: 80,
      label: "Web (Next.js, Keplr)",
      items: ["Server Components · Injective signing · Cascade reads"],
    },
    // inscribe-api (middle left)
    {
      type: "box",
      id: "inscribe-api",
      x: 80,
      y: 180,
      w: 300,
      h: 140,
      label: "inscribe-api (Go)",
      items: ["/markets · /audit", "/cascade/upload (proxy)"],
    },
    // inscribe-indexer (middle middle)
    {
      type: "box",
      id: "indexer",
      x: 440,
      y: 180,
      w: 320,
      h: 140,
      label: "inscribe-indexer (Go)",
      items: ["polls Injective LCD ~10s", "mirrors state → Postgres"],
    },
    // Injective testnet (middle right)
    {
      type: "box",
      id: "injective",
      x: 820,
      y: 180,
      w: 240,
      h: 160,
      label: "Injective testnet",
      items: [
        "inscribe-market-v2  (39449)",
        "bond-vault  (39446)",
        "voter-registry  (39447)",
      ],
    },
    // Postgres (between api/indexer, inner variant)
    {
      type: "box",
      id: "postgres",
      x: 220,
      y: 390,
      w: 380,
      h: 70,
      label: "Postgres",
      items: ["markets · evidence · cascade_cache"],
      variant: "inner",
    },
    // Cascade-api (bottom, full width, accent)
    {
      type: "box",
      id: "cascade-api",
      x: 80,
      y: 580,
      w: 940,
      h: 90,
      label: "Lumera cascade-api  (api.lumera.help)",
      items: ["signs MsgRequestAction · pays ulume · streams to Supernodes"],
      variant: "accent",
    },
    // Web → inscribe-api (HTTP)
    {
      type: "arrow",
      id: "a1",
      points: [[200, 110], [200, 170]],
      label: "HTTP",
      labelPos: [232, 140],
    },
    // Web → Injective (execute / query)
    {
      type: "arrow",
      id: "a2",
      points: [[940, 110], [940, 170]],
      label: "execute / query",
      labelPos: [850, 140],
    },
    // inscribe-api → Postgres (reads)
    {
      type: "arrow",
      id: "a3",
      points: [[280, 330], [280, 380]],
      label: "reads",
      labelPos: [314, 355],
    },
    // indexer → Postgres (writes)
    {
      type: "arrow",
      id: "a4",
      points: [[520, 330], [520, 380]],
      label: "writes",
      labelPos: [556, 355],
    },
    // indexer → Injective (polls LCD)
    {
      type: "arrow",
      id: "a5",
      points: [[770, 230], [810, 230]],
      label: "polls LCD",
      labelPos: [790, 210],
    },
    // inscribe-api → cascade-api (uploads) — routed left of Postgres
    {
      type: "arrow",
      id: "a6",
      points: [[150, 330], [150, 570]],
      label: "uploads",
      labelPos: [118, 450],
    },
    // indexer → cascade-api (downloads/cache fill) — routed right of Postgres
    {
      type: "arrow",
      id: "a7",
      points: [[720, 330], [720, 570]],
      label: "downloads",
      labelPos: [762, 450],
    },
  ],
};

const inscribeStateMachine: DiagramDef = {
  viewBox: "0 0 1320 480",
  title: "Inscribe Market State Machine",
  elements: [
    // Top row: Open → Proposed → Final (uncontested)
    {
      type: "box",
      id: "open",
      x: 40,
      y: 80,
      w: 180,
      h: 120,
      label: "Open",
      items: ["bets +", "evidence"],
    },
    {
      type: "box",
      id: "proposed",
      x: 400,
      y: 80,
      w: 200,
      h: 120,
      label: "Proposed",
      items: ["challenge", "window"],
    },
    {
      type: "box",
      id: "final-top",
      x: 1060,
      y: 80,
      w: 240,
      h: 120,
      label: "Final",
      items: ["window expired,", "verdict stands"],
      variant: "accent",
    },
    // Bottom row: Challenged → Voting → Final (after committee tally)
    {
      type: "box",
      id: "challenged",
      x: 400,
      y: 300,
      w: 200,
      h: 120,
      label: "Challenged",
      items: ["counter-verdict", "+ evidence"],
    },
    {
      type: "box",
      id: "voting",
      x: 760,
      y: 300,
      w: 220,
      h: 120,
      label: "Voting",
      items: ["committee samples N,", "votes w/ justification"],
    },
    {
      type: "box",
      id: "final-bot",
      x: 1060,
      y: 300,
      w: 240,
      h: 120,
      label: "Final",
      items: ["slash loser,", "pay winners"],
      variant: "accent",
    },
    // Transitions
    {
      type: "arrow",
      id: "a1",
      points: [[230, 140], [390, 140]],
      label: "propose_verdict",
      labelPos: [310, 50],
    },
    {
      type: "arrow",
      id: "a2",
      points: [[610, 140], [1050, 140]],
      label: "finalize_uncontested",
      labelPos: [830, 50],
    },
    {
      type: "arrow",
      id: "a3",
      points: [[500, 210], [500, 290]],
      label: "challenge",
      labelPos: [552, 250],
    },
    {
      type: "arrow",
      id: "a4",
      points: [[610, 360], [750, 360]],
      label: "request_committee",
      labelPos: [680, 270],
    },
    {
      type: "arrow",
      id: "a5",
      points: [[990, 360], [1050, 360]],
      label: "tally",
      labelPos: [1020, 270],
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
  "node-architecture": nodeArchitecture,
  "collaboration-flow": collaborationFlow,
  "supernode-architecture": supernodeArchitecture,
  "injective-pattern-a": injectivePatternA,
  "injective-pattern-b": injectivePatternB,
  "injective-server-forward": injectiveServerForward,
  "injective-integration": injectiveIntegration,
  "inscribe-architecture": inscribeArchitecture,
  "inscribe-state-machine": inscribeStateMachine,
};

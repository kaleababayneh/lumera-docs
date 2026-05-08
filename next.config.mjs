import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // Root redirect is handled in middleware.ts so it can be host-aware:
  // the main deployment sends / → /docs, the Lukso-only deployment sends
  // / → /docs/lukso instead. Single source of truth.
};

export default withMDX(config);

import "./global.css";
import { RootProvider } from "fumadocs-ui/provider";
import { Shantell_Sans } from "next/font/google";
import type { ReactNode } from "react";
import type { Metadata } from "next";

const shantell = Shantell_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-shantell",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Lumera Cascade Docs",
    default: "Lumera Cascade Documentation",
  },
  description:
    "Developer documentation for building decentralized applications with Lumera Cascade permanent storage protocol.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`flex min-h-screen flex-col ${shantell.variable}`}>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}

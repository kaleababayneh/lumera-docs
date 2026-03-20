import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { LumeraLogo } from "@/lib/logo";

export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <>
        <LumeraLogo className="size-6" />
        <span className="font-semibold">Lumera Cascade</span>
      </>
    ),
  },
  links: [
    {
      text: "GitHub",
      url: "https://github.com/LumeraProtocol/sdk-js",
      external: true,
    },
  ],
};

import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { LumeraIcon } from "@/lib/logo";

export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <>
        <LumeraIcon className="size-6" />
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

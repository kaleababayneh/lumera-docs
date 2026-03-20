import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { LumeraIcon } from "@/lib/logo";

export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <>
        <LumeraIcon className="size-5 mb-2 mr-0 ml-3" />
        <span className="-ml-1 font-semibold">Lumera Cascade</span>
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

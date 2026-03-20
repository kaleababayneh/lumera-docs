import { docs } from "@/.source";
import { loader } from "fumadocs-core/source";
import { createIcon } from "./icons";

export const source = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
  icon(icon) {
    return createIcon(icon);
  },
});

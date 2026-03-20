import {
  BookOpen,
  Download,
  Upload,
  Box,
  Network,
  Globe,
  Code,
  Settings,
  Wrench,
  FileCode,
  Server,
  Shield,
  Lock,
  Layers,
  Blocks,
  Terminal,
  Bug,
  Rocket,
  type LucideIcon,
} from "lucide-react";
import { type ReactElement, createElement } from "react";

const icons: Record<string, LucideIcon> = {
  BookOpen,
  Download,
  Upload,
  Box,
  Network,
  Globe,
  Code,
  Settings,
  Wrench,
  FileCode,
  Server,
  Shield,
  Lock,
  Layers,
  Blocks,
  Terminal,
  Bug,
  Rocket,
};

export function createIcon(icon: string | undefined): ReactElement | undefined {
  if (!icon || !(icon in icons)) return undefined;
  return createElement(icons[icon], { className: "size-4" });
}

"use client";
import type { Tab, Tool } from "@/config/features";
import { TOOL_COMPONENTS } from "./tools/registry";
import { ComingSoon } from "./ui";

export function ToolView({ tool, tab }: { tool: Tool; tab: Tab }) {
  const Built = tool.status === "built" ? TOOL_COMPONENTS[tool.key] : undefined;
  return Built ? <Built /> : <ComingSoon tool={tool} tab={tab} />;
}

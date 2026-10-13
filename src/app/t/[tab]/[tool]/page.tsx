import { notFound } from "next/navigation";
import { ALL_TOOLS, findTool } from "@/config/features";
import { ToolView } from "@/components/ToolView";

export function generateStaticParams() {
  return ALL_TOOLS.map((t) => {
    const [tab, tool] = t.key.split("/");
    return { tab, tool };
  });
}

export default async function ToolPage(props: PageProps<"/t/[tab]/[tool]">) {
  const { tab, tool } = await props.params;
  const hit = findTool(tab, tool);
  if (!hit) notFound();
  return <ToolView tool={hit.tool} tab={hit.tab} />;
}

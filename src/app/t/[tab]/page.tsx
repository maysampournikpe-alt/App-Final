import { notFound } from "next/navigation";
import { ALL_TABS, findTab } from "@/config/features";
import { TabView } from "@/components/TabView";

export function generateStaticParams() {
  return ALL_TABS.map((t) => ({ tab: t.id }));
}

export default async function TabPage(props: PageProps<"/t/[tab]">) {
  const { tab } = await props.params;
  const hit = findTab(tab);
  if (!hit) notFound();
  return <TabView tab={hit.tab} group={hit.group} />;
}

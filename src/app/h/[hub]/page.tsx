import { notFound } from "next/navigation";
import { findHub, HUBS } from "@/config/features";
import { HubView } from "@/components/HubView";

export function generateStaticParams() {
  return HUBS.map((h) => ({ hub: h.id }));
}

export default async function HubPage(props: PageProps<"/h/[hub]">) {
  const { hub } = await props.params;
  const found = findHub(hub);
  if (!found) notFound();
  return <HubView hub={found} />;
}

import type { Metadata } from "next";
import { DemoView } from "@/components/DemoView";

export const metadata: Metadata = { title: "Demo data", robots: { index: false, follow: false } };

export default function DemoPage() {
  return <DemoView />;
}

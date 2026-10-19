import type { Metadata } from "next";
import { StyleguideView } from "@/components/StyleguideView";

export const metadata: Metadata = { title: "Style guide", robots: { index: false, follow: false } };

export default function StyleguidePage() {
  return <StyleguideView />;
}

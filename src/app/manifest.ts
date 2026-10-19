import type { MetadataRoute } from "next";
import { BRAND } from "@/config/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BRAND.name}: find your next step`,
    short_name: BRAND.name,
    description: BRAND.tagline.en,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ece3d0",
    theme_color: "#0c5a60",
    lang: "en",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

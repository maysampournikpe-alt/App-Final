// Renders the PWA icons from public/icon.svg.
import sharp from "sharp";
import { readFileSync } from "node:fs";
const svg = readFileSync(new URL("../public/icon.svg", import.meta.url));
const out = (n) => new URL(`../public/${n}`, import.meta.url).pathname;
await sharp(svg).resize(192, 192).png().toFile(out("icon-192.png"));
await sharp(svg).resize(512, 512).png().toFile(out("icon-512.png"));
await sharp(svg).resize(180, 180).png().toFile(out("apple-touch-icon.png"));
// Maskable: icon at 70% on a solid field so platform masks do not clip it.
const inner = await sharp(svg).resize(360, 360).png().toBuffer();
await sharp({ create: { width: 512, height: 512, channels: 4, background: "#0c5a60" } })
  .composite([{ input: inner, gravity: "center" }]).png().toFile(out("icon-512-maskable.png"));
console.log("icons written");

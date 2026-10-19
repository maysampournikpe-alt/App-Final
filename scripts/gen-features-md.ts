// Generates FEATURES.md from src/config/features.ts so the list can never drift
// from what the sidebar shows. Run: npm run features:md
import { writeFileSync } from "node:fs";
import { GROUPS, ALL_TOOLS } from "../src/config/features";

const phaseName: Record<number, string> = {
  1: "Phase 1: Core (finder, coach, plans, profile, starter tools, test prep)",
  2: "Phase 2: Family, school, portfolio, deadlines, applications",
  3: "Phase 3: Discovery and college/career",
  4: "Phase 4: Study tools and skill building",
  5: "Phase 5: Planning, productivity and life skills",
  6: "Phase 6: People",
  7: "Phase 7: Wellbeing",
  8: "Phase 8: Local resources",
  9: "Phase 9: Motivation and fun",
  10: "Phase 10: Extra accessibility and trust",
};
const label = (s: string) => (s === "built" ? "Built" : "Future plan");

const built = ALL_TOOLS.filter((t) => t.status === "built").length;
let md = `# Features

Generated from \`src/config/features.ts\` (run \`npm run features:md\`). Do not edit by hand.
Status is **Built**, **In progress** or **Future plan**. Anything not Built appears in the app as a
"Coming soon" page that explains what it will do.

**${built} of ${ALL_TOOLS.length} features built.**

## By phase

| Phase | Built | Total |
|---|---|---|
`;
for (const p of Object.keys(phaseName).map(Number)) {
  const ts = ALL_TOOLS.filter((t) => t.phase === p);
  md += `| ${phaseName[p]} | ${ts.filter((t) => t.status === "built").length} | ${ts.length} |\n`;
}
md += `\n[LOCAL] = runs entirely on the device, works offline, no AI and no database.\n\n## By tab\n`;
for (const g of GROUPS) {
  md += `\n### ${g.name.en}\n`;
  for (const tab of g.tabs) {
    md += `\n#### ${tab.name.en}\n\n| Feature | Phase | Status | |\n|---|---|---|---|\n`;
    for (const t of tab.tools) md += `| ${t.name.en} | ${t.phase} | ${label(t.status)} | ${t.local ? "[LOCAL]" : ""} |\n`;
  }
}
writeFileSync(new URL("../FEATURES.md", import.meta.url), md);
console.log(`FEATURES.md: ${built}/${ALL_TOOLS.length} built`);

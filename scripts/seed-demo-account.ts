// Creates (or refreshes) a real demo account with sample data, for judges and your video.
// Run on YOUR computer, where Supabase is reachable:
//
//   DEMO_PASSWORD='pick-something-good' npm run demo:seed
//
// Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local. The service key is
// only used here, on your machine, and is never printed.
import { existsSync, readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { demoDocs } from "../src/lib/demo";
import { usernameToEmail } from "../src/lib/auth/rules";

for (const f of [".env.local", ".env"]) if (existsSync(f)) for (const line of readFileSync(f, "utf8").split("\n")) {
  const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY, password = process.env.DEMO_PASSWORD;
if (!url || !key) { console.error("Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local"); process.exit(1); }
if (!password || password.length < 8) { console.error("Set DEMO_PASSWORD (at least 8 characters)"); process.exit(1); }

const USERNAME = "demo_student";
const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

async function main() {
  const email = usernameToEmail(USERNAME);
  let id: string | undefined;
  const created = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { username: USERNAME } });
  if (created.data.user) id = created.data.user.id;
  else if (/already|registered|exists/i.test(created.error?.message ?? "")) {
    const { data } = await admin.from("profiles").select("id").eq("username", USERNAME).maybeSingle();
    id = data?.id;
    if (id) await admin.auth.admin.updateUserById(id, { password }); // refresh the password
  }
  if (!id) throw new Error(`Could not create or find the demo user: ${created.error?.message}`);

  const docs = demoDocs("en");
  const profile = docs.profile as { grade: number };
  await admin.from("profiles").upsert({ id, username: USERNAME, grade: profile.grade, lang: "en" });
  const now = new Date().toISOString();
  const rows = Object.entries(docs).map(([k, value]) => ({ user_id: id, key: k, value, updated_at: now }));
  const { error } = await admin.from("user_data").upsert(rows);
  if (error) throw error;
  console.log(`Demo account ready. Username: ${USERNAME}  Password: (the DEMO_PASSWORD you set)`);
  console.log("Tip: keep this password out of your public README; share it with judges through the submission form.");
}
main().catch((e) => { console.error(e.message ?? e); process.exit(1); });

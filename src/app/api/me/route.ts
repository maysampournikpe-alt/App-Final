import { NextResponse } from "next/server";
import { hasSupabaseServer, supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** Who is signed in on this device, if anyone. Never cached. */
export async function GET() {
  const noStore = { headers: { "Cache-Control": "no-store" } };
  if (!hasSupabaseServer()) return NextResponse.json({ status: "unavailable" }, noStore);
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ status: "guest" }, noStore);
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, grade, school, lang, interests, why")
    .eq("id", data.user.id)
    .maybeSingle();
  return NextResponse.json({ status: "signed-in", profile }, noStore);
}

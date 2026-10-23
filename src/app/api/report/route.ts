import { NextResponse } from "next/server";
import { z } from "zod";
import { reportQuestion } from "@/lib/ai/qbank";
import { allow, clientIp } from "@/lib/rate-limit";
import { hasSupabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const body = z.object({ id: z.string().regex(/^ai-[A-Za-z0-9_-]{3,120}$/) });

/** A student flags an AI-written question. Each person can report a question once a day; two reports take it out of the shared bank. */
export async function POST(req: Request) {
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });
  if (!hasSupabaseServer()) return NextResponse.json({ ok: true });
  const ip = await clientIp();
  if (!(await allow(`report:${ip}`, 40, 3600)) || !(await allow(`report:${ip}:${parsed.data.id}`, 1, 86400))) return NextResponse.json({ ok: true });
  await reportQuestion(parsed.data.id);
  return NextResponse.json({ ok: true });
}

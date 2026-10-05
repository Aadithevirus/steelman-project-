import { NextResponse } from "next/server";
import { RequestSchema } from "@/lib/schema";
import { AppError, runSteelman } from "@/lib/ai";

export const maxDuration = 120;

export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ success: false, error: "Malformed request." }, { status: 400 }); }

  const v = RequestSchema.safeParse(body);
  if (!v.success) return NextResponse.json({ success: false, error: v.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });

  try {
    const data = await runSteelman(v.data.claim);
    return NextResponse.json({ success: true, data });
  } catch (e) {
    if (e instanceof AppError) return NextResponse.json({ success: false, error: e.message }, { status: e.status });
    console.error(e);
    return NextResponse.json({ success: false, error: "Something went wrong on the server." }, { status: 500 });
  }
}

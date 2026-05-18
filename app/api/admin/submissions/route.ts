import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { listSubmissions } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  if (!isAuthenticated()) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const rows = await listSubmissions();
  return NextResponse.json({ ok: true, rows });
}

import { NextResponse } from "next/server";
import { submissionInput } from "@/lib/schema";
import { insertSubmission } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Geçersiz istek" },
      { status: 400 },
    );
  }

  const parsed = submissionInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Form alanları eksik veya hatalı", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const row = await insertSubmission({
      ...parsed.data,
      etkinlikler: parsed.data.etkinlikler.filter((e) => e.trim()),
    });
    return NextResponse.json({ ok: true, id: row.id });
  } catch (err) {
    console.error("submit failed:", err);
    return NextResponse.json(
      { ok: false, error: "Form kaydedilemedi, lütfen tekrar deneyin." },
      { status: 500 },
    );
  }
}

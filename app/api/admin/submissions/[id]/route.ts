import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { deleteSubmission, getSubmission } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  if (!isAuthenticated()) return NextResponse.json({ ok: false }, { status: 401 });
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ ok: false, error: "Geçersiz id" }, { status: 400 });
  }
  const row = await getSubmission(id);
  if (!row) return NextResponse.json({ ok: false, error: "Bulunamadı" }, { status: 404 });
  return NextResponse.json({ ok: true, row });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!isAuthenticated()) return NextResponse.json({ ok: false }, { status: 401 });
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ ok: false, error: "Geçersiz id" }, { status: 400 });
  }
  await deleteSubmission(id);
  return NextResponse.json({ ok: true });
}

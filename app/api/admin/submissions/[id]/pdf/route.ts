import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getSubmission } from "@/lib/db";
import { renderSubmissionPdf, pdfFilename } from "@/lib/pdf-server";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  if (!isAuthenticated()) return NextResponse.json({ ok: false }, { status: 401 });
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ ok: false, error: "Geçersiz id" }, { status: 400 });
  }
  const row = await getSubmission(id);
  if (!row) return NextResponse.json({ ok: false, error: "Bulunamadı" }, { status: 404 });

  try {
    const buffer = await renderSubmissionPdf(row);
    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${pdfFilename(row)}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    console.error("PDF render error:", e);
    return NextResponse.json(
      { ok: false, error: e?.message || "PDF render hatası" },
      { status: 500 },
    );
  }
}

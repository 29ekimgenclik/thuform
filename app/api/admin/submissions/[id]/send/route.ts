import { NextResponse } from "next/server";
import { z } from "zod";
import nodemailer from "nodemailer";
import { isAuthenticated } from "@/lib/auth";
import { getSubmission, markSent } from "@/lib/db";
import { renderSubmissionPdf, pdfFilename } from "@/lib/pdf-server";

export const runtime = "nodejs";

const sendBody = z.object({
  to: z.string().email(),
  cc: z.string().email().optional().or(z.literal("")).default(""),
  subject: z.string().min(1).max(200).optional(),
  message: z.string().max(5000).optional(),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!isAuthenticated()) return NextResponse.json({ ok: false }, { status: 401 });

  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ ok: false, error: "Geçersiz id" }, { status: 400 });
  }
  const row = await getSubmission(id);
  if (!row) return NextResponse.json({ ok: false, error: "Bulunamadı" }, { status: 404 });

  const parsed = sendBody.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Alıcı e-postası geçersiz" },
      { status: 400 },
    );
  }

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  if (!gmailUser || !gmailPass) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "GMAIL_USER veya GMAIL_APP_PASSWORD tanımlı değil. Vercel/Local env'ye ekleyin.",
      },
      { status: 500 },
    );
  }

  const fromName = process.env.MAIL_FROM_NAME || "Tepebaşı 29 Ekim Gençlik Merkezi";
  const from = `"${fromName}" <${gmailUser}>`;
  const subject =
    parsed.data.subject ||
    `THU Sosyal Sorumluluk Sonuç Raporu — ${row.ogrenciAdSoyad}`;

  const defaultMessage = [
    `Sayın ${row.ogretimUyesi || "Hocam"},`,
    "",
    "Tepebaşı Belediyesi 29 Ekim Gençlik Merkezi'nde gerçekleştirilen sosyal sorumluluk etkinliklerine ilişkin Topluma Hizmet Uygulamaları dersi sonuç raporu ekte yer almaktadır.",
    "",
    `Öğrenci: ${row.ogrenciAdSoyad}`,
    `T.C./Öğrenci No: ${row.tcKimlik}`,
    `Bölüm: ${row.okulFakulteBolum}`,
    "",
    "Saygılarımla,",
    "Tepebaşı Belediyesi Gençlik ve Spor Hizmetleri Müdürlüğü",
  ].join("\n");

  const text = parsed.data.message || defaultMessage;

  try {
    const buffer = await renderSubmissionPdf(row);
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: gmailUser, pass: gmailPass },
    });
    const info = await transporter.sendMail({
      from,
      to: parsed.data.to,
      cc: parsed.data.cc || undefined,
      subject,
      text,
      attachments: [
        {
          filename: pdfFilename(row),
          content: buffer,
          contentType: "application/pdf",
        },
      ],
    });
    await markSent(id, parsed.data.to);
    return NextResponse.json({ ok: true, messageId: info.messageId });
  } catch (err: any) {
    console.error("send failed:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Sunucu hatası" },
      { status: 500 },
    );
  }
}

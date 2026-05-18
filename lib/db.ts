import fs from "node:fs";
import path from "node:path";
import { sql } from "@vercel/postgres";
import type { SubmissionInput } from "./schema";

export type Submission = SubmissionInput & {
  id: number;
  status: "pending" | "sent";
  sent_at: string | null;
  sent_to: string | null;
  created_at: string;
};

const usePostgres = !!process.env.POSTGRES_URL;
const dataFile = path.join(process.cwd(), "data", "submissions.json");

function ensureDir() {
  const dir = path.dirname(dataFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readLocal(): Submission[] {
  ensureDir();
  if (!fs.existsSync(dataFile)) return [];
  try {
    return JSON.parse(fs.readFileSync(dataFile, "utf-8")) as Submission[];
  } catch {
    return [];
  }
}

function writeLocal(rows: Submission[]) {
  ensureDir();
  fs.writeFileSync(dataFile, JSON.stringify(rows, null, 2), "utf-8");
}

async function ensureTable() {
  if (!usePostgres) return;
  await sql`
    CREATE TABLE IF NOT EXISTS submissions (
      id SERIAL PRIMARY KEY,
      ogrenci_ad_soyad TEXT NOT NULL,
      ogretim_uyesi TEXT NOT NULL,
      tc_kimlik TEXT NOT NULL,
      telefon TEXT,
      okul_fakulte_bolum TEXT,
      etkinlikler JSONB NOT NULL,
      aktif_rol_dusunce TEXT,
      kazanim TEXT,
      topluma_fayda TEXT,
      belge_teslim_tarihi TEXT,
      hoca_email TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      sent_at TIMESTAMPTZ,
      sent_to TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
}

function rowToSubmission(r: any): Submission {
  return {
    id: r.id,
    ogrenciAdSoyad: r.ogrenci_ad_soyad,
    ogretimUyesi: r.ogretim_uyesi,
    tcKimlik: r.tc_kimlik,
    telefon: r.telefon ?? "",
    okulFakulteBolum: r.okul_fakulte_bolum ?? "",
    etkinlikler: Array.isArray(r.etkinlikler) ? r.etkinlikler : JSON.parse(r.etkinlikler),
    aktifRolDusunce: r.aktif_rol_dusunce ?? "",
    kazanim: r.kazanim ?? "",
    toplumaFayda: r.topluma_fayda ?? "",
    belgeTeslimTarihi: r.belge_teslim_tarihi ?? "",
    hocaEmail: r.hoca_email ?? "",
    status: r.status,
    sent_at: r.sent_at,
    sent_to: r.sent_to,
    created_at: r.created_at,
  };
}

export async function insertSubmission(s: SubmissionInput): Promise<Submission> {
  if (usePostgres) {
    await ensureTable();
    const result = await sql`
      INSERT INTO submissions (
        ogrenci_ad_soyad, ogretim_uyesi, tc_kimlik, telefon,
        okul_fakulte_bolum, etkinlikler,
        aktif_rol_dusunce, kazanim, topluma_fayda,
        belge_teslim_tarihi, hoca_email
      ) VALUES (
        ${s.ogrenciAdSoyad}, ${s.ogretimUyesi}, ${s.tcKimlik}, ${s.telefon ?? ""},
        ${s.okulFakulteBolum ?? ""}, ${JSON.stringify(s.etkinlikler)}::jsonb,
        ${s.aktifRolDusunce ?? ""}, ${s.kazanim ?? ""}, ${s.toplumaFayda ?? ""},
        ${s.belgeTeslimTarihi ?? ""}, ${s.hocaEmail ?? ""}
      )
      RETURNING *;
    `;
    return rowToSubmission(result.rows[0]);
  }
  const rows = readLocal();
  const nextId = (rows[rows.length - 1]?.id ?? 0) + 1;
  const row: Submission = {
    ...s,
    telefon: s.telefon ?? "",
    okulFakulteBolum: s.okulFakulteBolum ?? "",
    aktifRolDusunce: s.aktifRolDusunce ?? "",
    kazanim: s.kazanim ?? "",
    toplumaFayda: s.toplumaFayda ?? "",
    belgeTeslimTarihi: s.belgeTeslimTarihi ?? "",
    hocaEmail: s.hocaEmail ?? "",
    id: nextId,
    status: "pending",
    sent_at: null,
    sent_to: null,
    created_at: new Date().toISOString(),
  };
  rows.push(row);
  writeLocal(rows);
  return row;
}

export async function listSubmissions(): Promise<Submission[]> {
  if (usePostgres) {
    await ensureTable();
    const result = await sql`SELECT * FROM submissions ORDER BY created_at DESC;`;
    return result.rows.map(rowToSubmission);
  }
  return readLocal().slice().reverse();
}

export async function getSubmission(id: number): Promise<Submission | null> {
  if (usePostgres) {
    await ensureTable();
    const result = await sql`SELECT * FROM submissions WHERE id = ${id} LIMIT 1;`;
    if (result.rows.length === 0) return null;
    return rowToSubmission(result.rows[0]);
  }
  const rows = readLocal();
  return rows.find((r) => r.id === id) ?? null;
}

export async function markSent(id: number, to: string): Promise<void> {
  if (usePostgres) {
    await sql`
      UPDATE submissions
      SET status = 'sent', sent_at = NOW(), sent_to = ${to}
      WHERE id = ${id};
    `;
    return;
  }
  const rows = readLocal();
  const idx = rows.findIndex((r) => r.id === id);
  if (idx < 0) return;
  rows[idx] = {
    ...rows[idx],
    status: "sent",
    sent_at: new Date().toISOString(),
    sent_to: to,
  };
  writeLocal(rows);
}

export async function deleteSubmission(id: number): Promise<void> {
  if (usePostgres) {
    await sql`DELETE FROM submissions WHERE id = ${id};`;
    return;
  }
  const rows = readLocal().filter((r) => r.id !== id);
  writeLocal(rows);
}

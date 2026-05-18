"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Submission } from "@/lib/db";

export default function AdminDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [row, setRow] = useState<Submission | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch(`/api/admin/submissions/${params.id}`, {
      cache: "no-store",
    });
    if (res.status === 401) {
      router.replace("/admin/login");
      return;
    }
    const json = await res.json();
    if (!res.ok || !json.ok) {
      setError(json.error || "Form alınamadı");
      return;
    }
    setRow(json.row);
    setTo(json.row.hocaEmail || "");
    setSubject(
      `THU Sosyal Sorumluluk Sonuç Raporu — ${json.row.ogrenciAdSoyad}`,
    );
  };

  useEffect(() => {
    load();
  }, [params.id]);

  const send = async () => {
    if (!to) {
      setSendResult("Alıcı e-postası girin.");
      return;
    }
    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch(`/api/admin/submissions/${params.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, cc, subject, message }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setSendResult(json.error || "Gönderim başarısız");
      } else {
        setSendResult("E-posta gönderildi.");
        load();
      }
    } catch (e: any) {
      setSendResult(e?.message || "Sunucu hatası");
    } finally {
      setSending(false);
    }
  };

  const remove = async () => {
    if (!confirm("Bu gönderimi silmek istediğinize emin misiniz?")) return;
    const res = await fetch(`/api/admin/submissions/${params.id}`, {
      method: "DELETE",
    });
    if (res.ok) router.replace("/admin");
  };

  if (error) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="rounded bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
        <Link href="/admin" className="mt-4 inline-block text-sm text-brand">
          ← Listeye dön
        </Link>
      </main>
    );
  }
  if (!row) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8 text-sm text-slate-500">
        Yükleniyor…
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/admin" className="text-sm text-brand hover:underline">
          ← Listeye dön
        </Link>
        <div className="flex items-center gap-2">
          <a
            href={`/api/admin/submissions/${row.id}/pdf`}
            target="_blank"
            rel="noopener"
            className="rounded-md border border-brand px-3 py-1.5 text-sm font-medium text-brand hover:bg-brand hover:text-white"
          >
            PDF'i Aç
          </a>
          <button
            onClick={remove}
            className="rounded-md border border-rose-300 px-3 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-600 hover:text-white"
          >
            Sil
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section className="rounded-lg bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-slate-800">
            Form İçeriği
          </h2>
          <Field label="Öğrenci">{row.ogrenciAdSoyad}</Field>
          <Field label="Öğretim Üyesi">{row.ogretimUyesi}</Field>
          <Field label="T.C. / Öğrenci No">{row.tcKimlik}</Field>
          <Field label="Telefon">{row.telefon}</Field>
          <Field label="Okul / Fakülte / Bölüm">{row.okulFakulteBolum}</Field>
          <Field label="Belge Teslim Tarihi">{row.belgeTeslimTarihi}</Field>
          <Field label="Hoca E-postası">{row.hocaEmail}</Field>

          <div className="mt-3">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Etkinlikler
            </p>
            <ul className="mt-1 list-decimal space-y-0.5 pl-5 text-sm text-slate-700">
              {row.etkinlikler.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>

          <Block label="Aktif rol değerlendirmesi" value={row.aktifRolDusunce} />
          <Block label="Kazanım" value={row.kazanim} />
          <Block label="Topluma fayda" value={row.toplumaFayda} />

          {row.status === "sent" && (
            <div className="mt-3 rounded bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {row.sent_at &&
                `Gönderildi: ${new Date(row.sent_at).toLocaleString("tr-TR")}`}
              {row.sent_to && ` · ${row.sent_to}`}
            </div>
          )}
        </section>

        <section className="rounded-lg bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-slate-800">
            PDF Önizleme
          </h2>
          <iframe
            src={`/api/admin/submissions/${row.id}/pdf`}
            className="h-[60vh] w-full rounded border border-slate-200"
            title="PDF"
          />
        </section>
      </div>

      <section className="mt-6 rounded-lg bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-slate-800">
          Hocaya E-posta Gönder
        </h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Input label="Alıcı" value={to} onChange={setTo} type="email" />
          <Input label="CC (opsiyonel)" value={cc} onChange={setCc} type="email" />
          <div className="md:col-span-2">
            <Input label="Konu" value={subject} onChange={setSubject} />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Mesaj (boşsa varsayılan kullanılır)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[120px] w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-end gap-2">
          {sendResult && (
            <span
              className={
                "text-sm " +
                (sendResult.includes("gönderildi")
                  ? "text-emerald-600"
                  : "text-rose-600")
              }
            >
              {sendResult}
            </span>
          )}
          <button
            onClick={send}
            disabled={sending}
            className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
          >
            {sending ? "Gönderiliyor…" : "E-posta Gönder (PDF ekli)"}
          </button>
        </div>
      </section>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-2 grid grid-cols-3 gap-2 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="col-span-2 font-medium text-slate-800">
        {children || <span className="text-slate-400">—</span>}
      </span>
    </div>
  );
}

function Block({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-3">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
        {value || <span className="text-slate-400">—</span>}
      </p>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
      />
    </div>
  );
}

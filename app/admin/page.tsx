"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Submission } from "@/lib/db";

function fmtDateTime(iso: string) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return iso;
  }
}

export default function AdminListPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Submission[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    const res = await fetch("/api/admin/submissions", { cache: "no-store" });
    if (res.status === 401) {
      router.replace("/admin/login");
      return;
    }
    const json = await res.json();
    if (!res.ok || !json.ok) {
      setError(json.error || "Liste alınamadı");
      return;
    }
    setRows(json.rows);
  };

  useEffect(() => {
    load();
  }, []);

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Form Gönderimleri</h1>
          <p className="text-sm text-slate-600">
            Öğrencilerin doldurduğu THU Sonuç Raporları
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            Yenile
          </button>
          <button
            onClick={logout}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            Çıkış
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      {rows === null ? (
        <div className="rounded-lg bg-white p-6 text-sm text-slate-500 shadow-sm">
          Yükleniyor…
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-lg bg-white p-6 text-sm text-slate-500 shadow-sm">
          Henüz form gönderimi yok.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">Öğrenci</th>
                <th className="px-4 py-2">Öğretim Üyesi</th>
                <th className="px-4 py-2">Tarih</th>
                <th className="px-4 py-2">Durum</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 text-slate-500">{r.id}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {r.ogrenciAdSoyad}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{r.ogretimUyesi}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {fmtDateTime(r.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    {r.status === "sent" ? (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        Gönderildi
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                        Bekliyor
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/${r.id}`}
                      className="rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark"
                    >
                      Görüntüle
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

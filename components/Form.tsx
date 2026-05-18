"use client";

import { useState } from "react";
import type { FormData } from "@/lib/types";

type Props = {
  value: FormData;
  onChange: (next: FormData) => void;
  onPreview: () => void;
  submitLabel?: string;
  disabled?: boolean;
};

const inputCls =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30";
const labelCls = "block text-sm font-medium text-slate-700 mb-1";

export default function Form({
  value,
  onChange,
  onPreview,
  submitLabel = "Formu Gönder",
  disabled = false,
}: Props) {
  const [touched, setTouched] = useState(false);

  const update = <K extends keyof FormData>(key: K, v: FormData[K]) =>
    onChange({ ...value, [key]: v });

  const updateEtkinlik = (i: number, v: string) => {
    const next = [...value.etkinlikler];
    next[i] = v;
    update("etkinlikler", next);
  };

  const addEtkinlik = () =>
    update("etkinlikler", [...value.etkinlikler, ""]);

  const removeEtkinlik = (i: number) => {
    if (value.etkinlikler.length === 1) return;
    update(
      "etkinlikler",
      value.etkinlikler.filter((_, idx) => idx !== i),
    );
  };

  const requiredFilled =
    value.ogrenciAdSoyad.trim() &&
    value.ogretimUyesi.trim() &&
    value.tcKimlik.trim() &&
    value.etkinlikler.some((e) => e.trim());

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-4 rounded-lg bg-brand p-6 text-white shadow-md">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/header-logo.png"
          alt="Tepebaşı Belediyesi"
          className="h-16 w-16 rounded bg-white p-1"
        />
        <div className="flex-1 text-center">
          <h1 className="text-lg font-bold uppercase tracking-wide">
            Tepebaşı Belediyesi Gençlik ve Spor Hizmetleri Müdürlüğü
          </h1>
          <h2 className="text-base font-semibold uppercase">29 Ekim Gençlik Merkezi</h2>
          <h3 className="text-sm uppercase opacity-90">
            Sosyal Sorumluluk Programları Sonuç Raporu
          </h3>
          <p className="mt-2 text-xs opacity-80">Topluma Hizmet Uygulamaları Dersi</p>
        </div>
      </header>

      <section className="rounded-lg bg-white p-6 shadow-sm">
        <h4 className="mb-4 text-base font-semibold text-slate-800">
          Öğrenci Bilgileri
        </h4>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className={labelCls}>Öğrencinin Adı ve Soyadı</label>
            <input
              className={inputCls}
              value={value.ogrenciAdSoyad}
              onChange={(e) => update("ogrenciAdSoyad", e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelCls}>
              Üniversitede Gönüllülük Çalışmaları Dersini Aldığı Öğretim Üyesi
            </label>
            <input
              className={inputCls}
              value={value.ogretimUyesi}
              onChange={(e) => update("ogretimUyesi", e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelCls}>
              Öğrencinin T.C. Kimlik (Öğrenci) Numarası
            </label>
            <input
              className={inputCls}
              value={value.tcKimlik}
              onChange={(e) => update("tcKimlik", e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelCls}>Öğrencinin Telefon Numarası</label>
            <input
              className={inputCls}
              value={value.telefon}
              onChange={(e) => update("telefon", e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>
              Öğrencinin Okulu, Fakültesi ve Bölümü
            </label>
            <input
              className={inputCls}
              value={value.okulFakulteBolum}
              onChange={(e) => update("okulFakulteBolum", e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="rounded-lg bg-white p-6 shadow-sm">
        <h4 className="mb-2 text-base font-semibold text-slate-800">
          Destek Verilen Etkinlikler
        </h4>
        <p className="mb-3 text-sm text-slate-600">
          Lütfen destek verdiğiniz etkinlikleri tarih, saat aralığı, etkinlik
          açıklaması şeklinde örnekte belirtildiği gibi yazınız. Kaç etkinlik
          yaptıysanız maddeler halinde belirtiniz.
        </p>
        <p className="mb-4 rounded bg-slate-50 px-3 py-2 text-xs italic text-slate-600">
          ÖRN. 03.12.2016 – saat: 13:00-14:00 arası – İlkokul 3. Sınıf Matematik
          Etüdü
        </p>
        <div className="space-y-2">
          {value.etkinlikler.map((e, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-6 text-sm font-medium text-slate-500">
                {i + 1}.
              </span>
              <input
                className={inputCls}
                value={e}
                onChange={(ev) => updateEtkinlik(i, ev.target.value)}
                placeholder="GG.AA.YYYY – saat: HH:MM-HH:MM arası – etkinlik açıklaması"
              />
              <button
                type="button"
                onClick={() => removeEtkinlik(i)}
                disabled={value.etkinlikler.length === 1}
                className="rounded border border-slate-300 px-2 py-1 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                aria-label="Etkinliği sil"
              >
                Sil
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addEtkinlik}
          className="mt-3 rounded-md border border-brand px-3 py-1.5 text-sm font-medium text-brand hover:bg-brand hover:text-white"
        >
          + Etkinlik Ekle
        </button>
      </section>

      <section className="rounded-lg bg-white p-6 shadow-sm space-y-5">
        <div>
          <label className={labelCls}>
            Dahil olduğunuz sosyal sorumluluk programında aktif olarak rol
            aldığınızı düşünüyor musunuz?
          </label>
          <textarea
            className={inputCls + " min-h-[100px]"}
            value={value.aktifRolDusunce}
            onChange={(e) => update("aktifRolDusunce", e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Bu süreçte siz ne kazandınız?</label>
          <textarea
            className={inputCls + " min-h-[100px]"}
            value={value.kazanim}
            onChange={(e) => update("kazanim", e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>
            Bu sürecin topluma faydasının ne olduğunu düşünüyorsunuz? Siz topluma
            ne kattınız?
          </label>
          <textarea
            className={inputCls + " min-h-[100px]"}
            value={value.toplumaFayda}
            onChange={(e) => update("toplumaFayda", e.target.value)}
          />
        </div>
      </section>

      <section className="rounded-lg bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className={labelCls}>Belge Teslim Tarihi</label>
            <input
              type="date"
              className={inputCls}
              value={value.belgeTeslimTarihi}
              onChange={(e) => update("belgeTeslimTarihi", e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>
              Hocanızın E-posta Adresi
            </label>
            <input
              type="email"
              className={inputCls}
              value={value.hocaEmail}
              onChange={(e) => update("hocaEmail", e.target.value)}
              placeholder="hoca@universite.edu.tr"
            />
            <p className="mt-1 text-xs text-slate-500">
              Gönderim merkez tarafından onaylandıktan sonra yapılır.
            </p>
          </div>
        </div>
      </section>

      <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
        {!requiredFilled && touched && (
          <p className="text-sm text-rose-600">
            Lütfen ad-soyad, öğretim üyesi, T.C. no ve en az bir etkinlik
            doldurun.
          </p>
        )}
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            setTouched(true);
            if (requiredFilled) onPreview();
          }}
          className="rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-brand-dark disabled:opacity-60"
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
}

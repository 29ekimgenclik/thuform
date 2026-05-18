"use client";

import { useState } from "react";
import Form from "@/components/Form";
import { emptyForm, type FormData } from "@/lib/types";

export default function Page() {
  const [data, setData] = useState<FormData>(emptyForm);
  const [stage, setStage] = useState<"form" | "submitting" | "done" | "error">(
    "form",
  );
  const [errorMsg, setErrorMsg] = useState("");

  const submit = async () => {
    setStage("submitting");
    setErrorMsg("");
    try {
      const payload = {
        ...data,
        etkinlikler: data.etkinlikler.filter((e) => e.trim()),
      };
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setErrorMsg(json.error || "Form gönderilemedi.");
        setStage("error");
        return;
      }
      setStage("done");
    } catch (e: any) {
      setErrorMsg(e?.message || "Bağlantı hatası");
      setStage("error");
    }
  };

  if (stage === "done") {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16">
        <div className="rounded-lg bg-white p-8 text-center shadow-md">
          <div className="mb-4 text-5xl">✓</div>
          <h1 className="mb-2 text-2xl font-bold text-slate-800">
            Form Başarıyla Gönderildi
          </h1>
          <p className="text-slate-600">
            Tepebaşı Belediyesi Gençlik ve Spor Hizmetleri Müdürlüğü ekibi
            formunuzu inceleyip hocanıza ileteceğiniz e-postayı hazırlayacaktır.
          </p>
          <button
            onClick={() => {
              setData(emptyForm);
              setStage("form");
            }}
            className="mt-6 rounded-md border border-brand px-4 py-2 text-sm font-semibold text-brand hover:bg-brand hover:text-white"
          >
            Yeni Form Doldur
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <Form
        value={data}
        onChange={setData}
        onPreview={submit}
        submitLabel={stage === "submitting" ? "Gönderiliyor…" : "Formu Gönder"}
        disabled={stage === "submitting"}
      />
      {stage === "error" && errorMsg && (
        <div className="mt-4 rounded bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {errorMsg}
        </div>
      )}
    </main>
  );
}

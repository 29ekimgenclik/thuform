"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/admin";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error || "Giriş başarısız");
        return;
      }
      router.replace(next);
      router.refresh();
    } catch {
      setError("Sunucu hatası");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="w-full space-y-4 rounded-lg bg-white p-6 shadow-md"
    >
      <h1 className="text-xl font-bold text-slate-800">Admin Girişi</h1>
      <p className="text-sm text-slate-600">
        THU Sonuç Raporu yönetim paneline erişmek için şifre girin.
      </p>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Şifre
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          required
          autoFocus
        />
      </div>
      {error && (
        <div className="rounded bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {loading ? "Kontrol ediliyor…" : "Giriş Yap"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center justify-center px-4">
      <Suspense
        fallback={
          <div className="w-full rounded-lg bg-white p-6 text-sm text-slate-500 shadow-md">
            Yükleniyor…
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}

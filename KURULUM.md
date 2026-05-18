# THU Sonuç Raporu — Kurulum ve Deploy

## Akış

1. Öğrenci `/` adresinden formu doldurur ve gönderir.
2. Form, veritabanına `pending` olarak kaydedilir.
3. Yetkili `/admin` üzerinden şifreyle giriş yapar.
4. Listeden formu açar, PDF'i önizler, hocaya gönderilecek e-postayı hazırlar.
5. "E-posta Gönder" tıklanınca PDF eklenmiş halde Resend üzerinden gönderilir.
6. Gönderim sonrası form `sent` durumuna geçer.

## Yerel Geliştirme

```bash
npm install
cp .env.example .env.local
# .env.local içinde ADMIN_PASSWORD'u değiştirin
npm run dev
```

- `POSTGRES_URL` boşsa formlar lokal `data/submissions.json` dosyasına yazılır (sadece dev).
- `RESEND_API_KEY` boşsa e-posta gönderim API'si 500 döner; admin panel diğer yönleriyle çalışır.

## Vercel'e Deploy

### 1. Projeyi push edin

```bash
git init
git add -A
git commit -m "feat: THU sonuc raporu formu"
# GitHub repo oluşturup origin ekleyin
git push -u origin main
```

### 2. Vercel'de import edin

- vercel.com → Add New → Project → GitHub reposunu seçin
- Framework otomatik **Next.js** algılanır
- Deploy edin

### 3. Vercel Postgres ekleyin

- Proje sayfası → **Storage** → **Create** → **Postgres**
- Veritabanı oluşturulup projeye bağlanır
- `POSTGRES_URL` env değişkeni otomatik tanımlanır
- "Redeploy" deyin ki yeni env yüklensin

### 4. Diğer env değişkenlerini ekleyin

Settings → Environment Variables:

| Değişken                  | Değer                                                              |
| ------------------------- | ------------------------------------------------------------------ |
| `ADMIN_PASSWORD`          | Admin paneli için güçlü bir şifre                                  |
| `ADMIN_SESSION_SECRET`    | Rastgele 40+ karakter (örn. `openssl rand -hex 32` çıktısı)        |
| `RESEND_API_KEY`          | resend.com'dan API key                                             |
| `MAIL_FROM`               | `Tepebaşı Gençlik <onboarding@resend.dev>` veya doğrulanmış domain |

### 5. Resend ayarı

- resend.com hesabı açın, API key alın
- Test için `onboarding@resend.dev` from adresi kullanılabilir (sadece kendi adresinize göndermenize izin verir)
- Üretim için belediye domainini doğrulayın (`Domains` → `Add Domain`, DNS kayıtlarını ekleyin)

## Şifre Değiştirme

- Vercel Dashboard → Settings → Environment Variables → `ADMIN_PASSWORD` güncelle → Redeploy

## Form İçeriği Güncellemesi

Formdaki alanlar değişirse:
- `lib/schema.ts` — Zod schema
- `lib/types.ts` — TypeScript tipi
- `components/Form.tsx` — Form UI
- `lib/pdf-server.ts` — PDF render
- `lib/db.ts` — DB insert/select alanları

## Verileri Yedekleme

Vercel Postgres dashboard → Backups veya Vercel CLI ile:

```bash
vercel env pull .env.production
# psql ile bağlanıp pg_dump
```

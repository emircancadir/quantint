# Quantint

Kantitatif finans, veri bilimi ve makine öğrenmesi üzerine Türkçe içerik sitesi.
Full-stack Next.js uygulaması — orijinal Claude Design tasarımı birebir korunarak
gerçek bir web uygulamasına dönüştürüldü.

## Teknoloji

| Katman | Seçim |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Veritabanı | PostgreSQL 16 + Prisma 7 |
| Auth | Auth.js v5 — e-posta + parola (Argon2), USER/ADMIN rolleri |
| İçerik | Markdown DB'de (TR+EN kolonları); sunucuda render: Shiki + KaTeX + sanitize |
| i18n | next-intl — `/tr` ve `/en` route'ları, hreflang eşli slug'lar |
| Ticker | Keyless Frankfurter (FX) + CoinGecko (BTC); opsiyonel Twelve Data; veri yoksa "örnek veri" etiketi |
| Deploy | Docker Compose (app + Postgres + Caddy TLS) |

## Geliştirme

```bash
cp .env.example .env       # değerleri düzenleyin
docker compose up -d db    # Postgres (host port 5433)
npm install                # postinstall: prisma generate
npx prisma migrate dev     # şema + migration
npx prisma db seed         # 6 kategori, 10 yazı, admin kullanıcı
npm run dev                # http://localhost:3000
```

- **Site:** `/tr` (varsayılan), `/en`
- **Admin:** `/admin` — `.env`'deki `ADMIN_EMAIL` / `ADMIN_PASSWORD` ile giriş
- **RSS:** `/api/rss/tr`, `/api/rss/en` · **Sitemap:** `/sitemap.xml`

## Özellikler

- **Blog:** DB'den beslenen liste/detay, kategori filtresi, iki dilli slug'lar,
  OG görselleri, JSON-LD, sitemap/robots/RSS.
- **Admin paneli:** yazı CRUD (TR/EN Markdown editörü + canlı önizleme — sitedekiyle
  aynı render pipeline'ı), kategori yönetimi, yorum moderasyonu, abone listesi + CSV.
- **Hesaplar:** self-registration + giriş (site veritabanında, Argon2 hash).
  E-posta doğrulama/parola sıfırlama bilinçli olarak yok — e-posta işi askıda.
- **Yorumlar:** oturum zorunlu, moderasyon-önce (PENDING → APPROVED), sanitize,
  rate-limit + honeypot.
- **Bülten:** e-posta yalnızca DB'ye kaydedilir; hiçbir e-posta gönderilmez (askıda).
- **Ticker:** app içi poller (instrumentation) → `Quote` tablosu. Yalnızca gerçekten
  çekilen semboller gösterilir; hiç canlı veri yoksa örnek set "örnek veri" etiketiyle.

## Production (VPS)

```bash
# .env: DB_PASSWORD, AUTH_SECRET, SITE_DOMAIN, ADMIN_EMAIL, ADMIN_PASSWORD
docker compose -f docker-compose.prod.yml up -d --build
```

`migrate` servisi migration+seed'i uygular ve çıkar; `caddy` SITE_DOMAIN için
otomatik Let's Encrypt TLS alır.

## Dizin yapısı

```
prisma/            şema, migration'lar, seed
messages/          tr.json / en.json UI stringleri
src/
  app/[locale]/    site sayfaları (SSR)
  app/admin/       admin paneli (ADMIN rolü)
  app/api/         auth, rss, og
  components/      Splash, HeroCanvas, Ticker, Reveal, yorumlar, admin editör…
  lib/             db, auth, markdown pipeline, ticker, server actions
design-reference/  orijinal tasarım export'u (yalnız referans)
```

# Quantint Web Sitesi (v0.1)

Claude Design'dan export edilen `.dc.html` tasarımının **birebir, olduğu gibi**
çalışan hali. Tasarıma (renk, font, animasyon, metin, spacing) hiçbir müdahale
yapılmadı; yalnızca lokal çalıştırma için ince bir statik sunucu katmanı eklendi.

## Nasıl başlatılır

Node.js kurulu olması yeterli (harici bağımlılık / `npm install` gerekmez):

```bash
npm start
# veya
node server.js
```

Ardından tarayıcıda:

- **Ana site:** http://localhost:5173/
- **Preloader (ayrı tasarım):** http://localhost:5173/preloader.html

Farklı port için: `PORT=8080 node server.js`

## Teknoloji

Bu bir **Claude Design (`.dc.html`) export'u**. Klasik bir framework projesi
değil; kendi çalışma zamanına (`support.js`) sahip statik dosyalardan oluşur:

- `support.js` — DC runtime. `<x-dc>` şablonunu ve inline `DCLogic` sınıfını
  yorumlar; React + ReactDOM + Babel'i **unpkg CDN**'den yükleyip sayfayı
  `DOMContentLoaded`'da kendisi mount eder.
- Şablon + mantık tek dosyada: `<x-dc>` HTML şablonu, `sc-if` / `sc-for`
  koşul-döngüleri, `{{ }}` binding'leri ve altta `<script data-dc-script>`
  içinde `Component extends DCLogic`.
- `image-slot.js` — kullanıcı-doldurulabilir görsel placeholder bileşeni
  (`<x-import>` ile yüklenir). Authoring runtime dışında placeholder gösterir —
  Hakkında sayfasındaki portre ve footer avatarı bu yüzden placeholder'dır;
  tasarımın olduğu gibi hali budur.
- Fontlar: **IBM Plex Sans / IBM Plex Mono** (Google Fonts CDN).

> **Not — internet gerekir:** Runtime React/Babel'i unpkg'den, fontları Google
> Fonts'tan çeker. Bu tasarımın doğasında var; bir eksiklik değildir. Bağlantı
> yoksa sayfa boş kalır.

> **Not — `file://` ile açmayın:** `support.js` script olarak, `image-slot.js`
> dinamik import ile yüklendiğinden dosyayı çift tıklayıp açmak CORS'a takılır.
> Mutlaka `node server.js` üzerinden (HTTP) servis edin.

## Dosya yapısı

```
quantint.com.tr/
├── server.js          # Sıfır-bağımlılık Node statik sunucu (./site'ı servis eder)
├── package.json       # "npm start" -> node server.js
├── README.md
├── Quantint Web Sitesi Tasarımı v0.1.zip   # Orijinal kaynak (dokunulmadı)
└── site/              # Servis edilen kök — tasarım dosyaları
    ├── index.html                 # Ana site (Quantint Site.dc.html'in birebir kopyası)
    ├── preloader.html             # Preloader (Quantint Preloader.dc.html'in birebir kopyası)
    ├── Quantint Site.dc.html      # Orijinal ana tasarım
    ├── Quantint Preloader.dc.html # Orijinal preloader tasarımı
    ├── support.js                 # DC runtime
    ├── image-slot.js              # Görsel placeholder bileşeni
    ├── .thumbnail                 # Claude Design export artefaktı (render için gereksiz)
    └── uploads/                   # Export artefaktları (logo pngleri; sitede inline SVG kullanılıyor)
```

## Yapılan değişiklikler (tasarım dışı, minimum)

Tasarım HTML/CSS/JS'ine **hiçbir** değişiklik yapılmadı. Eklenenler yalnızca
çalıştırma altyapısı:

1. Zip `site/` klasörüne çıkarıldı.
2. Temiz kök URL için `Quantint Site.dc.html` → `index.html`,
   `Quantint Preloader.dc.html` → `preloader.html` olarak **byte-byte kopyalandı**
   (orijinaller de duruyor).
3. `server.js` (bağımlılıksız statik sunucu) ve `package.json` eklendi.

Kırık import / eksik dosya bulunmadı; tasarım export edildiği haliyle çalışıyor.
Doğrulama: headless Chrome ile render alındı — splash animasyonu, nav, ticker,
hero canvas, kod bölümü ve yazı kartları tasarımdaki gibi göründü.

/**
 * Seeds the six categories, the ten launch posts (ported from the design
 * export) and the admin account.
 *
 * CREATE-ONLY for content: production re-runs this on every deploy (the
 * compose `migrate` service), so existing categories/posts are never touched —
 * otherwise a redeploy would silently revert every admin edit back to the
 * seed. Only the admin's role is (re)asserted on re-run.
 *
 * Post bodies: the design shipped titles/excerpts only, so bodies start as
 * short scaffolds to be completed in the admin editor. The first post carries
 * real code + math so the Shiki/KaTeX pipeline is exercised end to end.
 */
import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { hash } from '@node-rs/argon2';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const CATEGORIES = [
  { key: 'ds', code: 'DS', nameTr: 'Veri Bilimi', nameEn: 'Data Science', order: 0 },
  { key: 'stat', code: 'ΣΔ', nameTr: 'İstatistik & Matematik', nameEn: 'Statistics & Math', order: 1 },
  { key: 'ml', code: 'ML', nameTr: 'ML & AI', nameEn: 'ML & AI', order: 2 },
  { key: 'py', code: 'PY', nameTr: 'Yazılım / Python', nameEn: 'Software / Python', order: 3 },
  { key: 'paper', code: 'PDF', nameTr: 'Akademik Makaleler', nameEn: 'Academic Papers', order: 4 },
  { key: 'trading', code: 'FX', nameTr: 'Piyasa / Trading', nameEn: 'Markets / Trading', order: 5 },
];

const KALMAN_BODY_TR = `Statik OLS betası neden yetmez? Durum-uzay modeliyle zamanla değişen hedge oranını tahmin edip bir eşbütünleşme stratejisi kuruyoruz.

## Durum-uzay modeli

Hedge oranını gizli durum olarak modelliyoruz:

$$y_t = \\beta_t x_t + \\epsilon_t, \\qquad \\beta_t = \\beta_{t-1} + \\eta_t$$

Burada $\\epsilon_t \\sim N(0, R)$ gözlem gürültüsü, $\\eta_t \\sim N(0, Q)$ durum gürültüsüdür.

## Python uygulaması

\`\`\`python
import numpy as np

def sharpe(r, rf=0.0, ann=252):
    ex = r - rf
    return np.sqrt(ann) * ex.mean() / ex.std()

# Kalman ile dinamik hedge oranı
for t in range(1, n):
    P_p = P[t-1] + Q
    K = P_p * x[t] / (x[t]**2 * P_p + R)
    b[t] = b[t-1] + K * (y[t] - x[t]*b[t-1])
    P[t] = (1 - K * x[t]) * P_p
\`\`\`

> Yazının tamamı hazırlanıyor — backtest sonuçları ve parametre seçimi eklenecek.`;

const KALMAN_BODY_EN = `Why a static OLS beta falls short: estimating a time-varying hedge ratio with a state-space model and building a cointegration strategy.

## The state-space model

We model the hedge ratio as a latent state:

$$y_t = \\beta_t x_t + \\epsilon_t, \\qquad \\beta_t = \\beta_{t-1} + \\eta_t$$

where $\\epsilon_t \\sim N(0, R)$ is observation noise and $\\eta_t \\sim N(0, Q)$ is state noise.

## Python implementation

\`\`\`python
import numpy as np

def sharpe(r, rf=0.0, ann=252):
    ex = r - rf
    return np.sqrt(ann) * ex.mean() / ex.std()

# Kalman-filtered dynamic hedge ratio
for t in range(1, n):
    P_p = P[t-1] + Q
    K = P_p * x[t] / (x[t]**2 * P_p + R)
    b[t] = b[t-1] + K * (y[t] - x[t]*b[t-1])
    P[t] = (1 - K * x[t]) * P_p
\`\`\`

> Full article in progress — backtest results and parameter selection to follow.`;

type SeedPost = {
  categoryKey: string;
  slugTr: string;
  slugEn: string;
  titleTr: string;
  titleEn: string;
  excerptTr: string;
  excerptEn: string;
  bodyTr?: string;
  bodyEn?: string;
  readMin: number;
  publishedAt: string; // ISO date
};

const POSTS: SeedPost[] = [
  {
    categoryKey: 'trading',
    slugTr: 'kalman-filtresi-ile-pairs-trading-dinamik-hedge-orani',
    slugEn: 'pairs-trading-with-kalman-filters-dynamic-hedge-ratios',
    titleTr: 'Kalman Filtresi ile Pairs Trading: Dinamik Hedge Oranı',
    titleEn: 'Pairs Trading with Kalman Filters: Dynamic Hedge Ratios',
    excerptTr:
      'Statik OLS betası neden yetmez? Durum-uzay modeliyle zamanla değişen hedge oranını tahmin edip bir eşbütünleşme stratejisi kuruyoruz.',
    excerptEn:
      'Why a static OLS beta falls short: estimating a time-varying hedge ratio with a state-space model and building a cointegration strategy.',
    bodyTr: KALMAN_BODY_TR,
    bodyEn: KALMAN_BODY_EN,
    readMin: 14,
    publishedAt: '2026-07-08',
  },
  {
    categoryKey: 'ml',
    slugTr: 'transformer-mimarileri-finansal-zaman-serilerinde-ise-yariyor-mu',
    slugEn: 'do-transformers-actually-work-on-financial-time-series',
    titleTr: 'Transformer Mimarileri Finansal Zaman Serilerinde İşe Yarıyor mu?',
    titleEn: 'Do Transformers Actually Work on Financial Time Series?',
    excerptTr:
      'Attention mekanizmasını getiri tahmininde LSTM ve klasik ARIMA ile karşılaştırıyoruz. Sonuçlar düşündüğünüz gibi olmayabilir.',
    excerptEn:
      'Benchmarking attention against LSTM and classical ARIMA for return forecasting. The results may surprise you.',
    readMin: 18,
    publishedAt: '2026-07-01',
  },
  {
    categoryKey: 'stat',
    slugTr: 'garch-ile-volatilite-tahmini-bist-100-uygulamasi',
    slugEn: 'volatility-forecasting-with-garch-a-bist-100-case-study',
    titleTr: 'GARCH ile Volatilite Tahmini: BIST 100 Uygulaması',
    titleEn: 'Volatility Forecasting with GARCH: A BIST 100 Case Study',
    excerptTr:
      'ARCH etkisini test etmekten GARCH(1,1) parametre yorumuna: volatilite kümelenmesini adım adım modelliyoruz.',
    excerptEn:
      'From testing ARCH effects to interpreting GARCH(1,1) parameters: modelling volatility clustering step by step.',
    readMin: 12,
    publishedAt: '2026-06-24',
  },
  {
    categoryKey: 'stat',
    slugTr: 'duraganlik-testleri-adf-kpss-ve-neden-ikisini-birden-kullanmalisiniz',
    slugEn: 'stationarity-tests-adf-kpss-and-why-you-should-use-both',
    titleTr: 'Durağanlık Testleri: ADF, KPSS ve Neden İkisini Birden Kullanmalısınız',
    titleEn: 'Stationarity Tests: ADF, KPSS and Why You Should Use Both',
    excerptTr:
      'Birim kök testlerinin mantığı, güç sorunları ve fiyat serilerinde en sık yapılan hatalar.',
    excerptEn:
      'The logic of unit-root tests, their power problems, and the most common mistakes with price series.',
    readMin: 11,
    publishedAt: '2026-06-17',
  },
  {
    categoryKey: 'trading',
    slugTr: 'backtestin-sessiz-katilleri-look-ahead-bias-ve-survivorship-bias',
    slugEn: 'the-silent-killers-of-backtests-look-ahead-and-survivorship-bias',
    titleTr: 'Backtest’in Sessiz Katilleri: Look-Ahead Bias ve Survivorship Bias',
    titleEn: 'The Silent Killers of Backtests: Look-Ahead and Survivorship Bias',
    excerptTr:
      'Kağıt üzerinde harika görünen stratejiler canlıda neden çöker? Yaygın metodolojik hataları örnek kodlarla gösteriyoruz.',
    excerptEn:
      'Why do strategies that look great on paper collapse live? Common methodological errors, shown with example code.',
    readMin: 15,
    publishedAt: '2026-06-10',
  },
  {
    categoryKey: 'ds',
    slugTr: 'finansal-veri-temizligi-eksik-bar-split-ve-temettu-duzeltmesi',
    slugEn: 'cleaning-financial-data-missing-bars-splits-and-dividend-adjustments',
    titleTr: 'Finansal Veri Temizliği: Eksik Bar, Split ve Temettü Düzeltmesi',
    titleEn: 'Cleaning Financial Data: Missing Bars, Splits and Dividend Adjustments',
    excerptTr:
      'Ham fiyat verisini modele hazır hale getirmek: pandas ile uçtan uca bir temizlik pipeline’ı.',
    excerptEn:
      'Getting raw price data model-ready: an end-to-end cleaning pipeline with pandas.',
    readMin: 13,
    publishedAt: '2026-06-03',
  },
  {
    categoryKey: 'py',
    slugTr: 'numpy-ile-vektorizasyon-backtestinizi-100-kat-hizlandirin',
    slugEn: 'vectorization-with-numpy-make-your-backtest-100x-faster',
    titleTr: 'NumPy ile Vektörizasyon: Backtest’inizi 100 Kat Hızlandırın',
    titleEn: 'Vectorization with NumPy: Make Your Backtest 100x Faster',
    excerptTr:
      'For döngülerinden broadcast’e: aynı stratejiyi üç farklı şekilde yazıp süreleri ölçüyoruz.',
    excerptEn:
      'From for-loops to broadcasting: writing the same strategy three ways and timing each.',
    readMin: 10,
    publishedAt: '2026-05-27',
  },
  {
    categoryKey: 'paper',
    slugTr: 'makale-ozeti-momentum-etkisi-30-yil-sonra-jegadeesh-titman',
    slugEn: 'paper-digest-momentum-30-years-on-rereading-jegadeesh-titman',
    titleTr:
      'Makale Özeti — Momentum Etkisi 30 Yıl Sonra: Jegadeesh & Titman’ı Yeniden Okumak',
    titleEn: 'Paper Digest — Momentum 30 Years On: Rereading Jegadeesh & Titman',
    excerptTr:
      'Klasik momentum makalesinin bulguları güncel veriyle hâlâ geçerli mi? Replikasyon ve tartışma.',
    excerptEn:
      'Do the classic momentum findings still hold on current data? A replication and discussion.',
    readMin: 16,
    publishedAt: '2026-05-20',
  },
  {
    categoryKey: 'ml',
    slugTr: 'ozellik-muhendisligi-finansal-zaman-serilerinden-model-girdisi-uretmek',
    slugEn: 'feature-engineering-turning-financial-time-series-into-model-inputs',
    titleTr: 'Özellik Mühendisliği: Finansal Zaman Serilerinden Model Girdisi Üretmek',
    titleEn: 'Feature Engineering: Turning Financial Time Series into Model Inputs',
    excerptTr:
      'Getiri, volatilite ve mikro yapı temelli özellikler; sızıntıya yol açmadan nasıl üretilir?',
    excerptEn:
      'Return-, volatility- and microstructure-based features — and how to build them without leakage.',
    readMin: 14,
    publishedAt: '2026-05-13',
  },
  {
    categoryKey: 'stat',
    slugTr: 'portfoy-optimizasyonuna-giris-markowitzden-riske-dayali-agirliklamaya',
    slugEn: 'intro-to-portfolio-optimization-from-markowitz-to-risk-based-weighting',
    titleTr: 'Portföy Optimizasyonuna Giriş: Markowitz’den Riske Dayalı Ağırlıklamaya',
    titleEn: 'Intro to Portfolio Optimization: From Markowitz to Risk-Based Weighting',
    excerptTr:
      'Ortalama-varyans optimizasyonunun teorisi, kırılganlıkları ve pratik alternatifleri.',
    excerptEn:
      'The theory of mean-variance optimization, its fragilities and practical alternatives.',
    readMin: 15,
    publishedAt: '2026-05-06',
  },
];

const scaffoldTr = (excerpt: string) =>
  `${excerpt}\n\n> Bu yazının tam içeriği hazırlanıyor.`;
const scaffoldEn = (excerpt: string) =>
  `${excerpt}\n\n> The full article is in progress.`;

async function main() {
  // Categories — create-only (see docblock).
  let createdCategories = 0;
  for (const c of CATEGORIES) {
    const existing = await prisma.category.findUnique({ where: { key: c.key } });
    if (!existing) {
      await prisma.category.create({ data: c });
      createdCategories++;
    }
  }
  console.log(`✓ categories: ${createdCategories} created, ${CATEGORIES.length - createdCategories} kept`);

  // Admin user
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set to seed the admin user.');
  }
  const passwordHash = await hash(password);
  const admin = await prisma.user.upsert({
    where: { email },
    update: { role: 'ADMIN' },
    create: { email, name: 'quantint', role: 'ADMIN', passwordHash },
  });
  console.log(`✓ admin: ${email}`);

  // Posts — create-only (see docblock).
  const categories = await prisma.category.findMany();
  const catByKey = new Map(categories.map((c) => [c.key, c.id]));
  let createdPosts = 0;
  for (const p of POSTS) {
    const categoryId = catByKey.get(p.categoryKey);
    if (!categoryId) throw new Error(`unknown category ${p.categoryKey}`);
    const existing = await prisma.post.findUnique({ where: { slugTr: p.slugTr } });
    if (existing) continue;
    await prisma.post.create({
      data: {
        slugTr: p.slugTr,
        slugEn: p.slugEn,
        titleTr: p.titleTr,
        titleEn: p.titleEn,
        excerptTr: p.excerptTr,
        excerptEn: p.excerptEn,
        bodyTr: p.bodyTr ?? scaffoldTr(p.excerptTr),
        bodyEn: p.bodyEn ?? scaffoldEn(p.excerptEn),
        readMinTr: p.readMin,
        readMinEn: p.readMin,
        status: 'PUBLISHED',
        publishedAt: new Date(p.publishedAt),
        categoryId,
        authorId: admin.id,
      },
    });
    createdPosts++;
  }
  console.log(`✓ posts: ${createdPosts} created, ${POSTS.length - createdPosts} kept`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

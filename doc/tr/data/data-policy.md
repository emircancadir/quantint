---
title: "quantint veri politikası"
document_id: QNT-DATA-POLICY
version: 0.1.0
status: draft
language: tr
source_of_truth: true
last_updated: 2026-09-11
---

# quantint veri politikası

[Ana belge](../quantint-beyin.md) · [English copy](../../en/data/data-policy.md)

## 1. Amaç ve değişmez ilkeler

Bu belge backtest ve paper trading piyasa verisinin kaynak seçimini, kalite kontrolünü, bar üretimini, eksik veri davranışını, saklamasını ve sürümlemesini tanımlar.

1. Veri doğruluğu, yeterli tarihsel derinlik ve yazılı kullanım hakkı pazarlık edilemez.
2. Kapanmamış bar strateji hesabında kullanılamaz.
3. Eksik veri önceki fiyat, forward-fill veya tahminle gizlenemez.
4. Her sonuç veri snapshot sürümüne bağlanır.
5. Aynı veri, strateji ve motor aynı sonucu üretmelidir.
6. Veri sağlayıcısı veya politika AI tarafından sessizce değiştirilemez.

> Teknik olarak ücretsiz fakat ticari kullanım hakkı belirsiz kaynak yalnız şirket içi geliştirmede kullanılabilir; dış kullanıcıya açık MVP’nin kalıcı veri kaynağı olamaz.

## 2. Sağlayıcının mevcut durumu

Binance adaydır, kesinleşmiş sağlayıcı değildir. Binance veya başka kaynak ancak ticari kullanım, saklama, cache/normalizasyon, grafik gösterimi, backtest/paper sonucu ve snapshot hakkı; Türkiye erişimi, maliyet ve limitler yazılı kanıtla doğrulandıktan sonra kabul edilebilir.

Public API’ye teknik erişim tek başına kullanım hakkı değildir. Değerlendirilecek Binance tüzel ürünü/API ortamı da henüz belirlenmemiştir.

## 3. Sağlayıcı kabul ölçütleri

| Ölçüt | Zorunlu MVP beklentisi |
|---|---|
| Tarihsel derinlik | En az 3 yıllık 1 saatlik OHLCV; ilk kabul ifadesine göre seçilen 8 paritenin tamamı. 4 saatlik ve günlük barlar üretilebilmelidir. |
| Veri bütünlüğü | Tamamlanmış bar oranı en az `%99,9`; tekrar kayıt, bozuk OHLC veya açıklanmayan uzun boşluk yok. |
| Güncellik | Kapanan bar en geç 5 dakikada alınabilir; açık/kapalı bar ayrımı nettir. |
| Kesinti yönetimi | Otomatik yeniden bağlantı ve backfill vardır; gecikmede paper duraklar, boşluk sessiz doldurulmaz. |
| API kapasitesi | En az 8 parite limitlere takılmadan izlenebilir; toplu sorgu ve tercihen WebSocket vardır. |
| Maliyet | MVP boyunca veri maliyeti `0 USD`; beklenmeyen kullanım/overage yok. |
| Ticari kullanım | Saklama, grafik gösterme, backtest ve paper sonucu üretme hakkı açıktır. |
| Veri saklama | Cache, normalizasyon ve tekrar üretim için snapshot izni vardır. |
| Paper/testnet | Zorunlu değildir; gelecekte canlı entegrasyon için testnet/demo güçlü tercihtir. |
| Türkiye erişimi | VPN gerektirmez; Türkiye’den hesap/API erişimi engellenmemiştir ve bölgesel kullanım şartları açıktır. |
| Teknik sürdürülebilirlik | Resmî dokümantasyon, sabit sembol kimliği, duyurulan API değişikliği ve makine okunur işlem kuralları vardır. |

Her zorunlu ölçüt sağlanmadan kaynak kalıcı MVP kaynağı olamaz.

## 4. Sabit `UNIVERSE_V1`

MVP çalışma zamanında dinamik likidite hesabı yapmaz. Başlangıç evreni:

1. BTC/USDT
2. ETH/USDT
3. BNB/USDT
4. SOL/USDT
5. XRP/USDT
6. DOGE/USDT
7. ADA/USDT
8. TRX/USDT
9. AVAX/USDT
10. LINK/USDT
11. DOT/USDT
12. BCH/USDT
13. LTC/USDT
14. UNI/USDT
15. NEAR/USDT

Liste günlük/dönemsel hacim sıralamasıyla kendiliğinden değişmez ve doğrulanmış “tüm zamanların toplam hacim sıralaması” olarak yorumlanmaz. MVP için likit ve kullanıcı ilgisi bulunan pratik sabit katalogdur. Her sonuç evren sürümünü taşır.

Her strateji tek paritededir. Başka pariteye kopyalar ayrı test ve paper çalışmasıdır.

## 5. Evren sürümleme

`UNIVERSE_V1` sessizce değiştirilemez. Ekleme/çıkarma/değiştirme için gerekçe ve veri kanıtı, kalite ve kullanım hakkı kontrolü, etki analizi ve açık insan onayı gerekir; sonuç yeni `UNIVERSE_V2` gibi sürüm oluşturur. Eski sonuçlar eski evrende kalır.

Bugünün listesi geçmişe uygulanamaz. Varlık listeleme öncesi veya veri olmayan dönemde işlem göremez; başka sembol geçmişi sessizce birleştirilemez. Delist edilen paritenin aktif paper çalışması otomatik durdurma koşuluna girer.

## 6. Kaynak bar standardı

Temel veri 1 saatlik OHLCV bardır. Her bar en az sabit sembol kimliği, başlangıç/bitiş zamanı, open/high/low/close/volume, açık/tamamlanmış durumu, kaynak ve veri/snapshot kimliği taşır. Tüm zamanlar UTC’ye normalize edilir.

Yalnız tamamlanmış ve doğrulanmış bar gösterge, sinyal, backtest, paper ve benchmark hesabında kullanılır.

## 7. 4 saatlik ve günlük bar üretimi

Üst zaman dilimleri yalnız tamamlanmış 1 saatlik barlardan deterministik üretilir ve UTC sınırlarını kullanır. Kaynak bar eksikse üst bar tamamlanmış sayılmaz. Açık veya eksik kaynak bar, tahmin, önceki değer veya sessiz hacim/fiyat tamamlaması kullanılamaz. Aynı snapshot aynı üst barları üretir.

## 8. Veri bütünlüğü kontrolleri

En az şunlar denetlenir:

- Tekrar timestamp/bar,
- Eksik bar ve açık/tamamlanmış ayrımı,
- Bozuk OHLC veya açıklanamayan fiyat/hacim,
- Zaman sırası ve beklenen aralık uyuşmazlığı,
- Sembol kimliği değişimi,
- Kaynak ile normalize kayıt arasındaki izlenebilirlik.

Tamamlanmış bar oranı en az `%99,9`’dur. İki bardan uzun açıklanamayan boşluk backtesti reddeder. Daha kısa boşluklar da doldurulmaz; gerçekleşme fiyatı belirlenemiyorsa veri hatası verilir ve başka bar kullanılmaz.

## 9. Canlı veri gecikmesi

Kapanmış bar en geç beklenen kapanıştan 5 dakika sonra alınmalı ve doğrulanmalıdır. Aksi durumda paper otomatik duraklar, yeni sinyal/giriş oluşmaz, sorun görünür olur, yeniden bağlantı/backfill denenir ve barlar kronolojik işlenir. Eksiklik bitmeden normal çalışma sürmez.

## 10. Kesinti ve backfill

Kaynak yeniden bağlantı, son başarılı barı bulma, eksik aralık sorgusu, toplu geçmiş veri, kronolojik işleme ve tekrar kayıt tespiti sunmalıdır.

Backfill kaynağı/sürümü kaydedilir, normal veriyle aynı kontrollerden geçer ve daha önce işlenen event ikinci işlem oluşturmaz. Dönem tam doğrulanamazsa paper sürmez. Kesinti ve replay geçmişten silinmez.

Birincil ve backfill verisinin farklı sağlayıcılardan gelip gelemeyeceği henüz kararlaştırılmamıştır.

## 11. Listeleme, sembol ve piyasa kuralları

Sağlayıcı sabit/takip edilebilir sembol kimlikleri, listing/delisting bilgisi, makine okunur minimum emir ve lot adımı ile resmî API değişiklik duyuruları sunmalıdır.

Sembol değişimi, token dönüşümü, yeniden adlandırma veya piyasa taşınması geçmişe sessizce uygulanamaz. Minimum emir ve lot adımı gerçekleşme döneminde geçerli kurala göre değerlendirilir; tarihsel kural sürümlerinin kaynağı henüz kararlaştırılmamıştır.

## 12. Saklama ve tekrar üretilebilirlik

quantint’in geçmişi cache etme, normalize etme, Parquet saklama, snapshot tutma, grafikte gösterme, backtest/paper sonucu üretme ve uzun süreli dosyayı S3 uyumlu depoda saklama hakkı yazılı olmalıdır.

Her sonuç en az veri kaynağı/snapshot, normalizasyon veya bar üretim sürümü, `UNIVERSE`, strateji ve motor sürümlerine bağlanır. Snapshot değişirse eski sonuç üzerine yazılmaz; yeni çalıştırma yeni sonuçtur.

## 13. Hata görünürlüğü

Uygulanabildiği ölçüde kullanıcı ve yönetim ekranı son doğrulanmış barı, gecikmeyi, eksik aralığı, backfill durumunu, doğrulama hatasını, etkilenen parite/zaman dilimini, duraklayan paper çalışmalarını, snapshot sürümünü ve kaynağın kullanılamadığı süreyi gösterir. Boşluk, sağlayıcı değişimi veya düzeltme gizlenemez.

## 14. Sağlayıcı değişikliği

Sağlayıcı değişikliği kritiktir ve AI/otomasyon tarafından yapılamaz. Yeni kaynağın tüm ölçütleri ve yazılı hakları doğrulanır, eski/yeni barlar karşılaştırılır, sonuç etkisi gösterilir, insan onayı alınır ve yeni veri/snapshot sürümü oluşturularak changelog ile karar kaydına işlenir. Eski sonuçlar yeni veriyle sessizce yazılmaz.

## 15. MVP dışında

- Dakikalık, saniyelik, tick veya order-book verisi,
- Scalping ve yüksek frekans verisi,
- Gerçek kullanıcı borsa hesabı, bakiye veya işlem geçmişi,
- Bugünkü likidite listesini geçmişe uygulayan dinamik evren,
- Kullanım hakkı belirsiz veriyi dış kullanıcıya sunma,
- Eksik fiyatı tahminle tamamlama.

## 16. Karar bekleyen konular

1. Kalıcı MVP sağlayıcısı ve değerlendirilecek Binance ortamı.
2. Kabul testindeki 8 paritenin hangileri olduğu ve üç yıllık derinliğin 8 mi `UNIVERSE_V1` içindeki 15 paritenin tamamı mı için gerektiği.
3. Canlı ile tarihsel/backfill kaynağının aynı olma zorunluluğu, yedek kaynak ve otomatik geçiş.
4. Ticari kullanım hakkını kabul etmek için gerekli belge/hukuk incelemesi.
5. Tarihsel minimum emir ve lot adımı kaynağı.
6. Sembol değişimi, token dönüşümü, fork ve redenomination birleştirme politikası.
7. Parquet fiziksel düzeni ve bölümleme standardı.
8. S3 uyumlu obje deposu sağlayıcısı ve veri/snapshot saklama süreleri.

Bu konular AI veya uygulama tarafından varsayımla doldurulamaz.

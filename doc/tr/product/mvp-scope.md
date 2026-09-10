---
title: "quantint MVP kapsamı"
document_id: QNT-PRODUCT-MVP
version: 0.1.0
status: draft
language: tr
source_of_truth: true
last_updated: 2026-09-11
---

# quantint MVP kapsamı

[Ana belge](../quantint-beyin.md) · [English copy](../../en/product/mvp-scope.md)

## 1. Amaç

quantint MVP; kullanıcının yatırım fikrini kod yazmadan açık ve çalıştırılabilir bir algoritmik stratejiye dönüştürmesini, geçmiş verilerde sınamasını ve bundan sonra gelen gerçek piyasa verileri üzerinde sanal portföyle izlemesini sağlar.

> Fikrini anlat veya görsel olarak oluştur → kuralları netleştir → strateji kartını incele → açıkça onayla → backtest yap → sanal ortamda çalıştır → sonuçları takip et

Nihai çıktı yalnızca çalışan ekranlardan oluşan bir demo değildir. Hesap, strateji oluşturma, doğrulama, backtest, paper trading, izleme, hata görünürlüğü ve tekrar üretilebilirlik birlikte çalışmalıdır.

## 2. Ürün konumlandırması

quantint bir finansal teknoloji ürünüdür. Kullanıcının kendi fikrini sistematik kurallara dönüştürmesine ve davranışını araştırmasına yardım eder.

- Kâr garantisi vermez.
- Geçmiş veya sanal performansı gelecekteki performansın garantisi gibi sunmaz.
- MVP’de yatırımcı adına gerçek işlem yapmaz.
- MVP’de borsa hesabına, gerçek bakiyeye veya gerçek portföye bağlanmaz.
- Kullanıcıya gösterilecek kesin hukuki metinler ayrıca onaylanacaktır.

## 3. Hedef kullanıcı ve pazar

İlk hedef; temel yatırım kavramlarını, RSI, hareketli ortalama ve al-sat sinyali gibi göstergeleri bilen fakat kod yazamayan orta seviye bireysel yatırımcıdır. Tam profesyonel quant veya yüksek frekanslı trader hedeflenmez.

İlk yoğunluk Türkiye’dir. Ürün gelecekte küresel kullanıma ve BIST, Nasdaq veya FX gibi piyasalara genişleyebilecek esneklikte tasarlanır; bu genişlemeler MVP taahhüdü değildir.

### MVP piyasa kapsamı

- Öncelik kripto varlıklardır.
- USDT pariteleri kullanılır.
- Sabit ve sürümlü `UNIVERSE_V1` bulunur.
- Her strateji tek pariteye bağlıdır.
- Zaman dilimleri `1h`, `4h` ve `1d`’dir.
- Yalnız long ve USDT nakde dönüş desteklenir.

Parite ve veri ayrıntıları [veri politikasında](../data/data-policy.md) tanımlanır.

### MVP dışında

- Dakikalık, saniyelik, scalping ve yüksek frekanslı stratejiler,
- Haftalık zaman dilimi,
- Short, kaldıraç ve borçlanma,
- Ortak sermayeli çoklu-parite portföyü,
- BIST, Nasdaq ve FX,
- Gerçek para, borsa hesabı bağlantısı ve gerçek emir gönderimi.

## 4. Kullanıcı hesabı ve temel kayıtlar

Kullanıcı:

- Hesap oluşturup oturum açabilmeli,
- Taslak ve onaylanmış strateji sürümlerini görebilmeli,
- Backtest sonuçlarına yeniden erişebilmeli,
- Paper çalışmalarını ve sanal işlemlerini takip edebilmeli,
- Stratejiyi duraklatabilmeli veya durdurabilmeli,
- Stratejiyi kopyalayabilmeli,
- Değişiklikle yeni sürüm oluşturabilmelidir.

Üründe ayrıca kullanıcı yönetimi, strateji kayıtları, temel eğitim içeriği, yönetim ekranı, görünür veri/sistem hataları ve sonuçları yeniden üretmeye yetecek denetim izi bulunmalıdır. Yönetim ekranının ayrıntılı yetkileri henüz kararlaştırılmamıştır.

## 5. Strateji oluşturma yolları

### 5.1 AI ile oluşturma

Kullanıcı teknik format yazmak zorunda değildir. Örneğin:

> BTC’de 20 EMA, 50 EMA’yı yukarı kesince al; RSI çok yükselince çık.

Sistem bu mesajı doğrudan çalıştırmaz. Önce:

1. Anladığını sade biçimde özetler.
2. Yalnız sonucu değiştiren eksik veya belirsiz kuralları belirler.
3. Soruları mümkün olduğunca seçenekli butonlarla ve aynı anda iki veya üç soru hâlinde sorar.
4. Yanıtlarla strateji kartını canlı günceller.
5. Desteklenmeyen talebi yaklaşık bir kurala dönüştürmez.

AI yalnızca `needs_clarification`, `strategy_draft` veya `unsupported` çıktılarından birini üretebilir.

### 5.2 Görsel ve manuel oluşturma

Kullanıcı AI olmadan:

1. Parite ve zaman dilimini seçer.
2. Giriş ve çıkış koşullarını satır olarak ekler.
3. Gösterge, operatör ve parametreleri seçer.
4. Desteklenen stop-loss, take-profit, zaman çıkışı ve yeniden giriş ayarlarını yapar.
5. Pozisyon büyüklüğünü belirler.
6. Strateji kartını inceleyip onaylar.

AI kotası bittiğinde veya servis kesildiğinde manuel yol eksiksiz çalışmaya devam etmelidir.

### 5.3 Hazır şablonlar

Kullanıcı hazır bir şablondan başlayabilmeli ve kuralları değiştirebilmelidir. Şablonların sayısı ve içeriği henüz kararlaştırılmamıştır. Her şablon diğer yollarla aynı doğrulama ve sürümleme sürecinden geçer.

### 5.4 Ortak strateji sözleşmesi

AI, manuel oluşturucu ve şablonlar aynı standart `Strategy JSON` yapısını üretir. Hepsi aynı şema, kapsam, parametre ve mantık kontrolünden; aynı motor ön kontrolünden ve aynı insan onayından geçer. Kesin sözleşme [strateji dili](../engine/strategy-language.md) ile sınırlandırılır.

## 6. AI katmanı

### Rol ve yetki sınırı

AI doğal dili strateji taslağına dönüştürür, belirsizlikleri sorar, desteklenmeyen özelliği bildirir ve son kuralları sade bir paragrafla açıklar. AI:

- Finansal hesaplamanın otoritesi değildir,
- Gizli varsayım ekleyemez,
- Keyfî Python, SQL veya başka çalıştırılabilir kod üretemez,
- Kullanıcı adına parametre seçip kâr optimizasyonu yapamaz,
- Backtest, paper çalışma veya canlı emir başlatamaz,
- İnsan onayının yerine geçemez.

### Sağlayıcı ve çalışma biçimi

- MVP’de yalnız OpenAI kullanılır.
- Çağrılar sunucu üzerinden yapılır; API anahtarı tarayıcıya gönderilmez.
- Responses API ve JSON Schema tabanlı Structured Outputs kullanılır.
- Structured Outputs nihai güvenlik kanıtı değildir; deterministik doğrulayıcı son otoritedir.
- Sağlayıcı bağımsız adaptör korunur; Anthropic veya Google gibi ikinci sağlayıcılar MVP kapsamı dışındadır.
- Model adı kod içine sabitlenmez, yönetim ayarından değiştirilebilir.

Resmî başvuru kaynakları:

- [OpenAI Responses API](https://developers.openai.com/api/reference/cli/resources/responses/methods/create)
- [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)
- [OpenAI API veri kontrolleri](https://developers.openai.com/api/docs/guides/your-data)

### Maliyet ve kullanım kontrolü

MVP’de AI maliyetini quantint karşılar; kullanıcıdan API anahtarı istenmez. Kullanıcı başına aylık mesaj kotası, strateji başına 8–10 konuşma turu hedefi ve kullanıcı/IP hız sınırı uygulanmalıdır. Kesin sayısal kota ve tek tur sınırı ayrıca kararlaştırılacaktır. Kota bittiğinde manuel oluşturucu açık kalır. Kullanıcının kendi API anahtarını kullanması MVP dışındadır.

Uzun sohbet geçmişi yerine yalnız güncel strateji durumu ve gerekli bağlam gönderilmelidir.

### Modele gönderilebilen bilgiler

- Stratejiyle ilgili kullanıcı mesajı,
- Dil ve bölge tercihi,
- Seçilen parite ve zaman dilimi,
- Güncel strateji taslağı,
- Desteklenen kural kataloğu,
- Açıklayıcı soruların cevapları,
- Kullanıcı isterse motorun ürettiği özet metrikler ve uyarılar.

### Modele gönderilmeyen bilgiler

- Ham OHLCV veya büyük piyasa veri dosyaları,
- İsim, e-posta, telefon ve ödeme bilgileri,
- Borsa API anahtarı, erişim tokenı veya cüzdan adresi,
- Gerçek bakiye, portföy ve işlem geçmişi,
- Gereksiz loglar ve görev için gerekmeyen tüm sohbet geçmişi.

Hassas bilgiler istekten önce maskelenir. Kullanıcıya hangi verilerin sağlayıcıya aktarıldığı açıklanır. API isteğinde `store: false` kullanılır; bu ayar Responses uygulama durumunun saklanmasını kapatır fakat tek başına Zero Data Retention garantisi vermez. 2026-09-11 tarihinde doğrulanan OpenAI politikasına göre API verileri kullanıcı açıkça katılmadıkça model eğitiminde kullanılmaz; standart kötüye kullanım izleme kayıtları 30 güne kadar tutulabilir. Zero Data Retention ancak uygunluk ve sağlayıcı onayı varsa değerlendirilir. Bu bilgiler yayımdan önce güncel resmî kaynakla yeniden doğrulanır.

### Doğrulama hattı

AI taslağı çalıştırılmadan önce:

1. Şema,
2. Desteklenen kapsam,
3. Parametre sınırları,
4. Mantık ve çelişki,
5. Geleceğe bakma güvenliği,
6. Keyfî kod/dış bağlantı/short/kaldıraç/canlı emir güvenliği,
7. Küçük veri setinde motor ön kontrolü,
8. Strateji kartında insan onayı

adımlarından geçer. Bilinmeyen alanlar reddedilir.

## 7. Strateji kartı

Konuşma veya manuel düzenleme sırasında canlı güncellenen kart en az şunları gösterir:

- Strateji adı, parite ve zaman dilimi,
- Giriş ve çıkış kuralları,
- İsteğe bağlı stop-loss, take-profit ve zaman çıkışı,
- Pozisyon büyüklüğü ve yeniden giriş davranışı,
- Sinyal ve gerçekleşme zamanı,
- Yön, komisyon ve slippage,
- Backtest dönemi.

Kullanıcı her alanı konuşarak veya alana tıklayarak değiştirebilir. Kart; eksik çıkışı, çelişkiyi, desteklenmeyen mantığı, sınır dışı parametreyi, uygulanamaz pozisyonu, yetersiz veri/ısınmayı ve çalıştırmayı engelleyen hatayı görünür gösterir.

Son aşamada AI çalıştırılacak stratejiyi tek paragrafta sade biçimde açıklar.

## 8. Onay ve sürümleme

Backtest yalnız kullanıcı **“Kuralları onayla ve backtesti başlat”** eylemine açıkça bastığında çalışır.

- Strateji kartı ve `Strategy JSON` birlikte sürümlenir ve kilitlenir.
- Onaylanan sürüm değişmezdir.
- Sonraki her değişiklik yeni sürüm ve yeni kullanıcı onayı gerektirir.
- Hangi veri, motor, maliyet ve tarih ayarlarıyla çalıştığı kaydedilir.
- Aktif paper stratejisi doğrudan değiştirilemez; yeni sürüm ve yeni paper çalışma gerekir.

## 9. Backtest ve sonuç deneyimi

Backtest tarih aralığı seçilebilir olmalı; yetersiz süre veya işlem sayısı görünür uyarı üretmelidir. Net sonuç maliyetleri içermeli, aynı varlığın buy-and-hold sonucu gösterilmeli ve aynı sürümlerle tekrar üretilebilmelidir.

Sonuçlar ayrı gösterilir:

1. Geliştirme dönemi,
2. Görülmemiş test dönemi,
3. Tüm dönem.

Kullanıcı önce geliştirme sonucunu görür; son onay ve kilitten sonra test sonucu açılır. Testi gördükten sonra parametre değişirse yeni sürüm `yeniden optimize edilmiş` sayılır ve denenen sürüm sayısı kaydedilir. Geliştirmede iyi, testte belirgin kötüleşen strateji için `olası aşırı uyum` uyarısı gösterilir.

Üst alanda yalnız altı ana değer bulunur:

1. Net toplam getiri,
2. Buy-and-hold farkı,
3. Maksimum düşüş,
4. Sharpe,
5. Tamamlanmış işlem sayısı,
6. Maruz kalma süresi.

Diğerleri `Ayrıntılı performans` bölümündedir. Ana değerlendirme görülmemiş test dönemidir. Kesin matematik [backtest şartnamesindedir](../engine/backtest.md).

## 10. Paper trading ve panel

Paper çalışma; tamamlanmış backtest, kilitli strateji, belirlenmiş maliyet/risk kuralları ve gerçek işlem olmadığına dair kullanıcı kabulü olmadan başlayamaz. 30’dan az backtest işlemi varsa ek `yetersiz örneklem` onayı gerekir. Başlatma yalnız **“Stratejiyi onayla ve paper trade’i başlat”** eylemiyle yapılır.

Panel en az şunları bir araya getirir:

- Taslaklar ve onaylanmış strateji sürümleri,
- Devam eden/tamamlanan backtestler,
- Aktif, duraklatılmış ve durmuş paper çalışmalar,
- Sanal bakiye, açık pozisyon ve işlemler,
- Net performans ve maliyet etkisi,
- Son işlenen bar ve veri/motor sağlık uyarıları.

Paper worker web sayfası kapalıyken de 7/24 çalışabilmelidir. Veri gecikirse veya bütünlük doğrulanamazsa tahmini işlem üretmez; çalışmayı duraklatır ve nedeni gösterir. Ayrıntılar [paper trading şartnamesindedir](../engine/paper-trading.md).

## 11. Hata görünürlüğü ve tekrar üretilebilirlik

Eksik/gecikmiş veri, kapanmamış bar, yetersiz gösterge geçmişi, geçersiz strateji, eksik gerçekleşme mumu, worker hatası, AI kesintisi/kota bitmesi ve sürüm uyuşmazlıkları kullanıcıya açıkça gösterilir. Sistem eksik fiyat tahmin edemez, başka bar kullanamaz, boşluğu sessizce dolduramaz veya doğrulanmamış AI çıktısını çalıştıramaz.

Her sonuç; kullanıcı, değişmez strateji sürümü ve JSON’u, motor sürümü, veri snapshot/akış sürümü, parite, zaman dilimi, UTC aralığı, maliyet ayarları, iş kimliği, zaman ve hata durumuyla ilişkilendirilmelidir. Aynı strateji, motor ve veri aynı sonucu üretmelidir.

## 12. Eğitim içeriği

MVP; strateji kuralı ve sinyal, tamamlanmış mum, komisyon ve slippage, backtest ile paper farkı, maksimum düşüş, aşırı uyum, yetersiz örneklem ve geçmiş performansın gelecek garantisi olmaması konularını açıklamalıdır. İçeriğin biçimi ve yayın süreci henüz kararlaştırılmamıştır.

## 13. Teknik mimari sınırı

```text
Next.js uygulaması
Kullanıcı arayüzü, oturum, strateji kartı ve sonuç ekranları
        ↓ HTTPS API
Python / FastAPI
AI doğrulama, strateji yönetimi ve motor API'si
        ↓
Backtest worker + Paper/data worker
        ↓
PostgreSQL + Redis + Parquet + S3 uyumlu obje deposu
```

### Next.js

- Kullanıcı kaydı ve oturum,
- AI sohbeti ve manuel oluşturucu,
- Strateji kartı,
- Backtest başlatma ve sonuç arayüzü,
- Paper başlatma/durdurma ve izleme,
- Bildirim ve durum ekranları.

Next.js içinde indikatör, portföy muhasebesi veya backtest hesabı bulunmaz.

### Python/FastAPI ve worker’lar

- AI çıktısını `Strategy JSON`’a dönüştürme ve doğrulama,
- İndikatör ve motor hesapları,
- Backtest yürütme,
- Komisyon, slippage ve sanal fill,
- Paper portföy muhasebesi ve canlı bar işleme,
- Strateji, motor ve veri sürüm kayıtları.

Hesaplama katmanı Polars/NumPy kullanır. PostgreSQL uygulama kayıtlarını; Redis iş kuyruğunu ve kilitleri; Parquet tarihsel fiyat verisini; S3 uyumlu obje deposu uzun süreli dosyaları taşır.

Backtest isteği bir iş kimliği döndürür; worker sonucu kalıcı depoya yazar. İlerleme SSE, gerektiğinde polling ile aktarılır. API ve worker süreçleri Docker ile ayrı çalıştırılır. Paper/data worker kısa ömürlü serverless fonksiyonda çalıştırılamaz. RQ ile Dramatiq arasındaki kesin seçim ve barındırma sağlayıcıları henüz kararlaştırılmamıştır.

## 14. MVP tamamlanma ölçütleri

MVP ancak şu akış uçtan uca test edilip güvenilir çalıştığında tamamlanmıştır:

- Kullanıcı hesap oluşturur ve oturum açar.
- AI, manuel oluşturucu veya şablonla aynı kapsamda strateji üretir.
- Desteklenmeyen/eksik kurallar görünür biçimde reddedilir veya netleştirilir.
- Strateji kartı düzenlenir ve açık onayla değişmez sürüm oluşur.
- Backtest maliyetler dâhil deterministik sonuç üretir.
- Geliştirme, görülmemiş test ve tüm dönem ayrılır; benchmark ve örneklem uyarıları görünürdür.
- Uygun strateji paper modunda başlar ve sayfa kapalıyken tamamlanmış barları işler.
- Kullanıcı sanal pozisyonu, işlemleri, bakiyeyi, performansı ve hataları izler.
- Strateji durdurulabilir, kopyalanabilir ve yeni sürüme ayrılabilir.
- Strateji, motor ve veri sürümleriyle sonuçlar yeniden üretilebilir.
- Temel eğitim içerikleri ve yönetim ekranı erişilebilir.
- Kritik ürün ve finansal kurallar otomatik testlerle korunur.
- Gerçek para kullanılmaz ve kâr garantisi verilmez.

## 15. Karar bekleyen konular

- Kalıcı veri sağlayıcısı ve Binance kullanım hakları.
- Sayısal AI kotaları.
- Hazır şablonların sayısı ve içeriği.
- Yönetim ekranının ayrıntılı işlemleri ve yetkileri.
- Eğitim içeriklerinin kesin biçimi ve yayın süreci.
- Kullanıcı kayıtlarının saklama ve silme politikası.
- Ülke bazlı hukuki metinler ve yayıma çıkış koşulları.

Bu kararlar verilene kadar uygulama veya AI kendi varsayımını kalıcı ürün kuralı yapamaz.

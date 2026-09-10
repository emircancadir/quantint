---
title: "quantint MVP backtest standardı"
document_id: QNT-ENGINE-BACKTEST
version: 0.1.0
status: draft
language: tr
source_of_truth: true
last_updated: 2026-09-11
---

# quantint MVP backtest standardı

[Ana belge](../quantint-beyin.md) · [English copy](../../en/engine/backtest.md)

## 1. Amaç

Bu belge backtest motorunun yürütme, maliyet, veri, doğrulama ve performans hesaplama kurallarını tanımlar. Motor deterministik olmalı; geleceğe bakmayı engellemeli, maliyetleri hesaba katmalı, iyimser fiyat varsayımlarından kaçınmalı, veri hatalarını göstermeli ve aynı girdilerle aynı sonucu üretmelidir.

## 2. Simülasyon birimi

Her backtest:

- Tek strateji sürümü, parite ve zaman dilimi kullanır.
- Bağımsız `10.000 USDT` sanal portföyle başlar.
- Yalnız long çalışır; short, kaldıraç ve borçlanma yoktur.
- Aynı anda en fazla bir açık pozisyon taşır.
- Kullanılmayan nakdi faizsiz USDT olarak tutar.

Aynı strateji birden fazla paritede topluca çalıştırılabilir; ancak her parite ayrı 10.000 USDT, muhasebe ve sonuç kullanır. Sermaye paylaşılmaz ve sonuçlar tek portföy gibi birleştirilmez. Ortak sermayeli çoklu-parite portföyü MVP dışındadır.

## 3. Mum ve olay zamanı

```text
t mumu tamamlanır
→ göstergeler yalnız t ve önceki verilerle hesaplanır
→ giriş veya çıkış sinyali oluşur
→ normal emir en erken t+1 mumunun açılışında gerçekleşir
```

Motor kapanmamış mum, mum içi geçici gösterge değeri veya gelecekteki değer kullanamaz. Sinyali aynı mumun kapanışında gerçekleştiremez.

`t+1` mumu yok veya eksikse işlem yapılmaz, başka/son bilinen fiyat kullanılmaz ve backtest veri hatası verir. Böyle bir sonuç başarılı veya doğrulanmış gösterilemez.

## 4. Pozisyon ve çakışma kuralları

- Pozisyon açıkken yeni giriş yapılmaz; pyramiding yoktur.
- Normal çıkış pozisyonun tamamını kapatır; kısmi çıkış yoktur.
- Negatif nakde hiçbir zaman izin verilmez.
- Giriş ve çıkış aynı tamamlanmış mumda oluşursa çıkış önceliklidir.
- Pozisyon açıksa tamamen kapanır ve aynı mumdan yeniden giriş olmaz.
- Pozisyon kapalıysa o mumda giriş yapılmaz.
- Yeni giriş en erken sonraki tamamlanmış mumda oluşan geçerli yeni sinyalden sonra mümkündür.

## 5. Komisyon ve slippage

| Maliyet | MVP kuralı |
|---|---:|
| Alış komisyonu | İşlem tutarının `%0,10`’u |
| Satış komisyonu | İşlem tutarının `%0,10`’u |
| Alış slippage | Açılış fiyatına `+%0,10` |
| Satış slippage | Açılış veya geçerli çıkış referans fiyatına `−%0,10` |

Normal işlemler:

```text
Alış fiyatı  = sonraki mum açılışı × 1,001
Satış fiyatı = sonraki mum açılışı × 0,999
Komisyon     = gerçekleşen işlem tutarı × 0,001
```

Komisyon her alış ve satışta ayrı uygulanır.

## 6. Pozisyon büyüklüğü ve nakit kontrolü

Pozisyon büyüklüğü, gerçekleşme anındaki toplam portföy değerinin kullanıcı tarafından seçilen yüzdesidir.

- Komisyon dâhil toplam maliyet nakdi aşarsa miktar aşağı çekilir.
- Miktar piyasanın lot adımına göre aşağı yuvarlanır.
- Artan tutar nakitte kalır.
- Minimum emir `max(10 USDT, veri kaynağındaki piyasa minimumu)` değeridir.
- Minimumu karşılamayan işlem gerçekleşmez.

Kullanıcının seçebileceği yüzdelik sınır ve adım henüz kararlaştırılmamıştır.

## 7. Stop-loss, take-profit ve çıkış önceliği

Sabit stop-loss ve take-profit gerçekleşen alış fiyatından hesaplanır. Aynı mumda ikisi de görülürse konservatif olarak stop-loss önce kabul edilir.

Mum stop seviyesinin altında gap ile açılırsa stop fiyatı değil daha kötü açılış fiyatı ham referanstır; satış slippage ve komisyon ayrıca uygulanır.

Birden fazla çıkış nedeni aynı anda oluşursa:

1. Stop-loss
2. Take-profit
3. Normal çıkış koşulu
4. Zaman bazlı çıkış

Risk sınırları [strateji dili belgesindedir](./strategy-language.md).

## 8. Test sonundaki açık pozisyon

Test sonunda açık pozisyon, son geçerli kapanış fiyatından satış slippage ve komisyon uygulanarak kapatılmış kabul edilir. Nihai net portföy bu zorunlu kapanıştan sonra hesaplanır. Brüt koşu kendi maliyetsiz kuralıyla aynı olayı içerir.

## 9. Tarih aralığı ve minimum test

Varsayılan dönem son tamamlanmış bardan geriye doğru üç yıldır. Kullanıcı başlangıç ve bitişi takvimden değiştirebilir. Tüm tarihler UTC’dir; bitiş gelecekte, kapanmamış mumda veya son doğrulanmış tamamlanmış bardan sonra olamaz.

| Zaman dilimi | Minimum dönem | Minimum tamamlanmış bar |
|---|---:|---:|
| 1 saat | 12 ay | 5.000 |
| 4 saat | 18 ay | 2.000 |
| Günlük | 3 yıl | 750 |

Doğrulanmış test için ilgili satırdaki iki koşul da sağlanır. Daha kısa test çalışabilir fakat `Araştırma amaçlı — yetersiz veri` olarak işaretlenir ve doğrulanmış strateji kabul edilmez.

## 10. Gösterge ısınma dönemi

```text
Isınma barı = max(200, en uzun gösterge periyodu × 3)
```

Örnek: en uzun gösterge EMA(100) ise `max(200, 100 × 3) = 300` bar gerekir.

Isınma barları yalnız göstergeleri hazırlar; performansa, işleme, benchmark’a veya `%70/%30` bölmesine katılmaz. Yeterli geçmiş yoksa tarih sessizce değiştirilmez veya veri doldurulmaz; hata gösterilir.

## 11. Veri bütünlüğü

- Tamamlanmış bar oranı en az `%99,9` olmalıdır.
- Tekrarlanan kayıt, bozuk OHLC ve forward-fill kabul edilmez.
- Varlık listeleme tarihinden önce işlem göremez.
- Bugünün varlık listesi geçmişe geriye dönük uygulanmaz.
- 4 saatlik ve günlük barlar yalnız tamamlanmış 1 saatlik barlardan üretilir.
- İki bardan uzun açıklanamayan boşluk testi reddeder.
- Bir veya iki barlık boşluk da gizlenemez veya yapay fiyatla doldurulamaz; gerçekleşme mumuna denk gelirse veri hatası verir.
- Her sonuç veri snapshot sürümüne bağlanır.

Ayrıntılı kurallar [veri politikasındadır](../data/data-policy.md).

## 12. Geleceğe bakma ve veri sızıntısı kontrolleri

1. `t` sinyali yalnız `t` ve geçmiş veriyi kullanır.
2. Normal işlem en erken `t+1` açılışında gerçekleşir.
3. Kapanmamış mum kullanılmaz.
4. Isınma performansa katılmaz.
5. Geliştirme ve test kronolojik ayrılır; veri karıştırılmaz.
6. Test dönemi strateji kilitlenmeden kullanıcıya veya AI’ya gösterilmez.
7. Parametreler test verisine göre otomatik seçilmez.
8. Güncel varlık listesi geçmişe geriye dönük uygulanmaz.
9. Listeleme öncesi işlem yoktur.
10. Eksik bar forward-fill ile gizlenmez.
11. Üst zaman dilimleri yalnız tamamlanmış 1 saatlik barlardan oluşur.
12. Her sonuç strateji, motor ve veri snapshot sürümüyle kaydedilir.

## 13. Geliştirme ve görülmemiş test ayrımı

```text
İlk %70 → geliştirme dönemi
Son %30 → görülmemiş test dönemi
```

Veri rastgele karıştırılmaz. Sonuçlar geliştirme, görülmemiş test ve tüm dönem olarak ayrı gösterilir. Kullanıcı önce geliştirme sonucunu görür; görülmemiş test sonucu strateji son kez onaylanıp kilitlenmeden kullanıcıya veya AI’ya açılmaz ve ana karar bölümü olarak öne çıkarılır.

Test görüldükten sonra parametre değiştirilirse eski test artık görülmemiş sayılmaz. Yeni sürüm `yeniden optimize edilmiş` olarak işaretlenir, denenen sürüm sayısı artırılır ve yeni backtest gerekir. Geliştirmede başarılı olup testte belirgin bozulan stratejiye `olası aşırı uyum` uyarısı verilir. Walk-forward MVP’de zorunlu değildir.

İlk strateji kartı onayı ile geliştirme sonrası son test kilidinin bir mi iki ayrı onay mı olduğu henüz kararlaştırılmamıştır.

## 14. Minimum işlem sayısı

Tamamlanmış işlem, pozisyonun açılmasıyla başlayıp tamamen kapanmasıyla biten round-trip’tir.

| Tamamlanmış işlem | Güvenilirlik etiketi |
|---:|---|
| 0–9 | Sonuç geçersiz |
| 10–29 | İstatistiksel olarak çok yetersiz |
| 30–99 | Ön değerlendirme |
| 100 ve üzeri | Daha anlamlı örneklem |

Minimum kabul seviyesi tüm değerlendirmede 30, görülmemiş testte ayrıca 10 tamamlanmış işlemdir. Eşik sağlanmasa da paper başlatılabilir; kullanıcı `yetersiz örneklem` uyarısını açıkça onaylamalıdır.

## 15. Buy-and-hold benchmark

Benchmark:

- Aynı parite, başlangıç sermayesi, başlangıç ve bitiş tarihlerini kullanır.
- İlk test barında sermayenin `%100`’üyle alır.
- Aynı komisyon ve slippage uygular.
- Dönem sonunda USDT’ye dönerek satış maliyetlerini uygular.

Net getiri, maksimum düşüş, volatilite ve Sharpe farkları gösterilir. Daha düşük getiri tek başına başarısızlık değildir; daha düşük risk veya düşüş görünür kalır.

İlk ve son bardaki kesin ham benchmark gerçekleşme fiyatı henüz kararlaştırılmamıştır.

## 16. Hesaplama temeli

- Başlangıç portföyü `10.000 USDT`’dir.
- Ana sonuç komisyon ve slippage sonrası net performanstır.
- Brüt sonuç yalnız maliyet etkisini açıklar.
- Test sonu açık pozisyon net maliyetlerle kapatılır.
- Hesaplama tam hassasiyetle yapılır; arayüz yüzdeleri ve oranları iki ondalık gösterir.
- Yıllıklaştırma `365 gün` kullanır.
- Risk metrikleri için her gün UTC `00:00` equity değerinden basit getiri oluşturulur.

```text
Günlük getiri[d] = Equity[d] / Equity[d-1] - 1
```

## 17. Getiri metrikleri

### Brüt toplam getiri

Aynı sinyal ve işlemlerin komisyon/slippage olmadan çalıştırılan karşılaştırmasıdır; ana performans olarak sunulamaz.

### Net toplam getiri

```text
(Son net portföy / Başlangıç portföyü) - 1
```

### Maliyet etkisi

```text
Brüt toplam getiri - Net toplam getiri
```

### CAGR

```text
(Son portföy / İlk portföy)^(365 / test günü) - 1
```

Bir yıldan kısa testte gösterilmez veya `Yetersiz dönem` etiketi alır.

### Buy-and-hold getirisi ve farkı

Benchmark’ın aynı maliyetlerle net getirisidir.

```text
Buy-and-hold farkı = Strateji net getirisi - Buy-and-hold net getirisi
```

## 18. Maksimum düşüş

Her bardaki net equity kullanılır.

```text
Tepe[t] = t anına kadarki en yüksek Equity
Drawdown[t] = Equity[t] / Tepe[t] - 1
Maximum Drawdown = en düşük Drawdown[t]
```

Tepe, dip ve toparlanma tarihleri gösterilir.

## 19. Yıllıklandırılmış volatilite

Günlük basit getirilerin örneklem standart sapması kullanılır.

```text
Volatilite = Std_örneklem(günlük getiriler) × √365
```

## 20. Sharpe

MVP yıllık risksiz getiri varsayımı `%0`’dır ve ekranda açıkça yazılır. Haricî faiz verisi çekilmez.

```text
Günlük risksiz getiri = (1 + yıllık risksiz getiri)^(1/365) - 1

Sharpe =
Ortalama(günlük getiri - günlük risksiz getiri)
÷ Std_örneklem(günlük getiri)
× √365
```

Standart sapma sıfırsa `N/A` gösterilir.

## 21. Sortino

Minimum kabul edilebilir getiri `%0`’dır.

```text
Downside deviation = √Ortalama(min(günlük getiri, 0)²)

Sortino = Ortalama günlük getiri ÷ Downside deviation × √365
```

Negatif getirili gün yoksa `N/A` gösterilir; sonsuz değer sunulmaz.

## 22. İşlem metrikleri

| Metrik | Hesaplama |
|---|---|
| Tamamlanmış işlem sayısı | Kapatılmış round-trip sayısı |
| Başarı oranı | Net kârlı işlemler / tüm kapanmış işlemler |
| Ortalama işlem getirisi | Net işlem getirilerinin aritmetik ortalaması |
| Ortalama işlem kârı | Net pozitif işlem getirilerinin ortalaması |
| Ortalama işlem zararı | Net negatif işlem getirilerinin ortalaması |
| Kâr faktörü | Toplam net kâr / mutlak toplam net zarar |
| Beklenen değer | Başarı oranı × ortalama kâr + kayıp oranı × ortalama zarar |
| Ortalama tutma süresi | Açık kalınan ortalama mum ve zaman |
| Maruz kalma süresi | Pozisyon açık bar / test edilebilir toplam bar |
| Turnover | Toplam alış-satış tutarı / ortalama portföy değeri |
| Toplam komisyon | Tüm sanal komisyonların USDT toplamı |
| Tahmini slippage maliyeti | Slippage’lı ve slippage’sız gerçekleşmelerin USDT farkı |

```text
Net işlem getirisi = Net işlem kârı / pozisyona girişte kullanılan sermaye
```

Komisyon ve slippage net işlem kârına dâhildir. Başabaş işlemler başarı veya kayıp sayılmaz ama tamamlanmış işlem sayısına dâhildir. Zarar eden işlem yoksa kâr faktörü `N/A — zarar eden işlem yok` gösterilir; sonsuz gösterilmez.

## 23. Sonuç ekranı

Üst bölümde yalnız:

1. Net toplam getiri
2. Buy-and-hold farkı
3. Maksimum düşüş
4. Sharpe
5. Tamamlanmış işlem sayısı
6. Maruz kalma süresi

bulunur. Diğer metrikler `Ayrıntılı performans` bölümündedir. Her metrik geliştirme, görülmemiş test ve tüm dönem için ayrı hesaplanır; ana değerlendirme test dönemidir. Brüt performans netten baskın gösterilemez.

## 24. Tekrar üretilebilirlik

Her sonuç en az strateji, motor, veri snapshot ve evren sürümü; parite, zaman dilimi, tarih aralığı, ısınma, komisyon, slippage, pozisyon büyüklüğü ve kullanılan piyasa işlem kurallarıyla ilişkilendirilir.

Aynı sürümler, tarih aralığı, maliyetler ve piyasa kuralları aynı sonucu üretmelidir. Motor veya veri değişirse eski sonuç sessizce yeniden hesaplanamaz; yeni sonuç oluşturulur.

## 25. Hata görünürlüğü

Eksik veri/ısınma, bozuk OHLC, tekrar bar, açıklanamayan boşluk, eksik gerçekleşme mumu, geçersiz lot veya minimum emir, geçersiz gösterge, `NaN`, kapanmamış mum kullanımı ve eksik sürüm bilgisi gizlenemez. Hatalı koşu başarılı veya doğrulanmış gösterilemez.

## 26. Karar bekleyen konular

1. İlk strateji onayı ile geliştirme sonrası test kilidinin bir mi iki onay mı olduğu.
2. `%70/%30` bölünmesinde artan barın hangi tarafa verileceği.
3. Her bardaki açık pozisyon equity değerleme fiyatı.
4. UTC `00:00` günlük equity örneğinin tam bar kapanışı mı son tamamlanmış değer mi olduğu.
5. Buy-and-hold ilk/son ham gerçekleşme fiyatları.
6. Bölüm benchmark’larının ayrı 10.000 USDT ile mi, kesintisiz seri olarak mı hesaplandığı.
7. Brüt koşunun netle aynı miktarı mı, maliyetsiz sermayeyle yeniden hesaplanan miktarı mı kullandığı.
8. Turnover’daki ortalama portföy değeri örnekleme sıklığı.
9. Test sonu zorunlu kapanışın tamamlanmış işlem sayısına girip girmediği.
10. Toparlanmamış maksimum düşüşün tarih gösterimi.
11. `Olası aşırı uyum` uyarısının sayısal eşikleri.
12. Sayısal veri türü ve ara yuvarlama politikası.
13. Take-profit üstü gap açılışının kesin gerçekleşme fiyatı.
14. Giriş mumunda stop/take görülmesinin kesin olay sırası.
15. Gap olmayan normal stop-loss veya take-profit temasında kullanılacak ham gerçekleşme fiyatı.
16. Strateji kartındaki komisyon ve slippage alanlarının kullanıcı tarafından değiştirilebilir değerler mi, yoksa sabit MVP standartları mı olduğu.

Bu ayrıntılar AI veya uygulama tarafından varsayımla doldurulamaz.

---
title: "quantint MVP paper trading şartnamesi"
document_id: QNT-ENGINE-PAPER
version: 0.1.0
status: draft
language: tr
source_of_truth: true
last_updated: 2026-09-11
---

# quantint MVP paper trading şartnamesi

[Ana belge](../quantint-beyin.md) · [English copy](../../en/engine/paper-trading.md)

## 1. Amaç

Paper trading, onaylanıp kilitlenmiş stratejinin bundan sonra gelen gerçek piyasa verileri üzerinde tamamen sanal sermayeyle çalıştırılmasıdır. Gerçek para kullanmaz, borsaya emir göndermez, yatırım kararı veya kâr garantisi sunmaz.

Backtest ile aynı deterministik `engine-core` kurallarını kullanır. Finansal hesaplama ve sanal gerçekleşme kurallarının tek ayrıntılı kaynağı [backtest şartnamesidir](./backtest.md); paper motoru kendi varsayımını ekleyemez.

MVP’de borsa hesabı entegrasyonu yoktur. Paper/data worker, Next.js sayfası açık olmasa bile 7/24 çalışabilecek ayrı bir süreçtir.

## 2. Başlatma kabul kapısı

Paper çalışma yalnız şu koşulların tamamında başlayabilir:

- Backtest başarıyla tamamlanmıştır.
- Kritik veri veya strateji hatası yoktur.
- Strateji kartı kullanıcı tarafından onaylanmış ve kilitlenmiştir.
- Komisyon, slippage, pozisyon oranı ve risk kuralları belirlenmiştir.
- Kullanıcı paper trading’in gerçek işlem olmadığını açıkça kabul etmiştir.
- Backtestte 30’dan az tamamlanmış işlem varsa `yetersiz örneklem` uyarısı ayrıca onaylanmıştır.

Başlatma ekranı parite, zaman dilimi, giriş/çıkış, stop/take, pozisyon, yeniden giriş, 10.000 USDT sanal sermaye, maliyetler, strateji sürümü ve örneklem uyarılarını özetler.

Çalışma yalnız kullanıcı **“Stratejiyi onayla ve paper trade’i başlat”** butonuna bastığında başlar. AI başlatamaz.

## 3. Sanal portföy

- Her çalışma bağımsız `10.000` sanal USDT ile ve pozisyonsuz başlar.
- Aynı anda en fazla bir açık pozisyon bulunur.
- Yalnız long vardır; short, kaldıraç, borçlanma ve negatif nakit yoktur.
- Paper pozisyon oranı `%25`, `%50` veya `%100` olabilir.
- Kullanılmayan sermaye faizsiz USDT’de kalır.
- Başlangıç bakiyesi sonradan değiştirilemez; farklı bakiye için yeni çalışma gerekir.
- Her strateji/parite ayrı portföydür; ortak sermayeli çoklu-parite portföyü MVP dışıdır.

Komisyon, slippage, minimum emir ve miktar yuvarlama [backtest](./backtest.md) ile aynıdır.

## 4. Canlı veri akışı

Sistem tamamlanmış 1 saatlik barları alır; 4 saatlik ve günlük barları tamamlanmış 1 saatlik barlardan UTC sınırlarına göre üretir.

1. Canlı veri alınır.
2. Bar kapanışı beklenir.
3. Kapanıştan sonra kısa doğrulama uygulanır.
4. Barın eksiksiz ve kesinleşmiş olduğu doğrulanır.
5. Göstergeler hesaplanır.
6. Strateji değerlendirilir.
7. Gerekirse sanal emir oluşur.

Açık bar kullanılamaz. Eksik veri tahmin, önceki fiyat veya forward-fill ile tamamlanamaz. Bar beklenen kapanıştan sonraki 5 dakika içinde doğrulanamazsa çalışma otomatik duraklatılır. Veri kuralları [veri politikasındadır](../data/data-policy.md).

## 5. Sinyal ve sanal emir

```text
Tamamlanmış ve doğrulanmış bar
→ gösterge
→ giriş/çıkış kontrolü
→ sanal emir
→ motor kuralına göre sanal fill
→ komisyon ve slippage
→ portföy ve işlem kaydı
```

- Normal sinyal tamamlanmış bar kapanışında hesaplanır ve en erken sonraki bar açılışında gerçekleşir.
- Giriş ve çıkış aynı mumdaysa çıkış önceliklidir.
- Pozisyon açıkken yeni giriş ve pyramiding yoktur.
- Aynı mumda çıkış ve yeniden giriş yoktur.
- Stop-loss ve take-profit tamamlanmış barın OHLC’siyle kontrol edilir; ikisi aynı barda görülürse stop önce kabul edilir.

## 6. Mükerrer işlem güvenliği ve denetim izi

Her karar en az strateji ve değişmez sürümü, parite, zaman dilimi, kullanılan barın UTC zamanı, veri sürümü/snapshot, motor sürümü ve benzersiz event ID ile kaydedilir. Sinyal, sanal emir, fill, maliyetler ve işlem sonrası portföy durumu izlenebilir olmalıdır.

Aynı bar veya event yeniden alınsa bile ikinci emir/işlem oluşamaz.

## 7. Kalıcı kayıt, kesinti ve yeniden başlatma

Durum her bar, sinyal, emir ve fill sonrasında kalıcı kaydedilir. Yeniden başlatmada:

1. Son başarılı bar bulunur.
2. Eksik aralık REST/backfill kaynağından alınır.
3. Bütünlük doğrulanır.
4. Barlar UTC sırasıyla yeniden oynatılır.
5. İşlenmiş event ID’ler atlanır.
6. Kesinti sırasında oluşması gereken sanal işlemler `yeniden oynatma sırasında işlendi` etiketi alır.
7. Veri eksiksiz doğrulanamazsa çalışma sürmez.

Tahmini fiyat, sessiz atlama, eksik barı başka fiyatla değiştirme veya sinyalleri kontrol etmeden güncel zamana sıçrama yasaktır.

## 8. Minimum ileri test

| Zaman dilimi | Minimum süre |
|---|---:|
| 1 saat | 30 gün |
| 4 saat | 60 gün |
| Günlük | 180 gün |

Ayrıca en az 10 tamamlanmış round-trip gerekir. Süre dolduğu hâlde 10 işlem yoksa çalışma başarısız sayılmaz; `yetersiz işlem` durumunda devam eder. Minimumdan sonra kullanıcı durdurana veya otomatik durdurma oluşana kadar çalışabilir.

## 9. Bildirimler

Uygulama içi, kullanıcı isterse e-posta bildirimi şu olaylarda gönderilir:

- Çalışma başladı.
- Giriş/çıkış sinyali oluştu.
- Sanal emir gerçekleşti.
- Stop-loss veya take-profit çalıştı.
- Veri kesintisiyle durakladı.
- Veri tamamlanıp yeniden başladı.
- Risk limitiyle durdu.
- Haftalık performans özeti hazırlandı.
- Minimum paper süresi tamamlandı.

Her bildirimde sinyal zamanı, kullanılan tamamlanmış bar, işlem fiyatı, komisyon, pozisyon ve yeni sanal bakiye bulunmalıdır. Önemli olay olmayan her bar için bildirim gönderilmez.

## 10. Otomatik duraklatma

Şu durumlarda otomatik duraklatılır:

- Bar 5 dakikadan fazla gecikir.
- Veri doğrulaması başarısız olur.
- Bağlantı kesilir ve backfill tamamlanamaz.
- Portföy ile işlem kayıtları uyuşmaz.
- Aynı event’in birden fazla işlendiği tespit edilir.

Duraklamada yeni giriş yoktur. Veri ve sistem durumu eksiksiz doğrulanmadan devam edilemez.

## 11. Otomatik durdurma

Şu durumlarda otomatik durdurulur:

- Sanal portföy başlangıçtaki 10.000 USDT’den `%25` düşer.
- Parite işlemden kaldırılır.
- Üç ardışık bar döneminde kritik motor hatası oluşur.
- Veri kaynağı 24 saatten uzun süre kullanılamaz.

Neden ve son doğrulanmış sistem durumu kullanıcıya gösterilir.

## 12. Kullanıcı duraklatması ve durdurması

**Duraklat:** Yeni giriş yapılmaz; açık pozisyon korunur ve stop-loss, take-profit ile normal çıkışları çalışmaya devam eder. Yeniden başlamadan aradaki tüm barlar doğrulanır.

**Durdur:** Açık pozisyon bir sonraki geçerli fiyatla sanal kapatılır, komisyon/slippage uygulanır ve çalışma sonlandırılır. Neden ve son portföy kaydedilir.

## 13. Strateji sürümleme

Aktif paper çalışmanın strateji sürümü değişmezdir. Düzenleme mevcut çalışmayı değiştirmez; yeni sürüm, yeniden doğrulama, kullanıcı onayı ve yeni paper çalışma gerektirir. Eski çalışma ve sonuçları silinmez veya yeni sürümle birleştirilmez. AI stratejiyi sessizce değiştiremez.

## 14. Backtest ile teknik tutarlılık

Paper döneminin kesinleşmiş verisi aynı kilitli strateji ve motorla yeniden çalıştırılır. Sinyallerin, emir sayısı/yön/sırasının, maliyet uygulamasının ve portföy muhasebesinin `%100` eşleşmesi beklenir.

Fark varsa etkilenen bar, veri, motor ve strateji sürümü; kesinti/yeniden başlatma, replay bilgisi ve neden gösterilir. Fark sessizce düzeltilmez veya geçmiş sonuç üzerine yazılmaz.

## 15. Performans karşılaştırması

İlk backtestin görülmemiş test bölümü ile paper döneminde net getiri, maksimum düşüş, volatilite, Sharpe, işlem sıklığı, başarı oranı, ortalama işlem getirisi, maruz kalma, komisyon ve slippage karşılaştırılır.

Paper’ın daha düşük olması otomatik başarısızlık değildir. Amaç yeni veride davranışı, iki motor yolunun aynı kuralları kullandığını, kesintileri ve tekrar üretilebilirliği değerlendirmektir.

## 16. Görünür hata ilkesi

Veri, motor, portföy ve kayıt hataları gizlenemez. Kritik hata açık mesaj, etkilenen zaman aralığı, duraklatma/durdurma durumu ve replay/kurtarma kaydı taşır. Eksik veri, tahmini fiyat, sessiz atlama ve sessiz kural değişikliği kabul edilmez.

## 17. MVP dışında

- Gerçek para, borsa bağlantısı veya gerçek emir,
- Short, kaldıraç ve borçlanma,
- Ortak sermayeli çoklu-parite,
- Dakikalık, saniyelik, scalping veya yüksek frekanslı işlem,
- Trailing stop,
- AI tarafından otomatik başlatılan veya değiştirilen paper çalışma.

## 18. Karar bekleyen konular

1. “Kısa doğrulama süresi”nin 5 dakikalık üst sınır içindeki kesin uzunluğu.
2. Kullanıcı `Durdur` komutundaki “bir sonraki geçerli fiyat”ın kesin fill tanımı.
3. Otomatik durdurmada açık pozisyonun kapatılma veya dondurulma davranışı.
4. Paper’daki `%25/%50/%100` seçenekleri ile backtestteki serbest kullanıcı yüzdesinin nasıl uyumlandırılacağı.
5. Uygulama içi/e-posta bildirim sağlayıcısı.
6. Haftalık özetin günü, saati ve zaman dilimi.
7. Ana/yedek veri kaynağı ve paper barındırma sağlayıcısı.
8. İşlem veya sinyal içermeyen durum bildirimlerinde zorunlu işlem alanlarının nasıl gösterileceği.
9. Toplam işlem sayısı 30 veya üzerindeyken görülmemiş test bölümünde 10’dan az işlem varsa paper başlatma uyarısının nasıl uygulanacağı.
10. Yeni bir paper çalışma oluşturulurken başlangıç sermayesinin değiştirilebilir olup olmadığı ve değiştirilebilirse izin verilen sınırlar; kesinleşene kadar standart değer 10.000 sanal USDT’dir.

Bu ayrıntılar AI veya uygulama tarafından varsayımla doldurulamaz.

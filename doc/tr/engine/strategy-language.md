---
title: "quantint MVP strateji dili"
document_id: QNT-ENGINE-STRATEGY
version: 0.1.0
status: draft
language: tr
source_of_truth: true
last_updated: 2026-09-11
---

# quantint MVP strateji dili

[Ana belge](../quantint-beyin.md) · [English copy](../../en/engine/strategy-language.md)

## 1. Amaç

Bu belge, MVP’de oluşturulabilen stratejilerin sınırlarını ve motor tarafından nasıl yorumlanacağını tanımlar. Dil kontrollü, sınırlı ve deterministiktir; keyfî kod çalıştırmaz. AI ile görsel oluşturucu aynı dili kullanır ve yalnız burada açıkça desteklenen kuralları kabul eder.

Desteklenmeyen talep benzer görünen bir kurala sessizce çevrilemez.

## 2. Temel strateji modeli

Her strateji:

1. Tek parite ve tek zaman dilimine bağlıdır.
2. Bir giriş koşulu grubu içerir.
3. Bir normal çıkış koşulu grubu içerir.
4. İsteğe bağlı bir sabit stop-loss içerir.
5. İsteğe bağlı bir sabit take-profit içerir.
6. İsteğe bağlı bir zaman bazlı çıkış içerir.
7. Bir pozisyon büyüklüğü içerir.
8. Bir yeniden giriş kuralı içerir.
9. Yalnız long pozisyon açabilir.

Aynı strateji kartı birden fazla pariteyi veya ortak sermayeli portföyü temsil edemez. Başka pariteye kopyalanan strateji ayrı sürüm ve ayrı simülasyondur. Pariteler [veri politikasında](../data/data-policy.md) tanımlanır.

## 3. Zaman dilimleri ve sinyal zamanı

| Zaman dilimi | Tanım |
|---|---|
| `1h` | Tamamlanmış 1 saatlik mumlar |
| `4h` | Tamamlanmış 4 saatlik mumlar |
| `1d` | Tamamlanmış günlük mumlar |

Dakikalık, saniyelik, scalping ve haftalık stratejiler MVP dışındadır.

Strateji koşulları yalnız tamamlanmış mumlarda hesaplanır. `t` mumundaki normal sinyal yalnız `t` ve önceki tamamlanmış mumları kullanabilir ve en erken `t+1` mumunun açılışında işleme dönüşebilir. Açık mum veya mum içindeki geçici gösterge değeri kullanılamaz. Stop-loss ve take-profit’in OHLC ile değerlendirilmesi bu normal akışın tanımlı istisnasıdır.

## 4. Desteklenen göstergeler

| Gösterge | Parametre sınırı | İzin verilen kullanım |
|---|---:|---|
| Kapanış fiyatı | — | Sabit fiyat, SMA veya EMA ile karşılaştırma |
| SMA | 2–200 periyot | Kapanış/SMA veya iki SMA karşılaştırması |
| EMA | 2–200 periyot | Kapanış/EMA veya iki EMA karşılaştırması |
| RSI | 2–100 periyot | 1–99 arasındaki sabit eşikle karşılaştırma |
| MACD | Fast: 2–50, Slow: 3–200, Signal: 2–50 | MACD–signal kesişimi veya sıfır çizgisi karşılaştırması |

MACD için `fast < slow` zorunludur. Yeterli geçmiş oluşmadan gösterge değer veya sinyal üretemez. Isınma kuralı [backtest belgesindedir](./backtest.md).

MVP’de Bollinger Bands, ATR, ADX, Stochastic, Ichimoku, hacim göstergeleri, özel kullanıcı formülleri ve burada açıkça listelenmeyen göstergeler desteklenmez. SMA ile EMA’nın doğrudan karşılaştırılması da bu sürümde açıkça tanımlanmadığından desteklenmiş sayılmaz.

## 5. Durum karşılaştırmaları

| Anlam | Gösterim |
|---|---|
| Üzerinde | `A > B` |
| Altında | `A < B` |
| Büyük veya eşit | `A >= B` |
| Küçük veya eşit | `A <= B` |

Durum koşulu ilgili tamamlanmış mumda doğru veya yanlıştır. İzin verilen örnekler:

- Kapanış fiyatı EMA(50)’nin üzerinde.
- EMA(20), EMA(50)’nin üzerinde.
- RSI(14), 30’un altında.
- MACD çizgisi sıfırın üzerinde.
- Kapanış fiyatı 60.000 USDT’nin üzerinde.

## 6. Kesişim olayları

Yukarı kesişim:

```text
A[t] > B[t] ve A[t-1] <= B[t-1]
```

Aşağı kesişim:

```text
A[t] < B[t] ve A[t-1] >= B[t-1]
```

`t` ve `t-1` art arda iki tamamlanmış mumdur. “Kesişti” mum içi teması değil, iki tamamlanmış mum arasındaki durum değişimini ifade eder ve tek olay üretir.

İzin verilen örnekler:

- EMA(20), EMA(50)’yi yukarı kesiyor.
- RSI(14), 30 seviyesinin altına düşüyor.
- MACD çizgisi signal çizgisini yukarı kesiyor.
- Kapanış fiyatı EMA(50)’yi aşağı kesiyor.

## 7. Giriş ve çıkış koşulu grupları

Giriş ve normal çıkış gruplarının her birinde en fazla üç koşul olabilir. Bir grup yalnız tek bağlaç kullanır:

```text
A VE B VE C
```

veya:

```text
A VEYA B VEYA C
```

`(A VE B) VEYA (C VE D)` veya `A VE (B VEYA C)` gibi iç içe mantık desteklenmez. AI kullanıcıdan stratejiyi sadeleştirmesini ister; mantığı sessizce değiştiremez.

## 8. Pozisyon davranışı

- Yalnız long çalışır; short ve kaldıraç yoktur.
- Aynı anda en fazla bir açık pozisyon taşır.
- Pozisyon açıkken yeni giriş ve pyramiding yoktur.
- Normal çıkış pozisyonun tamamını kapatır; kısmi çıkış yoktur.
- Kullanılmayan sermaye USDT’de kalır.
- Pozisyon büyüklüğünü kullanıcı belirler; hesaplama ve nakit kontrolü [backtest belgesindedir](./backtest.md).

## 9. Sabit stop-loss

Stratejide en fazla bir sabit stop-loss olabilir.

- Gerçekleşen alış fiyatından hesaplanır.
- Giriş fiyatının `%0,5`–`%30` altında olabilir.
- Pozisyonun tamamını kapatır.
- Satış komisyonu ve slippage uygulanır.

Mum stop seviyesinin altında açılırsa stop fiyatı değil daha kötü açılış fiyatı referans alınır; komisyon ve slippage ayrıca uygulanır.

## 10. Sabit take-profit

Stratejide en fazla bir sabit take-profit olabilir.

- Gerçekleşen alış fiyatından hesaplanır.
- Giriş fiyatının `%0,5`–`%100` üzerinde olabilir.
- Pozisyonun tamamını kapatır.
- Satış komisyonu ve slippage uygulanır.

Aynı mumda hem stop-loss hem take-profit görülürse mum içi sıra bilinemez; konservatif olarak stop-loss önce kabul edilir.

## 11. Trailing stop

Trailing stop MVP’de desteklenmez. En yüksek fiyatı izleme, mum içi sıra ve gap davranışı tanımlanmadan eklenemez.

## 12. Zaman bazlı çıkış

Bir strateji isteğe bağlı tek zaman çıkışı içerebilir. Tutma süresi `1–500` tamamlanmış mumdur. Süre tamamlanınca pozisyon sonraki mum açılışında kapanır.

“10 mum tut” kuralında pozisyon 10 tam mum açık kalır ve 11. mumun açılışında kapanır.

## 13. Yeniden giriş

Kullanıcı şunlardan birini seçer:

1. Yeniden giriş yapma.
2. Yeni sinyal oluştuğunda yeniden gir.
3. Yeni sinyal ve belirli bekleme süresinden sonra yeniden gir.

Bekleme `0–100` mum, varsayılan `1` mumdur.

- Aynı mumda çıkış ve yeniden giriş yoktur.
- Giriş koşulunun sürekli doğru kalması yeni sinyal değildir.
- Koşul önce geçersizleşmeli, sonra yeniden oluşmalıdır.
- Yeni giriş yeni bir tamamlanmış mum sinyaline dayanmalıdır.

## 14. Çakışma önceliği

Birden fazla çıkış nedeni aynı anda oluşursa:

1. Stop-loss
2. Take-profit
3. Normal çıkış koşulu
4. Zaman bazlı çıkış

Giriş ve çıkış koşulları aynı tamamlanmış mumda oluşursa çıkış önceliklidir. Pozisyon açıksa tamamen kapanır ve aynı mumdan yeniden giriş yapılmaz. Pozisyon kapalıysa o mumda yeni pozisyon açılmaz. Yeni giriş en erken sonraki tamamlanmış mumda oluşan geçerli yeni sinyalden sonra mümkündür.

## 15. Desteklenmeyen talepler

- Yüzdesel fiyat değişimi kuralları,
- Mum formasyonları,
- “Hızlı yükselirse” gibi ölçüsüz ifadeler,
- İç içe `VE`/`VEYA` mantığı veya grup başına üçten fazla koşul,
- Dakikalık/saniyelik strateji, scalping,
- Short, kaldıraç, pyramiding ve trailing stop,
- Hacim göstergeleri veya özel formüller,
- Keyfî Python, JavaScript, SQL veya başka çalıştırılabilir kod,
- Haricî bağlantı çağrısı,
- Tek stratejide birden fazla parite veya ortak sermaye,
- Canlı emir talimatı.

Sistem talebi `unsupported` olarak işaretler veya sadeleştirme ister; yaklaşık kurala çevirmez.

## 16. AI, manuel oluşturucu ve doğrulama

AI ve manuel stratejiler aynı `Strategy JSON`, doğrulayıcı, motor, sürümleme ve onay kurallarına tabidir. AI yalnız `needs_clarification`, `strategy_draft` veya `unsupported` üretebilir.

Taslak çalışmadan önce:

1. **Şema:** Zorunlu alanlar, türler ve izinli değerler kontrol edilir; bilinmeyen alanlar reddedilir.
2. **Kapsam:** Parite, zaman dilimi, gösterge, operatör ve risk kuralları denetlenir.
3. **Parametre:** Tüm sayısal sınırlar denetlenir.
4. **Mantık:** Çelişkili, imkânsız, sürekli doğru veya aynı giriş/çıkış yapıları reddedilir.
5. **Zaman güvenliği:** Geleceğe bakma ve açık mum kullanımı engellenir.
6. **Güvenlik:** Keyfî kod, SQL, dış bağlantı, short, kaldıraç ve canlı emir reddedilir.
7. **Motor ön kontrolü:** Küçük veri setinde `NaN`, yetersiz ısınma, eksik veri ve hesaplama hatası aranır.
8. **İnsan onayı:** Kurallar, maliyetler ve riskler strateji kartında gösterilir.

Açık kullanıcı onayı olmadan strateji çalıştırılamaz veya kilitli sürüme dönüşemez.

## 17. Sürümleme ve değişmezlik

Onaylanan strateji değişmez sürüm olarak saklanır; yürütme sırasında AI veya sistem tarafından değiştirilemez. Her sonraki düzenleme yeni sürüm ve yeni kullanıcı onayı gerektirir.

Her backtest ve paper sonucu strateji, motor ve veri snapshot sürümleriyle ilişkilendirilir. Aynı üç sürüm aynı sonucu üretmelidir.

## 18. Karar bekleyen konular

1. `Strategy JSON` kesin alanları ve tam JSON Schema.
2. SMA, EMA, RSI ve MACD’nin kesin başlangıç ve hesaplama yöntemleri; EMA seed ve RSI varyantı.
3. Gösterge hesaplarında sayısal veri türü ve ara yuvarlama.
4. Kullanıcı pozisyon büyüklüğünün alt/üst sınırı ve adımı.
5. Take-profit üstünde gap açılışındaki kesin gerçekleşme fiyatı.
6. Pozisyonun açıldığı mum içinde stop veya take görülürse olay sırası.
7. Çıkış mumunun yeniden giriş bekleme süresine sayılıp sayılmayacağı.
8. İlk strateji kartı onayı ile geliştirme/test son kilidinin tek mi iki ayrı onay mı olduğu.

Bu konular AI tarafından varsayımla tamamlanamaz.

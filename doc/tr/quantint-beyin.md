---
title: "quantint beyin"
document_id: QNT-BRAIN
version: 0.1.0
status: draft
language: tr
source_of_truth: true
last_updated: 2026-09-11
---

# quantint beyin

> İnsanlar ve yapay zekâlar için projenin ana giriş noktası ve yaşayan ürün/çalışma şartnamesi.

[English copy](../en/quantint-beyin.md)

## Bu belgenin amacı

`quantint-beyin.md`, ekip üyelerinin ve Claude, ChatGPT veya başka yapay zekâ modellerinin projeyi aynı bağlamla anlamasını sağlar. Güncel proje özetini, değiştirilemez sınırları, belge haritasını ve şartnamenin nasıl güncelleneceğini tanımlar. Ayrıntılı kurallar bağlantılı belgelerde yalnızca bir kez tutulur.

Bu belge bir kurulum talimatı değildir. Tek başına herhangi bir komutun, backtestin, paper işlemin veya canlı işlemin çalıştırılması için yetki vermez.

## quantint nedir?

quantint; kod yazamayan fakat temel yatırım kavramlarını ve RSI, hareketli ortalama veya al-sat sinyali gibi göstergeleri bilen bireysel yatırımcıların algoritmik strateji oluşturmasını sağlayan bir finansal teknoloji ürünüdür.

Kullanıcı stratejisini:

- Yapay zekâyla gündelik dilde konuşarak,
- Hazır bir şablondan başlayarak,
- Yapay zekâ kullanmadan görsel strateji oluşturucu üzerinden

hazırlayabilir.

Temel ürün akışı:

> Fikrini anlat veya görsel olarak oluştur → kuralları netleştir → stratejiyi onayla → geçmişte test et → sanal ortamda çalıştır → sonuçları takip et

İlk MVP yalnızca bir arayüz demosu değildir. Bu akışın baştan sona güvenilir, test edilmiş, tekrar üretilebilir ve gerçek kullanıcılara açılabilecek biçimde çalışması gerekir.

## Değiştirilemez MVP sınırları

Aşağıdaki kurallar açık insan onayı olmadan değiştirilemez:

- Gerçek para ile işlem yapılmaz.
- Kullanıcının borsa hesabına bağlanılmaz ve gerçek emir gönderilmez.
- Paper trading, gerçek piyasa verileri üzerinde sanal bakiye ve sanal işlemlerle yürütülür.
- Öncelik kripto ve USDT pariteleridir.
- Yalnızca long ve USDT nakde dönüş desteklenir; short ve kaldıraç yoktur.
- Her strateji tek pariteye bağlıdır ve bağımsız sanal portföyle çalışır.
- AI yatırım kararı veren motor değildir; doğal dili sınırlı ve çalıştırılabilir strateji kurallarına dönüştüren yardımcıdır.
- AI olmadan kullanılan görsel strateji oluşturucu eksiksiz çalışmalıdır.
- AI doğrudan backtest, paper işlem veya ileride canlı işlem başlatamaz.
- Kullanıcının açık onayı olmadan strateji sürümü kilitlenemez veya çalıştırılamaz.
- quantint hiçbir stratejinin kâr edeceğini garanti etmez.
- Geçmiş test veya paper sonuçları gelecekteki performansın garantisi olarak sunulamaz.
- Finansal hesaplamaları deterministik motor yapar; AI bu hesaplamaları belirleyemez veya sessizce değiştiremez.

## Mevcut proje durumu

- Çalışan bir Next.js web uygulaması, kullanıcı/oturum altyapısı, içerik alanları ve yönetim özellikleri vardır.
- Mevcut web fiyat bandı yalnızca gösterim amaçlıdır; tarihsel veri, backtest veya paper motoru değildir.
- Backtest ve paper-trading motoru henüz geliştirilmemiştir.
- Mevcut Next.js uygulaması yeniden yazılmadan korunacaktır.
- Motor ayrı bir Python/FastAPI servisi olarak bağlanacaktır.
- Backtest ve paper trading aynı `engine-core` paketini kullanacaktır.
- Tarayıcı piyasa verisi sağlayıcılarına veya AI API’sine doğrudan bağlanmayacaktır.
- Uzun işler web isteği içinde bekletilmeyecek; API ve worker süreçleriyle yürütülecektir.
- Hedef yapı PostgreSQL, Redis, Parquet ve S3 uyumlu obje deposundan yararlanır.
- MVP’de aynı Python kod tabanından API, backtest worker ve paper/data worker süreçleri çalıştırılacaktır; gereksiz mikroservisleşme yapılmayacaktır.

Bu maddeler mevcut yönelimi tanımlar; henüz seçilmeyen ürün veya servis sağlayıcılar kesin karar değildir.

## Belge haritası

- [MVP kapsamı](product/mvp-scope.md): Ürün amacı, kullanıcı akışı, AI ve manuel oluşturma, ekranlar, teknik sınırlar ve tamamlanma ölçütleri.
- [Strateji dili](engine/strategy-language.md): Desteklenen göstergeler, operatörler, koşullar, risk kuralları ve doğrulama sınırları.
- [Backtest](engine/backtest.md): Yürütme kuralları, maliyetler, veri bölme yöntemi, metrikler ve tekrar üretilebilirlik.
- [Paper trading](engine/paper-trading.md): Sanal portföy, canlı veri işleme, duraklatma, yeniden başlatma ve hata davranışları.
- [Veri politikası](data/data-policy.md): Sağlayıcı kabul şartları, kalite ölçütleri, parite evreni ve snapshot kuralları.
- [Karar kayıtları](decisions/README.md): Kritik kararların gerekçesi ve onay geçmişi.
- [Deney kayıtları](experiments/README.md): Deney planları, kanıtlar ve ham sonuçların konumu.
- [Değişiklik geçmişi](changelog.md): Belgelerdeki anlamlı değişikliklerin kronolojik kaydı.

## Dil ve kaynak gerçek kuralı

- `doc/tr/` altındaki Türkçe belgeler tek kaynak gerçektir.
- `doc/en/` altındaki belgeler Türkçe kaynakların anlamı korunmuş İngilizce kopyalarıdır.
- İngilizce belgeler Türkçe kaynakta bulunmayan gereksinim, karar veya yorum ekleyemez.
- Onaylanmış değişiklik aynı işlem içinde Türkçe ve İngilizce belgelere ve iki değişiklik günlüğüne işlenir.
- İki dilde aynı değişiklik kimliği, tarih, durum ve karar anlamı kullanılır.
- Sürümler çelişirse Türkçe geçerlidir ve fark görünür biçimde raporlanır.
- İki dil eşitlenmeden değişiklik tamamlanmış sayılmaz.
- Standart Markdown ve göreli bağlantılar kullanılır; Obsidian, GitHub veya belirli bir AI ürününe zorunlu bağımlılık oluşturulmaz.

## Yaşayan şartname ve kontrollü güncelleme

Bu belge sistemi güçlü bir proje hafızasıdır. AI, kanıta dayalı düşük riskli bilgileri kaydedebilir; ürün kapsamını veya finansal kuralları sessizce değiştiremez.

### AI tarafından doğrudan kaydedilebilen bilgiler

Mevcut kararların anlamını değiştirmiyorsa:

- Yazım, biçim ve bozuk bağlantı düzeltmeleri,
- Doğrulanmış tarih, kaynak, bağlantı ve sürüm bilgileri,
- Ekip tarafından açıkça verilen ve mevcut kurallarla çelişmeyen olgular,
- Deneylerin ham sonuçları ve çalıştırma metadatası,
- Karar veya doğrulama statüsü vermeyen gözlemler,
- Onaylanmış değişikliğin changelog ve İngilizce çeviri eşitlemesi

doğrudan kaydedilebilir. Kaynak, tarih ve değişiklik nedeni korunmalıdır.

### Açık insan onayı gerektiren değişiklikler

AI aşağıdaki konularda yalnızca öneri hazırlayabilir:

- MVP veya ürün kapsamını genişletme ya da daraltma,
- Finansal hesaplama ve emir gerçekleştirme kuralları,
- Komisyon, slippage, sermaye, pozisyon ve risk kuralları,
- Desteklenen piyasa, parite, zaman dilimi, gösterge veya strateji dili,
- Veri sağlayıcısı ve veri kabul politikası,
- Anlamlı mimari değişiklikler,
- Güvenlik, gizlilik, hukuk veya mevzuat kuralları,
- Yol haritası ve canlı işlem kapsamı,
- Eski bilginin silinmesi,
- Bir deneyin `validated`, bir özelliğin yayıma hazır veya bir stratejinin güvenilir ilan edilmesi.

Açık talimat yalnızca adı verilen değişiklik için onaydır; kapsam genişletilemez.

### Durumlar

Bilgi, deney ve kararlarda şu durumlar kullanılır:

`idea`, `proposed`, `accepted`, `experimenting`, `validated`, `rejected`, `superseded`, `archived`

AI ham sonucu kaydedebilir; insan onayı olmadan `validated` durumuna geçiremez.

### Kritik değişiklik akışı

1. Güncel kaynak belge ve bağlantılı kararlar okunur.
2. Yeni bilgi ile mevcut kurallar arasındaki çelişkiler belirlenir.
3. Eski ve önerilen yeni metin açıkça gösterilir.
4. Ürün, motor, veri, güvenlik ve kullanıcı deneyimi etkileri belirtilir.
5. Değişiklik kimliği, tarih, gerekçe, kaynak ve etkilenen belgeler hazırlanır.
6. Açık insan onayı beklenir.
7. Onaydan sonra Türkçe kaynak, İngilizce kopya ve changelog birlikte güncellenir.
8. Eski karar silinmez; gerekiyorsa `superseded` veya `archived` olarak korunur.

### Çelişki ve belirsizlik davranışı

- AI emin değilse düzenlemek yerine önerir.
- Belge, kod, test, deney veya konuşma çelişiyorsa farkı gizlemez.
- Çelişki kendi seçtiği yorumla çözülmez.
- Eksik bilgi varsayımla tamamlanmaz; `Karar bekliyor` olarak işaretlenir.
- Aynı ayrıntılı kural birden fazla belgede kopyalanmaz; tek kaynak belgeye bağlantı verilir.
- Dosya erişimi olmayan AI, düzenleme yaptığını söylemez; uygulanabilir yama veya öneri verir.
- Dosya erişimi olan AI onaylı kapsamda düzenleyebilir; açık istek olmadan commit, push veya merge yapamaz.

## Ekip

- Emircan — ana odak: motor geliştirme.
- Alp — ana odak: motor geliştirme.
- Berke — ana odak: frontend ve backend geliştirme.

Bu odaklar katı görev sınırları değildir. Sorumluluklar ihtiyaçlara göre genişleyebilir ve ekibe yeni kişiler katılabilir.

## Karar bekleyen konular

- Kalıcı piyasa veri sağlayıcısı ve Binance’in ticari kullanım haklarının doğrulanması.
- Redis iş kuyruğunda RQ veya Dramatiq seçimi.
- S3 uyumlu obje deposu ve dağıtım sağlayıcıları.
- Sayısal AI kullanım kotaları.
- Yönetim ekranının ayrıntılı yetki ve işlemleri.
- Obsidian’a geçildiğinde ortak çalışma ve eşitleme yöntemi.
- Ülke bazlı hukuki metinler ve yayıma çıkış koşulları.

Bu başlıklar sonuçlandırılana kadar hiçbir insan veya AI kendi seçimini proje kararı gibi belgeleyemez.

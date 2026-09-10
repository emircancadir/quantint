---
title: "quantint belge değişiklik geçmişi"
document_id: QNT-CHANGELOG
version: 0.1.0
status: draft
language: tr
source_of_truth: true
last_updated: 2026-09-11
---

# Değişiklik geçmişi

[Ana belge](quantint-beyin.md) · [English copy](../en/changelog.md)

## 2026-09-11 — v0.1.0 taslak

**Değişiklik kimliği:** `QNT-CHANGE-0001`

**Kaynak:** Ekip ile yürütülen ürün gereksinimi görüşmesi

**Durum:** İnceleme bekleyen ilk taslak

Oluşturulan içerik:

- Türkçe kaynak gerçek ve eşzamanlı İngilizce kopya yapısı,
- Ana yaşayan şartname ve kontrollü AI güncelleme protokolü,
- Ürün amacı, hedef kullanıcı, kapsam, kullanıcı akışı ve tamamlanma ölçütleri,
- Next.js ile ayrı Python/FastAPI motorunun sorumluluk sınırları,
- AI destekli ve AI’sız görsel strateji oluşturma akışı,
- Kontrollü MVP strateji dili,
- Deterministik backtest, maliyet, doğrulama ve performans ölçümü kuralları,
- Paper trading, kesinti, replay, duraklatma ve bildirim kuralları,
- Veri sağlayıcısı kabul ölçütleri ve sabit `UNIVERSE_V1`,
- Karar ve deney kayıtlarının basit kullanım protokolleri.

Bu sürüm ürün kodu, motor, kurulum, dağıtım, commit veya push içermez. Belgelerdeki `Karar bekliyor` başlıkları onay verilmiş uygulama davranışı değildir.

Görünür bırakılan başlıca çelişkiler:

- Sağlayıcı kabulündeki eski 8 parite koşulu ile 15 paritelik `UNIVERSE_V1` kapsamı,
- Backtestte kullanıcı tarafından belirlenen pozisyon yüzdesi ile paper tradingdeki `%25/%50/%100` seçenekleri,
- Strateji kartındaki değiştirilebilir maliyet alanları ile backtestteki sabit komisyon/slippage standardı,
- Toplam 30 işlem ile görülmemiş testte 10 işlem eşiklerinin paper başlatma kapısında birlikte nasıl uygulanacağı.

İlk taslağın `accepted` durumuna geçmesi ekip incelemesi ve açık insan onayı gerektirir.

---
title: "quantint karar kayıtları"
document_id: QNT-DECISIONS
version: 0.1.0
status: draft
language: tr
source_of_truth: true
last_updated: 2026-09-11
---

# Karar kayıtları

Bu klasör, ürünün yönünü veya davranışını anlamlı biçimde değiştiren onaylanmış kararların kısa ve izlenebilir kayıtları içindir. Ayrıntılı güncel kurallar ilgili şartname belgesinde yalnız bir kez tutulur; karar kaydı ise değişikliğin nedenini ve kim tarafından onaylandığını açıklar.

## Basit kayıt biçimi

Her yeni karar ayrı bir Markdown dosyasında şu alanlarla kaydedilir:

- Karar kimliği ve başlığı
- Tarih
- Durum: `önerildi`, `kabul edildi`, `reddedildi` veya `yerine yenisi geçti`
- Bağlam ve çözülmek istenen sorun
- Alınan karar
- Gerekçe ve varsa kanıt bağlantıları
- Etkilenen şartname ve kod alanları
- Açık insan onayı
- Önceki bir kararın yerini alıyorsa eski karar bağlantısı

AI bir karar önerisi hazırlayabilir; ancak ürün kapsamını, finansal hesaplamaları, veri politikasını, mimariyi, güvenlik veya hukuki durumu etkileyen kaydı kendi başına `kabul edildi` durumuna getiremez. Eski kayıtlar sessizce silinmez; yeni karara bağlanarak korunur.

Henüz ayrı bir karar kaydı oluşturulmamıştır. v0.1 temel kararları mevcut şartname belgelerinde ve [değişiklik günlüğünde](../changelog.md) kayıtlıdır.

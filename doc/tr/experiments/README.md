---
title: "quantint deney kayıtları"
document_id: QNT-EXPERIMENTS
version: 0.1.0
status: draft
language: tr
source_of_truth: true
last_updated: 2026-09-11
---

# Deney kayıtları

Bu klasör; veri kaynağı incelemeleri, motor doğrulama çalışmaları, strateji deneyleri, performans testleri ve kullanıcı araştırmalarından elde edilen kanıtları saklar.

## Basit kayıt biçimi

Her deney ayrı bir Markdown dosyasında en az şu bilgileri taşır:

- Deney kimliği, adı ve tarihi
- Amaç veya hipotez
- Kullanılan strateji, motor ve veri sürümü
- Yöntem ve değiştirilmeyen koşullar
- Ham sonuçların konumu
- Özet sonuç, sınırlamalar ve gözlenen hatalar
- Durum: `planlandı`, `çalışıyor`, `tamamlandı`, `geçersiz` veya `arşivlendi`
- Bir karar öneriliyorsa ilgili karar kaydı bağlantısı

Kanıta dayalı deney sonucu AI tarafından doğrudan kaydedilebilir. Ham sonuçlar sonradan değiştirilmez. AI tek başına bir deneyi `doğrulandı`, bir stratejiyi `kârlı olacak` veya bir özelliği `canlı kullanıma hazır` ilan edemez; bu tür sonuçlar açık ekip onayı gerektirir.

Henüz deney kaydı bulunmamaktadır.

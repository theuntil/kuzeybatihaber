/* ══════════════════════════════════════════════════════════════
   DEPREM RENGİ

   ┌─ AYRI DOSYADA OLMAK ZORUNDA ⚠️ ────────────────────────────┐
   │ Bu işlev `DepremHarita.tsx` içindeydi ve o dosya           │
   │ `"use client"` ile başlıyor. Sunucu bileşeni oradan bir    │
   │ işlev almaya çalışınca Next.js şunu fırlatıyordu:          │
   │                                                              │
   │   Attempted to call renk() from the server but renk is on  │
   │   the client.                                                │
   │                                                              │
   │ Sayfanın tamamı bu yüzden çöküyordu.                        │
   │                                                              │
   │ ⚠ BU DOSYADA `"use client"` YOK.                            │
   │ Yalnızca saf hesaplama; iki taraf da kullanabiliyor.       │
   └──────────────────────────────────────────────────────────────┘
   ══════════════════════════════════════════════════════════════ */

/** Büyüklüğe göre renk — kırmızıya doğru */
export function renk(m: number): string {
  if (m >= 5) return "#FF453A";
  if (m >= 4) return "#FF9F0A";
  if (m >= 3) return "#FFD60A";
  return "#30D158";
}

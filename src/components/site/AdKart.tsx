"use client";

import { useState } from "react";
import { mediaUrl } from "@/lib/media";

/* ══════════════════════════════════════════════════════════════
   REKLAM KARTI

   ⚠ ÇİZİM AYRI DOSYADA.
   `AdSlot` yalnızca veriyi ve yükleme durumunu yönetiyor;
   görünüm burada. İkisi bir aradayken dosya okunmaz hâle
   gelmişti.
   ══════════════════════════════════════════════════════════════ */

export interface Ad {
  id: string;
  advertiser: string | null;
  image_key: string | null;
  image_dark_key: string | null;
  target_url: string | null;
  headline: string | null;
  body: string | null;
  cta_label: string | null;
  embed_html: string | null;
}

export default function AdKart({
  ad, onHazir,
}: {
  ad: Ad;
  /* Görsel yüklendiğinde haber veriyor — iskelet o ana kadar duruyor */
  onHazir?: () => void;
}) {
  /*
   * ┌─ KANCA KOŞULSUZ ÇAĞRILMALI ⚠️ ─────────────────────────────┐
   * │ Bu satır `embed_html` denetiminden SONRAYDI. Gömülü kodlu │
   * │ reklamda erken dönüş oluyor ve kanca çağrılmıyordu;       │
   * │ React'in kural ihlali derlemeyi kırdı.                     │
   * │                                                              │
   * │ Görsel yoksa baştan "hazır" sayılıyor.                     │
   * └──────────────────────────────────────────────────────────────┘
   */
  const [yuklendi, setYuklendi] = useState(!ad.image_key);
  /*
   * ⚠ GÖMÜLÜ KOD AYRI ELE ALINIYOR.
   * Dış reklam ağları kendi HTML'ini veriyor; kart düzenine
   * sokmak çizimi bozuyordu.
   */
  if (ad.embed_html) {
    return (
      <div style={{ margin: "var(--g) 0" }}>
        <div className="eyebrow muted" style={{ marginBottom: 6 }}>
          Reklam
        </div>
        <div dangerouslySetInnerHTML={{ __html: ad.embed_html }} />
      </div>
    );
  }

  const gorsel = ad.image_key ? mediaUrl(ad.image_key) : null;


  const ic = (
    <div
      style={{
        border: "1px solid var(--bd)",
        borderRadius: "var(--radius)",
        background: "var(--s1)",
        padding: 14,
        overflow: "hidden",
      }}
    >
      <div className="eyebrow muted" style={{ marginBottom: 8 }}>
        Reklam{ad.advertiser ? ` · ${ad.advertiser}` : ""}
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        {gorsel && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={gorsel}
            alt={ad.headline ?? "Reklam"}
            /*
             * ⚠ `eager` — İSKELET ZATEN YERİ TUTUYOR.
             * `lazy` ile görsel geç başlıyor ve iskelet gereğinden
             * uzun kalıyordu.
             */
            loading="eager"
            onLoad={() => { setYuklendi(true); onHazir?.(); }}
            /*
             * ⚠ HATA DA "HAZIR" SAYILIYOR.
             * Görsel bozuksa iskelet sonsuza kadar kalırdı.
             */
            onError={() => { setYuklendi(true); onHazir?.(); }}
            style={{
              width: 120, height: 80, objectFit: "cover",
              borderRadius: 10, flexShrink: 0,
              /* Yumuşak geçiş — pat diye belirmesin */
              opacity: yuklendi ? 1 : 0,
              transition: "opacity 320ms ease",
            }}
          />
        )}

        <div style={{ minWidth: 0 }}>
          {ad.headline && (
            <div style={{ fontWeight: 700, marginBottom: 4 }}>
              {ad.headline}
            </div>
          )}
          {ad.body && (
            <div className="muted" style={{ fontSize: 14 }}>
              {ad.body}
            </div>
          )}
          {ad.cta_label && (
            <div
              style={{
                marginTop: 8, fontSize: 13,
                fontWeight: 600, color: "var(--accent)",
              }}
            >
              {ad.cta_label}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ margin: "var(--g) 0" }}>
      {ad.target_url ? (
        <a
          href={ad.target_url}
          target="_blank"
          /* ⚠ `sponsored` ZORUNLU — arama motorları için */
          rel="noopener noreferrer sponsored"
        >
          {ic}
        </a>
      ) : ic}
    </div>
  );
}

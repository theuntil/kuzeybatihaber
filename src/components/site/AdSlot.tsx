"use client";

import { useEffect, useState } from "react";
import AdSkeleton from "./AdSkeleton";
import AdKart, { type Ad } from "./AdKart";

/* ══════════════════════════════════════════════════════════════
   REKLAM YUVASI

   ┌─ İSTEMCİDE ÇEKİLİYOR ⚠️ ───────────────────────────────────┐
   │ Önce sunucu bileşeniydi. Sayfalar önceden üretildiği için │
   │ (SSG, `revalidate`) reklam derlemede gömülüyor, Suspense   │
   │ hiç tetiklenmiyor ve iskelet asla görünmüyordu.            │
   │                                                              │
   │ Artık `/api/reklam` ucundan isteniyor; yükleme süresince   │
   │ iskelet gerçekten ekranda duruyor.                          │
   └──────────────────────────────────────────────────────────────┘

   ┌─ YER HER DURUMDA AYRILIYOR ⚠️ ─────────────────────────────┐
   │ İstek bitene kadar iskelet, reklam yoksa hiçbir şey.      │
   │ Boş dönerse yuva tamamen kayboluyor — boş kutu bırakmak   │
   │ sayfayı delik gösteriyordu.                                  │
   └──────────────────────────────────────────────────────────────┘
   ══════════════════════════════════════════════════════════════ */

export default function AdSlot({
  placement, enabled,
}: {
  placement: string;
  enabled: boolean;
  /* `locale` artık kullanılmıyor; çağrılar kırılmasın diye duruyor */
  locale?: string;
}) {
  const [ad, setAd] = useState<Ad | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);

  /*
   * ┌─ İSKELET GÖRSEL HAZIR OLANA KADAR ⚠️ ──────────────────────┐
   * │ Veri milisaniyeler içinde geliyordu; iskelet göz          │
   * │ kırpması kadar görünüp kayboluyor, sonra görsel yüklenene │
   * │ kadar boş kart duruyordu.                                   │
   * │                                                              │
   * │ Artık iskelet görsel gelene kadar kalıyor ve kart altında │
   * │ hazırlanıyor; tek bir yumuşak geçişle yerini alıyor.      │
   * └──────────────────────────────────────────────────────────────┘
   */
  const [gorselHazir, setGorselHazir] = useState(false);

  useEffect(() => {
    if (!enabled) { setYukleniyor(false); return; }

    let iptal = false;

    fetch(`/api/reklam?placement=${encodeURIComponent(placement)}`)
      .then((r) => r.json())
      .then((d: { ad?: Ad | null }) => {
        if (iptal) return;

        const r = d.ad ?? null;
        setAd(r);

        /*
         * ⚠ GÖRSELSİZ REKLAM BEKLETİLMİYOR.
         * Yalnızca metin ya da gömülü kod varsa `onLoad` hiç
         * tetiklenmez; iskelet sonsuza kadar kalırdı.
         */
        if (r && !r.image_key) setGorselHazir(true);
      })
      .catch(() => {
        /* Reklam alınamadı — sayfa etkilenmiyor */
      })
      .finally(() => {
        if (!iptal) setYukleniyor(false);
      });

    return () => { iptal = true; };
  }, [placement, enabled]);

  if (!enabled) return null;
  if (!yukleniyor && !ad) return null;

  return (
    <div style={{ position: "relative" }}>
      {/*
        ⚠ İKİSİ ÜST ÜSTE DURUYOR.
        Kart görünmezken de çiziliyor ki görsel yüklenmeye
        başlasın; hazır olunca iskelet solup kart beliriyor.
      */}
      {!gorselHazir && (
        <div style={{ position: gorselHazir ? "absolute" : "static", inset: 0 }}>
          <AdSkeleton placement={placement} />
        </div>
      )}

      {ad && (
        <div
          style={{
            opacity: gorselHazir ? 1 : 0,
            /* Hazır değilken yer kaplamasın — iskelet zaten tutuyor */
            position: gorselHazir ? "static" : "absolute",
            inset: 0,
            pointerEvents: gorselHazir ? "auto" : "none",
            transition: "opacity 320ms ease",
          }}
        >
          <AdKart ad={ad} onHazir={() => setGorselHazir(true)} />
        </div>
      )}
    </div>
  );
}

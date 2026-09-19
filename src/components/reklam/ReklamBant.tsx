"use client";
import { useEffect, useLayoutEffect, useState } from "react";

/* Sunucuda düzen kancası yok — uyarı basmasın */
const useIzoEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;
import { supabaseBrowser } from "@/lib/supabase/client";

/* ══════════════════════════════════════════════════════════════
   REKLAM BANDI

   Belirli noktalarda tek bir yatay reklam. Şerit sisteminden
   TAMAMEN AYRI: orası döngü hâlinde akan bir sütun, burası
   sabit tek bir görsel.

   ⚠ MOBİL VE MASAÜSTÜ İÇİN AYRI GÖRSEL.
   İkisi de yüklenmişse ekran genişliğine göre biri seçiliyor.
   Yalnızca biri varsa o kullanılıyor — eksik görsel yüzünden
   alan boş kalmıyor.
   ══════════════════════════════════════════════════════════════ */

interface Reklam {
  id: string;
  gorsel_key: string;
  mobil_key: string | null;
  hedef_url: string;
}

export type BantYeri = "article_top" | "article_bottom" | "home_top";

export default function ReklamBant({
  yer, cdnBase, aktif = true,
}: { yer: BantYeri; cdnBase: string; aktif?: boolean }) {
  const [r, setR] = useState<Reklam | null>(null);

  /*
   * ┌─ İSKELET GÖRSEL HAZIR OLANA KADAR ⚠️ ──────────────────────┐
   * │ Bileşen veri gelene kadar `null` dönüyordu: ekranda hiç   │
   * │ yer tutulmuyor, reklam gelince alttaki içerik aşağı       │
   * │ zıplıyordu.                                                  │
   * │                                                              │
   * │ Artık istek sürerken iskelet duruyor, görsel yüklenince   │
   * │ yumuşak geçişle yerini alıyor.                              │
   * └──────────────────────────────────────────────────────────────┘
   */
  const [yukleniyor, setYukleniyor] = useState(true);
  const [gorselHazir, setGorselHazir] = useState(false);
  const [mobil, setMobil] = useState(false);
  const cdn = cdnBase.replace(/\/+$/, "");

  useIzoEffect(() => {
    const olc = () => setMobil(window.innerWidth < 768);
    olc();
    window.addEventListener("resize", olc);
    return () => window.removeEventListener("resize", olc);
  }, []);

  useEffect(() => {
    if (!aktif) return;   // kapalıysa istek yok
    let iptal = false;
    void (async () => {
      const sb = supabaseBrowser();
      const { data, error } = await sb
        .from("public_reklamlar")
        .select("id, gorsel_key, mobil_key, hedef_url")
        .eq("yer", yer)
        .order("sira")
        .limit(1)
        .maybeSingle();

      if (iptal) return;

      /*
       * ⚠ İSKELET HER DURUMDA KAPANIYOR.
       * Yalnızca başarılı yanıtta kapatılsaydı hata ya da boş
       * sonuçta sonsuza kadar dönerdi.
       */
      setYukleniyor(false);
      if (error) {
        console.error(`[REKLAM] ${yer} okunamadı:`, error.message);
        return;
      }
      const gelen = (data ?? null) as Reklam | null;
      setR(gelen);

      /* Görsel yoksa bekleyecek bir şey yok */
      if (!gelen?.gorsel_key) { setGorselHazir(true); return; }

      /*
       * ┌─ ZAMAN AŞIMI ⚠️ ───────────────────────────────────────────┐
       * │ Reklam engelleyici görsel isteğini sessizce düşürüyor:   │
       * │ ne `onload` ne `onerror` tetikleniyor ve iskelet         │
       * │ sonsuza kadar dönüyordu.                                    │
       * └──────────────────────────────────────────────────────────────┘
       */
      setTimeout(() => {
        if (!iptal) setGorselHazir(true);
      }, 3000);
    })();

    return () => { iptal = true; };
  }, [yer, aktif]);

  if (!aktif) return null;

  /* İstek sürerken yer tutuluyor */
  if (yukleniyor) {
    return (
      <div
        className="reklam-bant-iskelet"
        style={{
          width: "100%",
          height: mobil ? 100 : 140,
          borderRadius: "var(--radius)",
          background: "var(--s2, var(--s1))",
          margin: "var(--g) 0",
          /* `pulse` globals.css içinde tanımlı */
          animation: "pulse 1.4s ease-in-out infinite",
        }}
        /* ⚠ Ekran okuyucudan gizli — içerik değil, yer tutucu */
        aria-hidden="true"
      />
    );
  }

  if (!r) return null;

  /* Mobilde mobil görsel varsa o, yoksa masaüstü görseli */
  const anahtar = mobil ? (r.mobil_key ?? r.gorsel_key) : r.gorsel_key;

  return (
    <a
      href={r.hedef_url}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="kb-reklam-bant"
      aria-label="Reklam"
      onClick={() => {
        void supabaseBrowser()
          .rpc("reklam_tiklandi", { p_id: r.id })
          .then(() => undefined, () => undefined);
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${cdn}/${anahtar}`}
        alt=""
        /*
         * ⚠ `eager` — İSKELET ZATEN YERİ TUTUYOR.
         * `lazy` ile görsel geç başlıyor, iskelet uzun kalıyordu.
         */
        loading="eager"
        decoding="async"
        onLoad={() => setGorselHazir(true)}
        /* Bozuk görselde iskelet takılı kalmasın */
        onError={() => setGorselHazir(true)}
        style={{
          opacity: gorselHazir ? 1 : 0,
          transition: "opacity 320ms ease",
        }}
      />
    </a>
  );
}

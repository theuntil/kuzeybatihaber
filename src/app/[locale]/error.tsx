"use client";

import { useEffect } from "react";

/* ══════════════════════════════════════════════════════════════
   HATA SINIRI

   ┌─ NEDEN GEREKLİ ⚠️ ─────────────────────────────────────────┐
   │ Bu dosya yokken çizim sırasında oluşan bir hata Next.js'in │
   │ ham ekranına düşüyordu:                                     │
   │   "Application error: a client-side exception has occurred" │
   │                                                              │
   │ Okur ne olduğunu anlamıyor, geri dönecek bir bağlantı da   │
   │ bulamıyordu.                                                 │
   └──────────────────────────────────────────────────────────────┘

   ⚠ `reset` ÖNCE DENENİYOR.
   Geçici bir hata (ağ kesintisi, yarım yüklenen veri) yeniden
   denemeyle geçiyor; sayfayı tamamen yenilemeye gerek yok.
   ══════════════════════════════════════════════════════════════ */

export default function Hata({
  error, reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    /*
     * ⚠ SUNUCU GÜNLÜĞÜNE DÜŞMÜYOR.
     * İstemci hatası yalnızca tarayıcıda görünüyor; `digest`
     * sunucu kaydıyla eşleştirmeye yarıyor.
     */
    console.error("[SAYFA HATASI]", error.digest ?? "", error.message);
  }, [error]);

  return (
    <main
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        padding: "48px 24px",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>
        Bir şeyler ters gitti
      </h1>

      <p style={{ color: "var(--muted)", fontSize: 15, margin: 0, maxWidth: 420 }}>
        Sayfa yüklenirken bir sorun oluştu. Tekrar deneyebilir ya da
        ana sayfaya dönebilirsin.
      </p>

      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <button
          onClick={reset}
          style={{
            padding: "11px 22px",
            borderRadius: 999,
            border: "none",
            background: "var(--fg)",
            color: "var(--bg)",
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Tekrar dene
        </button>

        <a
          href="/"
          style={{
            padding: "11px 22px",
            borderRadius: 999,
            border: "1px solid var(--bd)",
            fontSize: 15,
            fontWeight: 600,
            textDecoration: "none",
            color: "inherit",
          }}
        >
          Ana sayfa
        </a>
      </div>

      {/* Destek istenirse bu kod işe yarıyor */}
      {error.digest && (
        <code style={{ fontSize: 11.5, color: "var(--muted2)", marginTop: 6 }}>
          {error.digest}
        </code>
      )}
    </main>
  );
}

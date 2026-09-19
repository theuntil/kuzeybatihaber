"use client";

/* ══════════════════════════════════════════════════════════════
   GENEL HATA YAKALAYICI

   ┌─ SON SAVUNMA HATTI ⚠️ ─────────────────────────────────────┐
   │ Kök düzende bir hata olursa Next.js varsayılan ekranı      │
   │ gösteriyor:                                                   │
   │   "Application error: a client-side exception has occurred"│
   │                                                              │
   │ Okur için hiçbir anlamı yok ve siteden çıkış yolu da      │
   │ sunmuyor.                                                     │
   └──────────────────────────────────────────────────────────────┘

   ⚠ KENDİ `<html>` VE `<body>` ETİKETLERİ ŞART.
   Bu bileşen kök düzenin YERİNE geçiyor; onları yazmazsa
   sayfa hiç çizilmiyor.

   ⚠ İSTEMCİ BİLEŞENİ OLMALI.
   Hata sınırları yalnızca istemcide çalışıyor.
   ══════════════════════════════════════════════════════════════ */

export default function GlobalError({
  error, reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="tr">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
          background: "#0B0D0F",
          color: "#fff",
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <div style={{ fontSize: 44, marginBottom: 18 }}>⚠️</div>

          <h1 style={{ fontSize: 22, margin: "0 0 10px", fontWeight: 700 }}>
            Bir şeyler ters gitti
          </h1>

          <p style={{ opacity: 0.7, lineHeight: 1.6, margin: "0 0 26px" }}>
            Sayfa yüklenirken beklenmedik bir hata oluştu.
            Tekrar denemek isteyebilirsin.
          </p>

          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button
              onClick={reset}
              style={{
                padding: "12px 22px",
                borderRadius: 999,
                border: "none",
                background: "#fff",
                color: "#0B0D0F",
                fontWeight: 600,
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              Tekrar dene
            </button>

            <a
              href="/"
              style={{
                padding: "12px 22px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.2)",
                color: "#fff",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: 15,
              }}
            >
              Ana sayfa
            </a>
          </div>

          {/*
            ⚠ `digest` GÖSTERİLİYOR.
            Sunucu günlüğünde aynı kod geçiyor; okur bunu
            iletirse hata hemen bulunuyor.
          */}
          {error.digest && (
            <p style={{ marginTop: 22, fontSize: 12, opacity: 0.4 }}>
              Hata kodu: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}

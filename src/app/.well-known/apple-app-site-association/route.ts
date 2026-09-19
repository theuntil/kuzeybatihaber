import { NextResponse } from "next/server";

/* ══════════════════════════════════════════════════════════════
   APPLE APP SITE ASSOCIATION

   ┌─ UYGULAMA YÜKLÜYSE BAĞLANTI ORADA AÇILIYOR ⚠️ ─────────────┐
   │ iOS bu dosyayı okuyup "bu alan adı şu uygulamaya ait"     │
   │ diyor. Uygulama yüklüyse haber bağlantıları Safari yerine │
   │ doğrudan uygulamada açılıyor.                               │
   │                                                              │
   │ ⚠ `Content-Type` `application/json` OLMALI.                 │
   │ Apple başka bir tür görürse dosyayı yok sayıyor ve hiçbir │
   │ hata vermiyor — teşhisi en zor kısmı bu.                   │
   │                                                              │
   │ ⚠ YÖNLENDİRME OLMAMALI.                                     │
   │ Apple 301/302 izlemiyor. `www` ve köksüz sürüm ayrı ayrı  │
   │ sunulmalı; Cloudflare yönlendirmesi bu yolu es geçmeli.    │
   └──────────────────────────────────────────────────────────────┘
   ══════════════════════════════════════════════════════════════ */

/* Takım kimliği + paket kimliği */
const UYGULAMA = "QM67F4QTUK.com.rovand.kuzeybati";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(
    {
      applinks: {
        /*
         * ⚠ `apps` BOŞ DİZİ OLMALI.
         * Eski biçimin kalıntısı; Apple hâlâ varlığını bekliyor.
         */
        apps: [],
        details: [
          {
            appID: UYGULAMA,
            /*
             * Yalnızca içerik yolları uygulamada açılıyor.
             * Hesap ve giriş akışları tarayıcıda kalmalı —
             * uygulamada hesap kavramı yok.
             */
            paths: [
              "/tr/news/*",
              "/en/news/*",
              "/tr/category/*",
              "/en/category/*",
              "/tr/city/*",
              "/en/city/*",
              "NOT /*/account*",
              "NOT /*/login*",
              "NOT /*/signup*",
              "NOT /auth/*",
              "NOT /api/*",
            ],
          },
        ],
      },
    },
    {
      headers: {
        "Content-Type": "application/json",
        /* Apple günde bir kez okuyor; uzun önbellek sorun değil */
        "Cache-Control": "public, max-age=3600",
      },
    },
  );
}

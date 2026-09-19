import { NextResponse } from "next/server";
import { createAuthedClient } from "@/lib/supabase/server";
import { sendMail, mailConfigured } from "@/lib/mail";

/* ══════════════════════════════════════════════════════════════
   E-POSTA DEĞİŞTİRME — DOĞRULAMA KODU GÖNDERİMİ

   ┌─ ALAN ADLARI UYUŞMUYORDU ⚠️ ───────────────────────────────┐
   │ Arayüz `{ email, code, name }` gönderiyor ama uç          │
   │ `{ email, newEmail, ticket }` bekliyordu. `newEmail`       │
   │ bulunamayınca biçim denetimi düşüyor ve 400 dönüyordu;    │
   │ okur "Mail gönderilemedi" görüyordu.                       │
   │                                                              │
   │ Uç eski bir akış için yazılmıştı. Artık arayüzün          │
   │ gönderdiği biçimi okuyor.                                    │
   └──────────────────────────────────────────────────────────────┘

   ┌─ KOD SUNUCUDA ÜRETİLİYOR ⚠️ ───────────────────────────────┐
   │ `request_email_change` kodu veritabanında oluşturup        │
   │ saklıyor; bu uç yalnızca GÖNDERİYOR. Kodu burada          │
   │ üretmek, doğrulama adımıyla eşleşmemesine yol açardı.     │
   └──────────────────────────────────────────────────────────────┘

   ⚠ OTURUM ZORUNLU.
   Kimliği doğrulanmamış biri başkasının adresine kod
   gönderemesin.
   ══════════════════════════════════════════════════════════════ */

export async function POST(req: Request) {
  if (!mailConfigured()) {
    return NextResponse.json({ error: "disabled" }, { status: 503 });
  }

  const sb = await createAuthedClient();
  const { data: auth } = await sb.auth.getUser();

  if (!auth.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const govde = await req.json().catch(() => null) as
    | { email?: string; code?: string; name?: string; locale?: string }
    | null;

  const hedef = govde?.email?.trim().toLowerCase() ?? "";
  const kod = govde?.code?.trim() ?? "";
  const ad = govde?.name?.trim() || "Okur";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(hedef)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  if (!kod) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  /*
   * ┌─ KOD DOĞRULAMASI GÖNDERİM AŞAMASINDA YOK ⚠️ ───────────────┐
   * │ Kodu `request_email_change` üretip veritabanına yazdı ve  │
   * │ istemciye döndürdü. Burada tekrar doğrulamak için ayrı    │
   * │ bir SQL fonksiyonu gerekiyor; şemada yok.                  │
   * │                                                              │
   * │ Güvenlik oturumla sağlanıyor: kimliği doğrulanmamış biri │
   * │ bu uca hiç ulaşamıyor ve kod yalnızca kendi hesabı için  │
   * │ üretiliyor.                                                  │
   * │                                                              │
   * │ ⚠ ASIL DENETİM İKİNCİ ADIMDA.                               │
   * │ Kod girildiğinde `confirm_email_change` doğruluyor; yanlış│
   * │ kodla adres değişmiyor.                                      │
   * └──────────────────────────────────────────────────────────────┘
   */


  /*
   * ⚠ `verify_email` ŞABLONU KULLANILIYOR.
   * Mail servisinde ayrı bir "adres değiştirme" şablonu yok;
   * içerik aynı: bir doğrulama kodu. Şablon eklenirse burası
   * güncellenir.
   */
  const sonuc = await sendMail({
    template: "verify_email",
    to: hedef,
    toName: ad,
    locale: govde?.locale ?? "tr",
    payload: { code: kod, name: ad },
  });

  if (!sonuc.ok) {
    /* Gerçek sebep sunucu günlüğünde; okura ayrıntı verilmiyor */
    console.error("[E-POSTA DEĞİŞTİR] gönderilemedi:",
      sonuc.status, JSON.stringify(sonuc.body));
    return NextResponse.json({ error: "send_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}

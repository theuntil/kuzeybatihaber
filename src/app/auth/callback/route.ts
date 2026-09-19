import { NextResponse, type NextRequest } from "next/server";
import { createAuthedClient } from "@/lib/supabase/server";

/**
 * E-posta doğrulama / magic link dönüşü.
 * Supabase kodu çerez oturumuna çevirir, sonra kullanıcıyı
 * geldiği yere geri gönderir.
 */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const next = req.nextUrl.searchParams.get("next") ?? "/";

  if (code) {
    const sb = await createAuthedClient();
    const { data, error } = await sb.auth.exchangeCodeForSession(code);

    if (!error) {
      /*
       * ┌─ EKSİK PROFİL TAMAMLATILIYOR ⚠️ ───────────────────────────┐
       * │ Google/Apple ile kayıt olan kullanıcının kullanıcı adı ve │
       * │ şehri olmuyor; tetikleyici yalnızca `display_name`        │
       * │ dolduruyor.                                                  │
       * │                                                              │
       * │ Önce ana sayfaya düşüyordu ve okur eksik bilgiyle         │
       * │ dolaşıyordu. Artık `onboarded_at` boşsa tamamlama         │
       * │ sayfasına gidiyor.                                           │
       * │                                                              │
       * │ ⚠ HATA DURUMUNDA ENGELLEMİYOR.                              │
       * │ Profil okunamazsa kullanıcı yine içeri alınıyor; giriş    │
       * │ yapamamaktansa eksik profille devam etmek iyi.            │
       * └──────────────────────────────────────────────────────────────┘
       */
      const hedef = await yonlendirmeHedefi(sb, data?.user?.id, next);
      return NextResponse.redirect(new URL(hedef, tabanAdres(req)));
    }
  }
  return NextResponse.redirect(new URL("/?auth=error", tabanAdres(req)));
}


/**
 * Giriş sonrası nereye gidileceği.
 *
 * ⚠ TEK KOLON OKUNUYOR.
 * Tüm profili çekmek gereksiz; karar yalnızca `onboarded_at`
 * alanına bakıyor.
 */
async function yonlendirmeHedefi(
  sb: Awaited<ReturnType<typeof createAuthedClient>>,
  userId: string | undefined,
  next: string,
): Promise<string> {
  if (!userId) return next;

  try {
    const { data } = await sb
      .from("profiles")
      .select("onboarded_at, username")
      .eq("id", userId)
      .maybeSingle();

    /* Profil yoksa da tamamlama sayfası açılmalı */
    if (!data || !data.onboarded_at || !data.username) {
      /* Kullanıcı bir habere gitmek istiyorduysa sonra oraya dönsün */
      const sonra = next && next !== "/" ? `?next=${encodeURIComponent(next)}` : "";
      return `/complete-profile${sonra}`;
    }
  } catch {
    /* Okunamadı — akışı kesmiyoruz */
  }

  return next;
}

/**
 * Yönlendirme için gerçek site adresi.
 *
 * ┌─ `req.url` KONTEYNERDE İÇ ADRESİ VERİYOR ⚠️ ───────────────┐
 * │ Standalone sunucu `HOSTNAME=0.0.0.0` ile dinliyor; Next.js │
 * │ `req.url` değerini oradan türetiyor ve sonuç              │
 * │ `http://0.0.0.0:3000/...` oluyor. Kullanıcı giriş yaptıktan│
 * │ sonra o adrese yönlendiriliyor ve sayfa açılmıyor.        │
 * │                                                              │
 * │ Vercel'de sorun çıkmıyordu: orada gerçek alan adı geliyor.│
 * │                                                              │
 * │ ⚠ ÖNCE `SITE_URL`, SONRA BAŞLIK.                            │
 * │ Ortam değişkeni kesin doğru. Yoksa Traefik'in eklediği     │
 * │ `x-forwarded-host` kullanılıyor; o da yoksa `req.url`.     │
 * └──────────────────────────────────────────────────────────────┘
 */
function tabanAdres(req: Request): string {
  const ayar = process.env.SITE_URL?.trim();
  if (ayar?.startsWith("http")) return ayar;

  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");

  if (host) {
    /* Yerel geliştirmede https yok */
    const sema = host.startsWith("localhost") ? "http" : "https";
    return `${sema}://${host}`;
  }

  return req.url;
}

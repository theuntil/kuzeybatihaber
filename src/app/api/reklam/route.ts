import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/server";
import { publicConfig } from "@/lib/config";

/* ══════════════════════════════════════════════════════════════
   REKLAM UCU

   ┌─ NEDEN AYRI UÇ ⚠️ ─────────────────────────────────────────┐
   │ `AdSlot` sunucu bileşeniydi ve sayfayla birlikte           │
   │ çiziliyordu. Sayfalar önceden üretildiği için (SSG,        │
   │ `revalidate`) reklam derlemede gömülüyor ve Suspense hiç   │
   │ tetiklenmiyordu — iskelet asla görünmüyordu.                │
   │                                                              │
   │ Uç ayrılınca reklam tarayıcıdan isteniyor; yükleme         │
   │ süresince iskelet gerçekten görünüyor.                      │
   └──────────────────────────────────────────────────────────────┘

   ⚠ ÖNBELLEK KISA.
   Reklam panelden değiştirilince bir dakika içinde yansıyor;
   uzun önbellek eski afişi günlerce gösterirdi.
   ══════════════════════════════════════════════════════════════ */

export const revalidate = 60;

export async function GET(req: Request) {
  const yer = new URL(req.url).searchParams.get("placement")?.trim() ?? "";

  if (!yer || !publicConfig().supabaseUrl) {
    return NextResponse.json({ ad: null });
  }

  try {
    const sb = createPublicClient();

    const { data } = await sb
      .from("public_ads")
      .select("*")
      .eq("placement", yer)
      .order("sort_order")
      .limit(1);

    return NextResponse.json(
      { ad: data?.[0] ?? null },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch {
    /* Reklam alınamadıysa sayfa yine çalışmalı */
    return NextResponse.json({ ad: null });
  }
}

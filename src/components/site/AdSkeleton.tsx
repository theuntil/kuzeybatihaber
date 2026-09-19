/* ══════════════════════════════════════════════════════════════
   REKLAM İSKELETİ

   ┌─ YÜKSEKLİK ÖNCEDEN AYRILIYOR ⚠️ ───────────────────────────┐
   │ Reklam sunucudan gelene kadar yer boş kalıyor, içerik     │
   │ girince altındaki her şey aşağı kayıyordu. Okur yazıyı    │
   │ takip ederken satır yerinden oynuyordu.                     │
   │                                                              │
   │ İskelet gerçek reklamla AYNI yüksekliği tutuyor; içerik   │
   │ gelince yalnızca iskelet yerini alıyor, sayfa zıplamıyor. │
   └──────────────────────────────────────────────────────────────┘

   ⚠ ÖLÇÜLER YERLEŞİME GÖRE.
   Kenar çubuğu dikey, makale arası yatay. İkisi aynı
   yükseklikte olsaydı biri boşluk, diğeri taşma yaratırdı.
   ══════════════════════════════════════════════════════════════ */

const OLCU: Record<string, { y: number; sinif: string }> = {
  /* Kenar çubuğu — dikey afiş */
  sidebar: { y: 600, sinif: "w-full" },

  /* Makale arası — yatay şerit */
  "article-mid": { y: 120, sinif: "w-full" },

  /* Ana sayfa şeridi */
  "home-strip": { y: 140, sinif: "w-full" },
};

export default function AdSkeleton({ placement }: { placement: string }) {
  /* Tanımsız yerleşimde orta boy — hiç yer ayırmamaktan iyi */
  const o = OLCU[placement] ?? { y: 140, sinif: "w-full" };

  return (
    <div
      className={`${o.sinif} rounded-2xl bg-[var(--surface-2)] animate-pulse`}
      style={{ height: o.y }}
      /*
       * ⚠ EKRAN OKUYUCUDAN GİZLİ.
       * İskelet bir içerik değil; okunması kafa karıştırıcı.
       */
      aria-hidden="true"
    />
  );
}

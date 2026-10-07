import type { DailyPriceRow } from '@/lib/contracts/market'

export function formatCurrencyIdr(val: number | null | undefined): string {
  if (val === null || val === undefined || !Number.isFinite(val)) return '—'
  return `Rp ${val.toLocaleString('id-ID')}`
}

export function formatPercentageChange(fraction: number | null | undefined): {
  text: string
  trend: 'up' | 'down' | 'neutral'
} {
  if (fraction === null || fraction === undefined || !Number.isFinite(fraction)) {
    return { text: '—', trend: 'neutral' }
  }
  const pct = fraction * 100
  const isUp = pct > 0
  const isDown = pct < 0
  return {
    text: `${isUp ? '+' : ''}${pct.toFixed(2)}%`,
    trend: isUp ? 'up' : isDown ? 'down' : 'neutral',
  }
}

export function formatForeignFlow(val: number | null | undefined): string {
  if (val === null || val === undefined || !Number.isFinite(val)) return '—'
  if (val > 0) return `Beli bersih Rp ${val.toLocaleString('id-ID')}`
  if (val < 0) return `Jual bersih Rp ${Math.abs(val).toLocaleString('id-ID')}`
  return 'Beli dan jual seimbang (Rp 0)'
}

export function formatDateWib(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Tanggal belum tersedia'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Jakarta',
    })
  } catch {
    return dateStr
  }
}

export function formatScore(score: number | null | undefined): string {
  if (score === null || score === undefined || !Number.isFinite(score)) {
    return 'Data belum cukup'
  }
  return `${Math.round(score)}/100`
}

export function getStatusLabel(status: string | null | undefined): {
  label: string
  variant: 'normal' | 'warning' | 'critical' | 'insufficient'
} {
  if (!status || status === 'INSUFFICIENT_DATA' || status === 'UNKNOWN') {
    return { label: 'Data belum cukup', variant: 'insufficient' }
  }
  const labels: Record<string, string> = {
    NORMAL: 'Belum ada peringatan khusus',
    WARNING: 'Perlu diperiksa',
    HIGH: 'Perlu lebih berhati-hati',
    CRITICAL: 'Ada peringatan penting',
    BIG_ACCUMULATION: 'Pembelian besar melalui broker utama',
    NORMAL_ACCUMULATION: 'Pembelian lebih menonjol',
    BIG_DISTRIBUTION: 'Penjualan besar melalui broker utama',
    NORMAL_DISTRIBUTION: 'Penjualan lebih menonjol',
    NEUTRAL: 'Relatif seimbang',
    HEAVY_INFLOW: 'Pembelian asing jauh lebih besar',
    INFLOW: 'Asing lebih banyak membeli',
    OUTFLOW: 'Asing lebih banyak menjual',
    HEAVY_OUTFLOW: 'Penjualan asing jauh lebih besar',
    SLEEPING_GIANT: 'Berita positif, harga belum banyak naik',
    PRICED_IN_RALLY: 'Harga sudah naik setelah berita',
    DELAYED_SELL_OFF_RISK: 'Berita negatif, harga belum banyak turun',
    NORMAL_REACTION: 'Tidak ada perbedaan mencolok',
    NO_PRICE_RESPONSE: 'Harga setelah berita terbit belum tersedia',
    NO_CATALYST: 'Belum ada berita penting',
    STEEP_DISCOUNT_DUMP: 'Penjualan jauh di bawah harga pasar',
    MASSIVE_DIVESTMENT: 'Penjualan saham dalam jumlah besar',
    AGGRESSIVE_BUY: 'Pembelian saham dalam jumlah besar',
    CONGLOMERATE_SHUFFLE: 'Perpindahan saham dalam satu grup',
    ROUTINE_TRANSACTION: 'Transaksi biasa',
    NO_RECENT_FILINGS: 'Belum ada laporan transaksi terbaru',
    WATCHING: 'Sedang dipantau',
    ACCUMULATING: 'Menambah saham',
    BOUGHT: 'Sudah dibeli',
    LOW: 'Rendah',
  }
  const label = labels[status] ?? 'Belum ada penjelasan'
  if (status === 'CRITICAL' || status === 'BIG_DISTRIBUTION' || status === 'STEEP_DISCOUNT_DUMP') {
    return { label, variant: 'critical' }
  }
  if (status === 'WARNING' || status === 'NORMAL_DISTRIBUTION' || status === 'HIGH') {
    return { label, variant: 'warning' }
  }
  return { label, variant: 'normal' }
}

export function getNewsSentimentLabel(sentiment?: string | null): string {
  return (
    ({ BULLISH: 'Positif', BEARISH: 'Negatif', NEUTRAL: 'Netral' } as Record<string, string>)[
      sentiment ?? ''
    ] ?? 'Belum dinilai'
  )
}

export function getNewsCategoryLabel(category?: string | null): string {
  return (
    (
      {
        ACQUISITION: 'Pembelian perusahaan',
        DIVIDEND: 'Pembagian dividen',
        EARNINGS: 'Laba dan pendapatan',
        CONTRACT_WIN: 'Kontrak bisnis',
        DEBT: 'Utang perusahaan',
        GENERAL: 'Berita umum',
      } as Record<string, string>
    )[category ?? ''] ?? 'Berita lainnya'
  )
}

export function getSectorLabel(sector?: string | null): string {
  return (
    (
      {
        'Basic Materials': 'Bahan baku',
        'Consumer Cyclicals': 'Barang konsumen nonpokok',
        'Consumer Non-Cyclicals': 'Barang kebutuhan pokok',
        Energy: 'Energi',
        Financials: 'Keuangan',
        Healthcare: 'Kesehatan',
        Industrials: 'Perindustrian',
        Infrastructures: 'Infrastruktur',
        'Properties & Real Estate': 'Properti',
        Technology: 'Teknologi',
        'Transportation & Logistic': 'Transportasi dan logistik',
        Telecommunication: 'Telekomunikasi',
      } as Record<string, string>
    )[sector ?? ''] ??
    sector ??
    'Belum tersedia'
  )
}

export const METRIC_EXPLANATIONS: Record<string, { short: string; detailed: string }> = {
  compositeScore: {
    short: 'Skor gabungan dari keuangan perusahaan, transaksi, dan berita.',
    detailed:
      'Skor memakai data keuangan (25%), transaksi broker (35%), berita dan perubahan harga (25%), serta transaksi pengurus dan pemegang saham besar (15%). Jika ada data yang belum lengkap, skor belum dihitung. Skor bukan perkiraan keuntungan.',
  },
  volumeSpike: {
    short: 'Jumlah saham yang diperdagangkan dibanding rata-rata 20 hari bursa sebelumnya.',
    detailed:
      'Jumlah lembar saham pada hari bursa terakhir dibagi rata-rata 20 hari sebelumnya. Angka 1,5x berarti 50% lebih banyak dari biasanya. Perhitungan ini membutuhkan data 21 hari perdagangan.',
  },
  peRatio: {
    short: 'Harga satu saham dibanding laba bersih per saham (P/E).',
    detailed:
      'P/E 10x berarti harga saham sepuluh kali laba tahunan per saham. Angka rendah belum tentu murah: periksa apakah labanya stabil dan bandingkan dengan perusahaan sejenis.',
  },
  pbRatio: {
    short: 'Harga saham dibanding aset bersih per saham dalam laporan keuangan (P/B).',
    detailed:
      'Aset bersih adalah aset perusahaan setelah dikurangi utang. P/B 2x berarti harga saham dua kali aset bersih per saham menurut laporan keuangan, bukan harga jual seluruh asetnya.',
  },
  bandarmology: {
    short: 'Porsi pembelian dan penjualan melalui broker terbesar.',
    detailed:
      'CR3 adalah porsi transaksi melalui 3 broker terbesar; CR5 memakai 5 broker. Porsi beli dan jual dibandingkan untuk melihat pola transaksi. Data ini tidak menunjukkan siapa semua nasabah broker tersebut.',
  },
  divergence: {
    short: 'Perbandingan isi berita dengan perubahan harga saham.',
    detailed:
      'RASI mencari berita positif yang belum diikuti kenaikan harga besar, atau berita negatif yang belum diikuti penurunan besar. Perbedaan ini perlu diperiksa; harga belum tentu akan mengikuti berita.',
  },
  insider: {
    short: 'Laporan jual beli saham oleh pengurus dan pemegang saham pengendali.',
    detailed:
      'Lihat siapa yang membeli atau menjual, jumlah saham, serta harga transaksinya. Transaksi besar tidak otomatis menunjukkan perusahaan sedang baik atau buruk.',
  },
}

/**
 * Calculates SMA-20 for a given series of daily price rows.
 * Includes the current session; the first 19 entries have insufficient history.
 */
export function calculatePriceSma20(rows: DailyPriceRow[]): (number | null)[] {
  if (!rows || rows.length < 20) {
    return rows ? rows.map(() => null) : []
  }

  const result: (number | null)[] = []
  for (let i = 0; i < rows.length; i++) {
    if (i < 19) {
      result.push(null)
    } else {
      const window = rows.slice(i - 19, i + 1)
      const sum = window.reduce((acc, r) => acc + r.close, 0)
      result.push(sum / 20)
    }
  }
  return result
}

export interface CompositeRiskPresentation {
  score: number | null
  scoreText: string
  statusLabel: string
  shortDescription: string
  detailedDescription: string
  variant: 'low' | 'moderate' | 'high' | 'critical' | 'insufficient'
  colorClass: string
  badgeClass: string
  percentClamped: number
}

export function getCompositeRiskPresentation(
  score: number | null | undefined,
  rawStatus?: string | null,
): CompositeRiskPresentation {
  if (score === null || score === undefined || !Number.isFinite(score)) {
    return {
      score: null,
      scoreText: '—',
      statusLabel: 'Data belum cukup',
      shortDescription: 'Membutuhkan riwayat data lengkap untuk kalkulasi risiko.',
      detailedDescription:
        'Skor Komposit Risiko menggabungkan 4 pilar: fundamental keuangan, aktivitas transaksi broker, respon harga terhadap berita, dan transaksi orang dalam (insider).',
      variant: 'insufficient',
      colorClass: 'text-[var(--rasi-muted)]',
      badgeClass: 'bg-[var(--rasi-muted-bg)] text-[var(--rasi-muted)] border-[var(--border-subtle)]',
      percentClamped: 0,
    }
  }

  const rounded = Math.round(score)
  const clamped = Math.max(0, Math.min(100, rounded))

  if (rounded > 75 || rawStatus === 'CRITICAL') {
    return {
      score: rounded,
      scoreText: `${rounded}/100`,
      statusLabel: 'Kritis',
      shortDescription: 'Peringatan penting: indikator menunjukkan potensi risiko tajam.',
      detailedDescription:
        'Skor di atas 75 mengindikasikan adanya sinyal bahaya, seperti distribusi besar broker atau penjualan masif orang dalam.',
      variant: 'critical',
      colorClass: 'text-rose-400',
      badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      percentClamped: clamped,
    }
  }

  if (rounded > 55 || rawStatus === 'HIGH') {
    return {
      score: rounded,
      scoreText: `${rounded}/100`,
      statusLabel: 'Tinggi',
      shortDescription: 'Perlu berhati-hati: terdeteksi tekanan distribusi atau sentimen negatif.',
      detailedDescription:
        'Skor antara 56–75 menandakan peningkatan volatilitas atau aksi jual broker yang cukup menonjol.',
      variant: 'high',
      colorClass: 'text-orange-400',
      badgeClass: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
      percentClamped: clamped,
    }
  }

  if (rounded > 40 || rawStatus === 'WARNING') {
    return {
      score: rounded,
      scoreText: `${rounded}/100`,
      statusLabel: 'Sedang',
      shortDescription: 'Kondisi memerlukan observasi lebih lanjut sebelum mengambil keputusan.',
      detailedDescription:
        'Skor antara 41–55 menunjukkan dinamika pasar wajar namun ada beberapa catatan kewaspadaan.',
      variant: 'moderate',
      colorClass: 'text-amber-400',
      badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      percentClamped: clamped,
    }
  }

  return {
    score: rounded,
    scoreText: `${rounded}/100`,
    statusLabel: 'Rendah',
    shortDescription: 'Kondisi pasar wajar, belum ditemukan anomali atau risiko signifikan.',
    detailedDescription:
      'Skor 0–40 mencerminkan kondisi risiko normal. Semakin rendah skor komposit, semakin minim indikasi peringatan bahaya.',
    variant: 'low',
    colorClass: 'text-emerald-400',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    percentClamped: clamped,
  }
}

export interface VolumeSpikePresentation {
  ratio: number | null
  ratioText: string
  statusLabel: string
  shortDescription: string
  detailedDescription: string
  variant: 'low' | 'normal' | 'high' | 'extreme' | 'insufficient'
  colorClass: string
  badgeClass: string
  progressRatio: number
}

export function getVolumeSpikePresentation(
  ratio: number | null | undefined,
  rawStatus?: string | null,
): VolumeSpikePresentation {
  if (ratio === null || ratio === undefined || !Number.isFinite(ratio)) {
    return {
      ratio: null,
      ratioText: '—',
      statusLabel: 'Belum Cukup',
      shortDescription: 'Perlu minimal 21 hari perdagangan untuk menghitung rata-rata.',
      detailedDescription:
        'Volume Spike Ratio membandingkan jumlah lembar saham yang diperdagangkan hari ini dengan rata-rata 20 hari sebelumnya (SMA-20).',
      variant: 'insufficient',
      colorClass: 'text-[var(--rasi-muted)]',
      badgeClass: 'bg-[var(--rasi-muted-bg)] text-[var(--rasi-muted)] border-[var(--border-subtle)]',
      progressRatio: 0,
    }
  }

  const formattedRatio = `${ratio.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}x`

  if (ratio >= 2.5 || rawStatus === 'EXTREME') {
    return {
      ratio,
      ratioText: formattedRatio,
      statusLabel: 'Ekstrem',
      shortDescription: `Volume ${formattedRatio} rata-rata 20 hari (lonjakan luar biasa).`,
      detailedDescription:
        'Volume melonjak lebih dari 2,5× rata-rata harian. Menandakan ada katalis besar atau transaksi luar biasa.',
      variant: 'extreme',
      colorClass: 'text-purple-400',
      badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      progressRatio: Math.min(3, ratio),
    }
  }

  if (ratio >= 1.5 || rawStatus === 'HIGH') {
    return {
      ratio,
      ratioText: formattedRatio,
      statusLabel: 'Ramai',
      shortDescription: `Volume ${formattedRatio} rata-rata 20 hari (di atas kebiasaan).`,
      detailedDescription:
        'Volume mencapai 1,5×–2,4× dari rata-rata harian. Minat pasar sedang meningkat dibanding hari-hari sebelumnya.',
      variant: 'high',
      colorClass: 'text-amber-400',
      badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      progressRatio: ratio,
    }
  }

  if (ratio < 0.6 || rawStatus === 'LOW') {
    return {
      ratio,
      ratioText: formattedRatio,
      statusLabel: 'Sepi',
      shortDescription: `Volume ${formattedRatio} rata-rata 20 hari (di bawah kebiasaan).`,
      detailedDescription:
        'Volume perdagangan di bawah 60% dari rata-rata harian, menunjukkan minat pasar sedang rendah.',
      variant: 'low',
      colorClass: 'text-slate-400',
      badgeClass: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
      progressRatio: ratio,
    }
  }

  return {
    ratio,
    ratioText: formattedRatio,
    statusLabel: 'Normal',
    shortDescription: `Volume ${formattedRatio} rata-rata 20 hari (bergerak wajar).`,
    detailedDescription:
      'Volume perdagangan berada di rentang wajar (sekitar 0,6× hingga 1,4× rata-rata harian).',
    variant: 'normal',
    colorClass: 'text-sky-400',
    badgeClass: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    progressRatio: ratio,
  }
}

export interface BandarmologyPresentation {
  bandarStatus: string
  bandarLabel: string
  bandarShort: string
  bandarVariant: 'bullish' | 'strong-bullish' | 'neutral' | 'bearish' | 'strong-bearish' | 'insufficient'
  bandarColorClass: string
  bandarBadgeClass: string

  foreignStatus: string
  foreignLabel: string
  foreignShort: string
  foreignVariant: 'inflow' | 'heavy-inflow' | 'neutral' | 'outflow' | 'heavy-outflow' | 'unknown'
  foreignColorClass: string
  foreignBadgeClass: string

  shortDescription: string
  detailedDescription: string
}

export function getBandarmologyPresentation(
  bandarStatus?: string | null,
  foreignFlowStatus?: string | null,
): BandarmologyPresentation {
  const bStatus = bandarStatus || 'NEUTRAL'
  const fStatus = foreignFlowStatus || 'UNKNOWN'

  let bLabel = 'Transaksi Berimbang'
  let bShort = 'Seimbang'
  let bVariant: BandarmologyPresentation['bandarVariant'] = 'neutral'
  let bColor = 'text-[var(--rasi-muted)]'
  let bBadge = 'bg-[var(--rasi-muted-bg)] text-[var(--rasi-muted)] border-[var(--border-subtle)]'

  if (bStatus === 'BIG_ACCUMULATION') {
    bLabel = 'Akumulasi Kuat'
    bShort = 'Akumulasi Besar'
    bVariant = 'strong-bullish'
    bColor = 'text-emerald-400'
    bBadge = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
  } else if (bStatus === 'NORMAL_ACCUMULATION') {
    bLabel = 'Akumulasi Wajar'
    bShort = 'Akumulasi'
    bVariant = 'bullish'
    bColor = 'text-emerald-400'
    bBadge = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
  } else if (bStatus === 'NORMAL_DISTRIBUTION') {
    bLabel = 'Distribusi Wajar'
    bShort = 'Distribusi'
    bVariant = 'bearish'
    bColor = 'text-amber-400'
    bBadge = 'bg-amber-500/10 text-amber-400 border-amber-500/30'
  } else if (bStatus === 'BIG_DISTRIBUTION') {
    bLabel = 'Distribusi Besar'
    bShort = 'Distribusi Kuat'
    bVariant = 'strong-bearish'
    bColor = 'text-rose-400'
    bBadge = 'bg-rose-500/10 text-rose-400 border-rose-500/30'
  } else if (bStatus === 'INSUFFICIENT_DATA') {
    bLabel = 'Data Belum Cukup'
    bShort = 'Belum Cukup'
    bVariant = 'insufficient'
  }

  let fLabel = 'Netral (Berimbang)'
  let fShort = 'Netral'
  let fVariant: BandarmologyPresentation['foreignVariant'] = 'neutral'
  let fColor = 'text-[var(--rasi-muted)]'
  let fBadge = 'bg-[var(--rasi-muted-bg)] text-[var(--rasi-muted)] border-[var(--border-subtle)]'

  if (fStatus === 'HEAVY_INFLOW') {
    fLabel = 'Beli Masif'
    fShort = 'Inflow Besar'
    fVariant = 'heavy-inflow'
    fColor = 'text-emerald-400'
    fBadge = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
  } else if (fStatus === 'INFLOW') {
    fLabel = 'Beli Bersih'
    fShort = 'Inflow'
    fVariant = 'inflow'
    fColor = 'text-emerald-400'
    fBadge = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
  } else if (fStatus === 'OUTFLOW') {
    fLabel = 'Jual Bersih'
    fShort = 'Outflow'
    fVariant = 'outflow'
    fColor = 'text-amber-400'
    fBadge = 'bg-amber-500/10 text-amber-400 border-amber-500/30'
  } else if (fStatus === 'HEAVY_OUTFLOW') {
    fLabel = 'Jual Masif'
    fShort = 'Outflow Besar'
    fVariant = 'heavy-outflow'
    fColor = 'text-rose-400'
    fBadge = 'bg-rose-500/10 text-rose-400 border-rose-500/30'
  } else if (fStatus === 'UNKNOWN') {
    fLabel = 'Belum Diketahui'
    fShort = '—'
    fVariant = 'unknown'
  }

  let shortDesc = 'Kekuatan beli dan jual antar pelaku pasar berada di posisi wajar.'
  if (
    (bVariant === 'strong-bullish' || bVariant === 'bullish') &&
    (fVariant === 'heavy-inflow' || fVariant === 'inflow')
  ) {
    shortDesc = 'Broker utama dan investor asing kompak mengumpulkan saham (akumulasi ganda).'
  } else if (bVariant === 'strong-bullish' || bVariant === 'bullish') {
    shortDesc = 'Broker utama terpantau mengumpulkan saham lebih dominan dibanding penjualan.'
  } else if (fVariant === 'heavy-inflow' || fVariant === 'inflow') {
    shortDesc = 'Aliran dana investor asing mendominasi pembelian saham.'
  } else if (
    (bVariant === 'strong-bearish' || bVariant === 'bearish') &&
    (fVariant === 'heavy-outflow' || fVariant === 'outflow')
  ) {
    shortDesc = 'Broker utama dan investor asing kompak melepas kepemilikan saham.'
  } else if (bVariant === 'strong-bearish' || bVariant === 'bearish') {
    shortDesc = 'Terpantau tekanan jual lebih tinggi dari broker-broker utama.'
  } else if (fVariant === 'heavy-outflow' || fVariant === 'outflow') {
    shortDesc = 'Investor asing mencatatkan pelepasan saham bersih.'
  }

  const detailedDesc =
    'Analisis Bandarmologi mengukur konsentrasi transaksi oleh broker teratas serta aliran modal investor asing (net foreign flow) untuk membaca arah pelaku pasar besar.'

  return {
    bandarStatus: bStatus,
    bandarLabel: bLabel,
    bandarShort: bShort,
    bandarVariant: bVariant,
    bandarColorClass: bColor,
    bandarBadgeClass: bBadge,
    foreignStatus: fStatus,
    foreignLabel: fLabel,
    foreignShort: fShort,
    foreignVariant: fVariant,
    foreignColorClass: fColor,
    foreignBadgeClass: fBadge,
    shortDescription: shortDesc,
    detailedDescription: detailedDesc,
  }
}

export function getQuickMarketSummary(params: {
  ticker?: string
  score?: number | null
  scoreStatus?: string | null
  spikeRatio?: number | null
  bandarStatus?: string | null
  foreignFlowStatus?: string | null
}): string {
  const { ticker, score, scoreStatus, spikeRatio, bandarStatus, foreignFlowStatus } = params

  const risk = getCompositeRiskPresentation(score, scoreStatus)
  const vol = getVolumeSpikePresentation(spikeRatio)
  const bandar = getBandarmologyPresentation(bandarStatus, foreignFlowStatus)

  const subject = ticker ? `Saham ${ticker}` : 'Kondisi pasar'

  let riskPhrase = 'tingkat risiko belum dapat dihitung'
  if (risk.score !== null) {
    if (risk.variant === 'low') riskPhrase = `risiko tergolong rendah (${risk.score}/100)`
    else if (risk.variant === 'moderate') riskPhrase = `risiko berada di tingkat sedang (${risk.score}/100)`
    else if (risk.variant === 'high') riskPhrase = `risiko terindikasi tinggi (${risk.score}/100)`
    else if (risk.variant === 'critical') riskPhrase = `risiko berada di tingkat sangat tinggi (${risk.score}/100)`
  }

  let volPhrase = 'aktivitas transaksi wajar'
  if (vol.ratio !== null) {
    if (vol.variant === 'extreme') volPhrase = `terjadi lonjakan transaksi luar biasa (${vol.ratioText})`
    else if (vol.variant === 'high') volPhrase = `transaksi mengalami peningkatan (${vol.ratioText})`
    else if (vol.variant === 'low') volPhrase = `transaksi cenderung sepi (${vol.ratioText})`
    else volPhrase = `volume transaksi bergerak wajar (${vol.ratioText})`
  }

  let flowPhrase = 'aliran modal seimbang'
  if (
    (bandar.bandarVariant === 'strong-bullish' || bandar.bandarVariant === 'bullish') &&
    (bandar.foreignVariant === 'heavy-inflow' || bandar.foreignVariant === 'inflow')
  ) {
    flowPhrase = 'didukung akumulasi kuat broker dan aliran dana masuk asing yang solid'
  } else if (bandar.bandarVariant === 'strong-bullish' || bandar.bandarVariant === 'bullish') {
    flowPhrase = `terlihat ${bandar.bandarLabel.toLowerCase()} oleh broker utama`
  } else if (bandar.foreignVariant === 'heavy-inflow' || bandar.foreignVariant === 'inflow') {
    flowPhrase = `didukung pembelian bersih investor asing (${bandar.foreignLabel.toLowerCase()})`
  } else if (
    (bandar.bandarVariant === 'strong-bearish' || bandar.bandarVariant === 'bearish') &&
    (bandar.foreignVariant === 'heavy-outflow' || bandar.foreignVariant === 'outflow')
  ) {
    flowPhrase = 'namun terdapat tekanan jual ganda dari broker utama dan asing'
  } else if (bandar.bandarVariant === 'strong-bearish' || bandar.bandarVariant === 'bearish') {
    flowPhrase = `disertai indikasi ${bandar.bandarLabel.toLowerCase()}`
  } else if (bandar.foreignVariant === 'heavy-outflow' || bandar.foreignVariant === 'outflow') {
    flowPhrase = 'disertai pelepasan dana oleh investor asing'
  }

  return `${subject} menunjukkan ${riskPhrase} dengan ${volPhrase}, serta ${flowPhrase}.`
}


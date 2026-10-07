'use client'

import React, { useState } from 'react'

import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  ChevronRight,
  HelpCircle,
  Info,
  Minus,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react'

import { Dialog } from '@/components/ui'
import {
  formatCurrencyIdr,
  getBandarmologyPresentation,
  getCompositeRiskPresentation,
  getQuickMarketSummary,
  getVolumeSpikePresentation,
} from '@/lib/presentation/stock'

export interface MarketMetricsBarProps {
  ticker?: string
  price: number | null
  priceChangeFraction: number | null
  priceDate?: string | null
  compositeScore?: number | null
  compositeStatus?: string | null
  volumeSpikeRatio?: number | null
  formattedVolumeRatio?: string | null
  volumeStatus?: string | null
  bandarStatus?: string | null
  foreignFlowStatus?: string | null
  className?: string
}

export function MarketMetricsBar({
  ticker,
  price,
  priceChangeFraction,
  priceDate,
  compositeScore,
  compositeStatus,
  volumeSpikeRatio,
  formattedVolumeRatio,
  volumeStatus,
  bandarStatus,
  foreignFlowStatus,
  className = '',
}: MarketMetricsBarProps) {
  const [guideModalOpen, setGuideModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'risk' | 'volume' | 'bandar'>('all')

  const riskPres = getCompositeRiskPresentation(compositeScore, compositeStatus)
  const volPres = getVolumeSpikePresentation(volumeSpikeRatio, volumeStatus)
  const bandarPres = getBandarmologyPresentation(bandarStatus, foreignFlowStatus)

  const quickSummary = getQuickMarketSummary({
    ticker,
    score: compositeScore,
    scoreStatus: compositeStatus,
    spikeRatio: volumeSpikeRatio,
    bandarStatus,
    foreignFlowStatus,
  })

  // Format Price Change
  const isPriceUp = priceChangeFraction !== null && priceChangeFraction > 0
  const isPriceDown = priceChangeFraction !== null && priceChangeFraction < 0
  const pricePctFormatted =
    priceChangeFraction !== null ? `${(priceChangeFraction * 100).toFixed(2)}%` : '—'

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Smart Human-Friendly Summary Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3.5 shadow-sm sm:p-4">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[var(--rasi-primary)]/10 text-[var(--rasi-primary)]">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold tracking-wider text-[var(--rasi-primary)] uppercase">
                  Ringkasan Cepat
                </span>
                <span className="text-[10px] font-medium text-[var(--rasi-muted)]">
                  Analisis Multi-Pilar
                </span>
              </div>
              <p className="mt-0.5 text-xs font-medium leading-relaxed text-[var(--rasi-text)] sm:text-sm">
                {quickSummary}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setActiveTab('all')
              setGuideModalOpen(true)
            }}
            className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--rasi-text)] transition-colors hover:border-[var(--rasi-primary)] hover:text-[var(--rasi-primary)] sm:self-center"
          >
            <HelpCircle className="h-3.5 w-3.5 text-[var(--rasi-primary)]" />
            <span>Panduan Membaca</span>
          </button>
        </div>
      </div>

      {/* 4 Primary Market Metric Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Harga Pasar Terkini */}
        <div className="flex flex-col justify-between rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 shadow-sm transition-all hover:border-[var(--rasi-border)]">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-[var(--rasi-muted)] uppercase">
                Harga Pasar
              </span>
              <span className="text-[10px] font-medium text-[var(--rasi-muted)]">
                Real-time
              </span>
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-black text-[var(--rasi-text)]">
                {price != null ? `Rp ${price.toLocaleString('id-ID')}` : '—'}
              </span>
              {priceChangeFraction !== null && (
                <span
                  className={`inline-flex items-center gap-0.5 font-mono text-xs font-bold ${
                    isPriceUp
                      ? 'text-emerald-400'
                      : isPriceDown
                        ? 'text-rose-400'
                        : 'text-[var(--rasi-muted)]'
                  }`}
                >
                  {isPriceUp ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : isPriceDown ? (
                    <ArrowDownRight className="h-3 w-3" />
                  ) : null}
                  {isPriceUp ? '+' : ''}
                  {pricePctFormatted}
                </span>
              )}
            </div>
          </div>

          <div className="mt-3 border-t border-[var(--border-subtle)] pt-2 text-[11px] text-[var(--rasi-muted)]">
            Data Bursa: {priceDate || 'Sesi Terkini'}
          </div>
        </div>

        {/* Card 2: Skor Komposit Risiko */}
        <div className="flex flex-col justify-between rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 shadow-sm transition-all hover:border-[var(--rasi-border)]">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold tracking-wider text-[var(--rasi-muted)] uppercase">
                  Tingkat Risiko
                </span>
                <button
                  type="button"
                  aria-label="Penjelasan Tingkat Risiko"
                  onClick={() => {
                    setActiveTab('risk')
                    setGuideModalOpen(true)
                  }}
                  className="text-[var(--rasi-muted)] hover:text-[var(--rasi-primary)]"
                >
                  <Info className="h-3 w-3" />
                </button>
              </div>
              <span className={`text-xs font-bold ${riskPres.colorClass}`}>
                {riskPres.statusLabel}
              </span>
            </div>

            <div className="mt-2 flex items-baseline gap-1.5">
              <span className={`font-mono text-2xl font-black ${riskPres.colorClass}`}>
                {riskPres.score !== null ? riskPres.score : '—'}
              </span>
              <span className="font-mono text-xs text-[var(--rasi-muted)]">/ 100</span>
              <span className="ml-auto text-[11px] text-[var(--rasi-muted)]">
                {riskPres.score !== null && riskPres.score <= 40 ? 'Kondisi Aman' : 'Perlu Pantauan'}
              </span>
            </div>

            {/* Visual Risk Gauge Meter (0 to 100) */}
            <div className="mt-2.5">
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-800">
                {/* 3 color zones: Green (0-40), Yellow (41-70), Red (71-100) */}
                <div className="absolute inset-0 flex">
                  <div className="h-full w-[40%] bg-emerald-500/30" />
                  <div className="h-full w-[30%] bg-amber-500/30" />
                  <div className="h-full w-[30%] bg-rose-500/30" />
                </div>
                {/* Active Score Marker Bar */}
                {riskPres.score !== null && (
                  <div
                    className={`absolute top-0 bottom-0 left-0 transition-all duration-500 ${
                      riskPres.variant === 'low'
                        ? 'bg-emerald-400'
                        : riskPres.variant === 'moderate'
                          ? 'bg-amber-400'
                          : riskPres.variant === 'high'
                            ? 'bg-orange-400'
                            : 'bg-rose-400'
                    }`}
                    style={{ width: `${riskPres.percentClamped}%` }}
                  />
                )}
              </div>
              <div className="mt-1 flex justify-between text-[9px] font-medium text-[var(--rasi-muted)]">
                <span>0 (Aman)</span>
                <span>40 (Wajar)</span>
                <span>75 (Tinggi)</span>
                <span>100</span>
              </div>
            </div>
          </div>

          <div className="mt-2 border-t border-[var(--border-subtle)] pt-2 text-[11px] text-[var(--rasi-muted)]">
            {riskPres.shortDescription}
          </div>
        </div>

        {/* Card 3: Volume Spike Ratio */}
        <div className="flex flex-col justify-between rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 shadow-sm transition-all hover:border-[var(--rasi-border)]">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold tracking-wider text-[var(--rasi-muted)] uppercase">
                  Aktivitas Volume
                </span>
                <button
                  type="button"
                  aria-label="Penjelasan Aktivitas Volume"
                  onClick={() => {
                    setActiveTab('volume')
                    setGuideModalOpen(true)
                  }}
                  className="text-[var(--rasi-muted)] hover:text-[var(--rasi-primary)]"
                >
                  <Info className="h-3 w-3" />
                </button>
              </div>
              <span className={`text-xs font-bold ${volPres.colorClass}`}>
                {volPres.statusLabel}
              </span>
            </div>

            <div className="mt-2 flex items-baseline gap-1.5">
              <span className={`font-mono text-2xl font-black ${volPres.colorClass}`}>
                {volPres.ratio !== null
                  ? `${volPres.ratio.toFixed(2)}x`
                  : formattedVolumeRatio || '—'}
              </span>
              <span className="text-[11px] text-[var(--rasi-muted)]">vs rata-rata 20 hari</span>
            </div>

            {/* Visual Volume Ratio Meter */}
            <div className="mt-2.5">
              <div className="relative h-2 w-full rounded-full bg-slate-800">
                {/* Baseline 1.0x marker (at ~33% position of a 0-3x scale) */}
                <div
                  className="absolute top-[-3px] bottom-[-3px] w-0.5 bg-slate-400 z-10"
                  style={{ left: '33.33%' }}
                  title="Baseline 1.0x Rata-rata"
                />
                {/* Spike 2.0x threshold marker (at ~66% position) */}
                <div
                  className="absolute top-[-3px] bottom-[-3px] w-0.5 bg-amber-400/80 z-10"
                  style={{ left: '66.66%' }}
                  title="Ambang Lonjakan 2.0x"
                />
                {/* Fill bar */}
                {volPres.ratio !== null && (
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      volPres.variant === 'extreme'
                        ? 'bg-purple-400'
                        : volPres.variant === 'high'
                          ? 'bg-amber-400'
                          : volPres.variant === 'low'
                            ? 'bg-slate-500'
                            : 'bg-sky-400'
                    }`}
                    style={{
                      width: `${Math.min(100, Math.max(5, (volPres.progressRatio / 3) * 100))}%`,
                    }}
                  />
                )}
              </div>
              <div className="mt-1 flex justify-between text-[9px] font-medium text-[var(--rasi-muted)]">
                <span>0x</span>
                <span className="text-slate-400">1.0x (Normal)</span>
                <span className="text-amber-400">2.0x (Lonjakan)</span>
                <span>3.0x+</span>
              </div>
            </div>
          </div>

          <div className="mt-2 border-t border-[var(--border-subtle)] pt-2 text-[11px] text-[var(--rasi-muted)]">
            {volPres.shortDescription}
          </div>
        </div>

        {/* Card 4: Arus Pembeli Besar (Bandarmologi & Asing) */}
        <div className="flex flex-col justify-between rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 shadow-sm transition-all hover:border-[var(--rasi-border)]">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold tracking-wider text-[var(--rasi-muted)] uppercase">
                  Arus Pembeli Besar
                </span>
                <button
                  type="button"
                  aria-label="Penjelasan Arus Pembeli Besar"
                  onClick={() => {
                    setActiveTab('bandar')
                    setGuideModalOpen(true)
                  }}
                  className="text-[var(--rasi-muted)] hover:text-[var(--rasi-primary)]"
                >
                  <Info className="h-3 w-3" />
                </button>
              </div>
              <span className="text-[10px] font-medium text-[var(--rasi-muted)]">
                Broker & Asing
              </span>
            </div>

            {/* Broker & Foreign Flow Rows */}
            <div className="mt-2 space-y-1.5">
              <div className="flex items-center justify-between rounded-xl bg-[var(--surface-muted)] px-2.5 py-1.5">
                <span className="text-[11px] font-medium text-[var(--rasi-muted)]">Broker:</span>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-bold ${bandarPres.bandarColorClass}`}
                >
                  {bandarPres.bandarVariant === 'strong-bullish' ||
                  bandarPres.bandarVariant === 'bullish' ? (
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  ) : bandarPres.bandarVariant === 'strong-bearish' ||
                    bandarPres.bandarVariant === 'bearish' ? (
                    <ArrowDownRight className="h-3.5 w-3.5" />
                  ) : (
                    <Minus className="h-3 w-3" />
                  )}
                  {bandarPres.bandarLabel}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-[var(--surface-muted)] px-2.5 py-1.5">
                <span className="text-[11px] font-medium text-[var(--rasi-muted)]">Asing:</span>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-bold ${bandarPres.foreignColorClass}`}
                >
                  {bandarPres.foreignVariant === 'heavy-inflow' ||
                  bandarPres.foreignVariant === 'inflow' ? (
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  ) : bandarPres.foreignVariant === 'heavy-outflow' ||
                    bandarPres.foreignVariant === 'outflow' ? (
                    <ArrowDownRight className="h-3.5 w-3.5" />
                  ) : (
                    <Minus className="h-3 w-3" />
                  )}
                  {bandarPres.foreignLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-2 border-t border-[var(--border-subtle)] pt-2 text-[11px] text-[var(--rasi-muted)]">
            {bandarPres.shortDescription}
          </div>
        </div>
      </div>

      {/* Educational Guide Dialog */}
      <Dialog
        open={guideModalOpen}
        onClose={() => setGuideModalOpen(false)}
        title="Panduan Membaca Indikator Pasar"
        description="Pelajari cara memahami arti skor risiko, rasio volume, dan aliran dana pembeli besar untuk keputusan investasi yang lebih cerdas."
        maxWidth="lg"
      >
        <div className="space-y-4 py-2">
          {/* Quick tab switcher inside modal */}
          <div className="flex flex-wrap gap-1.5 border-b border-[var(--border-subtle)] pb-3">
            {[
              { id: 'all', label: 'Semua Indikator' },
              { id: 'risk', label: '1. Tingkat Risiko (Skor)' },
              { id: 'volume', label: '2. Aktivitas Volume' },
              { id: 'bandar', label: '3. Broker & Asing' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[var(--rasi-primary)] text-slate-900'
                    : 'bg-[var(--surface-muted)] text-[var(--rasi-muted)] hover:text-[var(--rasi-text)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Section 1: Skor Komposit Risiko */}
          {(activeTab === 'all' || activeTab === 'risk') && (
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-muted)]/50 p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <h4 className="text-sm font-bold text-[var(--rasi-text)]">
                  Skor Komposit Risiko (Skala 0 – 100)
                </h4>
              </div>
              <p className="mt-1.5 text-xs text-[var(--rasi-muted)] leading-relaxed">
                Skor ini menggabungkan 4 aspek kunci: fundamental emiten, pergerakan transaksi broker,
                kesesuaian respon harga terhadap berita, dan transaksi orang dalam (insider).
                <strong className="text-[var(--rasi-text)]"> Semakin rendah angkanya, semakin minim risiko anomali bahaya.</strong>
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-2.5">
                  <span className="font-bold text-emerald-400">0 – 40: Rendah (Wajar)</span>
                  <p className="mt-0.5 text-[11px] text-[var(--rasi-muted)]">Kondisi stabil & normal.</p>
                </div>
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-2.5">
                  <span className="font-bold text-amber-400">41 – 55: Sedang (Waspada)</span>
                  <p className="mt-0.5 text-[11px] text-[var(--rasi-muted)]">Perlu observasi lebih lanjut.</p>
                </div>
                <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-2.5">
                  <span className="font-bold text-orange-400">56 – 75: Tinggi (Hati-hati)</span>
                  <p className="mt-0.5 text-[11px] text-[var(--rasi-muted)]">Ada tekanan jual/distribusi.</p>
                </div>
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-2.5">
                  <span className="font-bold text-rose-400">&gt; 75: Bahaya (Kritis)</span>
                  <p className="mt-0.5 text-[11px] text-[var(--rasi-muted)]">Distribusi masif / risiko anjlok.</p>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Volume Spike Ratio */}
          {(activeTab === 'all' || activeTab === 'volume') && (
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-muted)]/50 p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400">
                  <Activity className="h-4 w-4" />
                </div>
                <h4 className="text-sm font-bold text-[var(--rasi-text)]">
                  Aktivitas Volume (Rasio vs Rata-rata 20 Hari)
                </h4>
              </div>
              <p className="mt-1.5 text-xs text-[var(--rasi-muted)] leading-relaxed">
                Membandingkan volume transaksi hari ini dengan rata-rata 20 hari bursa sebelumnya (SMA-20).
                Contoh: <strong className="text-[var(--rasi-text)]">1,25×</strong> artinya volume hari ini 25% lebih tinggi dari hari biasa (masih dalam rentang wajar).
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                <div className="rounded-xl border border-slate-500/20 bg-slate-500/5 p-2.5">
                  <span className="font-bold text-slate-300">&lt; 0,6× : Sepi</span>
                  <p className="mt-0.5 text-[11px] text-[var(--rasi-muted)]">Minat pasar sedang lesu.</p>
                </div>
                <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-2.5">
                  <span className="font-bold text-sky-400">0,6× – 1,4× : Normal</span>
                  <p className="mt-0.5 text-[11px] text-[var(--rasi-muted)]">Aktivitas pasar wajar.</p>
                </div>
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-2.5">
                  <span className="font-bold text-amber-400">1,5× – 2,4× : Meningkat</span>
                  <p className="mt-0.5 text-[11px] text-[var(--rasi-muted)]">Minat pasar mulai ramai.</p>
                </div>
                <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-2.5">
                  <span className="font-bold text-purple-400">&ge; 2,5× : Lonjakan Ekstrem</span>
                  <p className="mt-0.5 text-[11px] text-[var(--rasi-muted)]">Katalis besar / breakout.</p>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Arus Bandarmologi & Investor Asing */}
          {(activeTab === 'all' || activeTab === 'bandar') && (
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-muted)]/50 p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Users className="h-4 w-4" />
                </div>
                <h4 className="text-sm font-bold text-[var(--rasi-text)]">
                  Arus Bandarmologi & Investor Asing
                </h4>
              </div>
              <p className="mt-1.5 text-xs text-[var(--rasi-muted)] leading-relaxed">
                Membaca jejak pelaku pasar bermodal besar (institusi / broker teratas / pemodal asing):
              </p>
              <div className="mt-3 grid grid-cols-1 gap-2.5 text-xs sm:grid-cols-2">
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                    <ArrowUpRight className="h-4 w-4" />
                    <span>Akumulasi & Inflow Asing (Beli)</span>
                  </div>
                  <p className="mt-1 text-[11px] text-[var(--rasi-muted)]">
                    Broker utama dan/atau asing mengumpulkan saham secara bertahap atau agresif. Sinyal positif untuk pergerakan harga.
                  </p>
                </div>
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3">
                  <div className="flex items-center gap-1.5 font-bold text-rose-400">
                    <ArrowDownRight className="h-4 w-4" />
                    <span>Distribusi & Outflow Asing (Jual)</span>
                  </div>
                  <p className="mt-1 text-[11px] text-[var(--rasi-muted)]">
                    Broker utama dan/atau asing melepas kepemilikan saham mereka ke pasar reguler. Sinyal peringatan potensi penurunan harga.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Dialog>
    </div>
  )
}

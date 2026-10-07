'use client'

import React, { useMemo, useState } from 'react'

import Link from 'next/link'

import {
  ArrowRight,
  ArrowRightLeft,
  Building2,
  ChevronRight,
  Globe2,
  HelpCircle,
  Layers,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react'

import { ResearchJourneyStepper } from '@/components/ResearchJourneyStepper'
import type { BandarmologyIndicator } from '@/lib/contracts/analysis'
import type { BrokerRegistryEntry, BrokerRow, BrokerSummaryData } from '@/lib/contracts/market'
import { formatCurrencyIdr } from '@/lib/presentation/stock'

export interface BrokerAccumulationTableProps {
  ticker: string
  bandarmology: BandarmologyIndicator
  brokerSummary?: BrokerSummaryData | null
  brokerRegistry?: Record<string, BrokerRegistryEntry> | null
  flow?: boolean
  showStepper?: boolean
}

export function BrokerAccumulationTable({
  ticker,
  bandarmology,
  brokerSummary,
  brokerRegistry = {},
  flow = false,
  showStepper = true,
}: BrokerAccumulationTableProps) {
  const cleanTicker = ticker.trim().toUpperCase()
  const [viewMode, setViewMode] = useState<'comparison' | 'all'>('comparison')
  const [sortBy, setSortBy] = useState<'netVal' | 'buyVal' | 'sellVal'>('netVal')

  // Extract latest date broker rows
  const latestSummaryEntry = brokerSummary?.data?.[0]
  const rawRows: BrokerRow[] = latestSummaryEntry?.summary ?? []

  // Enhanced broker data list
  const enrichedRows = useMemo(() => {
    if (!rawRows || rawRows.length === 0) {
      // Fallback to topBuyers and topSellers from bandarmology if rawRows empty
      return []
    }

    return rawRows.map((r) => {
      const code = r.broker_code?.toUpperCase() ?? '??'
      const meta = brokerRegistry?.[code]
      const bval = r.bval ?? 0
      const sval = r.sval ?? 0
      const blot = r.blot ?? 0
      const slot = r.slot ?? 0
      const nval = Number.isFinite(r.nval) ? r.nval! : bval - sval
      const nlot = Number.isFinite(r.nlot) ? r.nlot! : blot - slot

      const bavg =
        Number.isFinite(r.bavg_per_share) && r.bavg_per_share! > 0
          ? r.bavg_per_share!
          : blot > 0
            ? bval / (blot * 100)
            : 0

      const savg =
        Number.isFinite(r.savg_per_share) && r.savg_per_share! > 0
          ? r.savg_per_share!
          : slot > 0
            ? sval / (slot * 100)
            : 0

      return {
        code,
        name: meta?.name || code,
        isForeign: meta?.is_foreign ?? false,
        cohort: meta?.cohort || 'unknown',
        bval,
        sval,
        blot,
        slot,
        nval,
        nlot,
        bavg: Math.round(bavg),
        savg: Math.round(savg),
      }
    })
  }, [rawRows, brokerRegistry])

  // Top Net Buyers (Akumulasi)
  const netBuyers = useMemo(() => {
    if (enrichedRows.length > 0) {
      return [...enrichedRows]
        .filter((r) => r.nval > 0)
        .sort((a, b) => b.nval - a.nval)
        .slice(0, 8)
    }
    // Fallback to bandarmology topBuyers
    return (bandarmology.topBuyers ?? []).map((b) => ({
      code: b.code,
      name: b.name || b.code,
      isForeign: b.isForeign,
      cohort: b.cohort,
      bval: b.value,
      sval: 0,
      blot: b.lot,
      slot: 0,
      nval: b.netValue,
      nlot: b.lot,
      bavg: b.avgPrice,
      savg: 0,
    }))
  }, [enrichedRows, bandarmology.topBuyers])

  // Top Net Sellers (Distribusi)
  const netSellers = useMemo(() => {
    if (enrichedRows.length > 0) {
      return [...enrichedRows]
        .filter((r) => r.nval < 0)
        .sort((a, b) => a.nval - b.nval)
        .slice(0, 8)
    }
    // Fallback to bandarmology topSellers
    return (bandarmology.topSellers ?? []).map((s) => ({
      code: s.code,
      name: s.name || s.code,
      isForeign: s.isForeign,
      cohort: s.cohort,
      bval: 0,
      sval: s.value,
      blot: 0,
      slot: s.lot,
      nval: s.netValue,
      nlot: -s.lot,
      bavg: 0,
      savg: s.avgPrice,
    }))
  }, [enrichedRows, bandarmology.topSellers])

  // Smart Money vs Retail Comparison
  const flowStats = useMemo(() => {
    let instNet = 0
    let retailNet = 0
    let foreignNet = bandarmology.netForeignVal ?? 0

    if (enrichedRows.length > 0) {
      for (const r of enrichedRows) {
        if (r.cohort === 'institutional') instNet += r.nval
        if (r.cohort === 'retail') retailNet += r.nval
      }
    } else {
      for (const b of netBuyers) {
        if (b.cohort === 'institutional') instNet += b.nval
        if (b.cohort === 'retail') retailNet += b.nval
      }
      for (const s of netSellers) {
        if (s.cohort === 'institutional') instNet += s.nval
        if (s.cohort === 'retail') retailNet += s.nval
      }
    }

    return { instNet, retailNet, foreignNet }
  }, [enrichedRows, netBuyers, netSellers, bandarmology.netForeignVal])

  const formatShortBillions = (val: number) => {
    const abs = Math.abs(val)
    if (abs >= 1_000_000_000) {
      return `${(val / 1_000_000_000).toFixed(2)} M`
    }
    if (abs >= 1_000_000) {
      return `${(val / 1_000_000).toFixed(1)} Jt`
    }
    return val.toLocaleString('id-ID')
  }

  const formatLot = (lot: number) => {
    return Math.abs(lot).toLocaleString('id-ID')
  }

  return (
    <div className="space-y-6">
      {/* 1. Guided Stepper (Tahap 2 Aktif jika dalam alur discover) */}
      {showStepper && <ResearchJourneyStepper currentStep={2} ticker={cleanTicker} />}

      {/* 2. Header & Smart Money Cohort Summary */}
      <div className="space-y-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 shadow-[var(--rasi-card-shadow)] sm:p-6">
        <div className="flex flex-col justify-between gap-3 border-b border-[var(--border-subtle)] pb-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[var(--rasi-primary)]" />
              <h3 className="text-base font-bold text-[var(--rasi-text)] sm:text-lg">
                Tabel Perbandingan Akumulasi vs Distribusi Broker: {cleanTicker}
              </h3>
            </div>
            <p className="mt-1 text-xs text-[var(--rasi-muted)]">
              Perbandingan pihak yang melakukan pembelian bersih (akumulasi) versus pihak yang
              melakukan penjualan bersih (distribusi).
              {latestSummaryEntry?.date && (
                <span className="ml-1 font-medium text-[var(--rasi-text)]">
                  • Tanggal: {latestSummaryEntry.date}
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-1.5 self-start rounded-xl bg-[var(--rasi-muted-bg)] p-1 text-xs font-semibold sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('comparison')}
              className={`rounded-lg px-3 py-1.5 transition-colors ${
                viewMode === 'comparison'
                  ? 'bg-[var(--surface-card)] text-[var(--rasi-primary)] shadow-xs'
                  : 'text-[var(--rasi-muted)] hover:text-[var(--rasi-text)]'
              }`}
            >
              Perbandingan Akumulasi / Distribusi
            </button>
            {enrichedRows.length > 0 && (
              <button
                type="button"
                onClick={() => setViewMode('all')}
                className={`rounded-lg px-3 py-1.5 transition-colors ${
                  viewMode === 'all'
                    ? 'bg-[var(--surface-card)] text-[var(--rasi-primary)] shadow-xs'
                    : 'text-[var(--rasi-muted)] hover:text-[var(--rasi-text)]'
                }`}
              >
                Semua Broker ({enrichedRows.length})
              </button>
            )}
          </div>
        </div>

        {/* 3 Smart Money Insight Cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="space-y-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)]/50 p-4">
            <span className="flex items-center gap-1.5 text-xs text-[var(--rasi-muted)]">
              <Building2 className="h-3.5 w-3.5 text-[var(--rasi-muted)]" />
              Arus Bersih Institusi
            </span>
            <div className="flex items-baseline gap-2">
              <span
                className={`font-mono text-lg font-bold ${
                  flowStats.instNet >= 0 ? 'text-emerald-500' : 'text-rose-500'
                }`}
              >
                {flowStats.instNet >= 0 ? '+' : ''}
                {formatShortBillions(flowStats.instNet)}
              </span>
              <span className="text-[11px] text-[var(--rasi-muted)]">
                {flowStats.instNet >= 0 ? 'Net Akumulasi' : 'Net Distribusi'}
              </span>
            </div>
          </div>

          <div className="space-y-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)]/50 p-4">
            <span className="flex items-center gap-1.5 text-xs text-[var(--rasi-muted)]">
              <Users className="h-3.5 w-3.5 text-[var(--rasi-muted)]" />
              Arus Bersih Ritel
            </span>
            <div className="flex items-baseline gap-2">
              <span
                className={`font-mono text-lg font-bold ${
                  flowStats.retailNet >= 0 ? 'text-emerald-500' : 'text-rose-500'
                }`}
              >
                {flowStats.retailNet >= 0 ? '+' : ''}
                {formatShortBillions(flowStats.retailNet)}
              </span>
              <span className="text-[11px] text-[var(--rasi-muted)]">
                {flowStats.retailNet >= 0 ? 'Net Akumulasi' : 'Net Distribusi'}
              </span>
            </div>
          </div>

          <div className="space-y-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)]/50 p-4">
            <span className="flex items-center gap-1.5 text-xs text-[var(--rasi-muted)]">
              <Globe2 className="h-3.5 w-3.5 text-[var(--rasi-muted)]" />
              Arus Bersih Investor Asing
            </span>
            <div className="flex items-baseline gap-2">
              <span
                className={`font-mono text-lg font-bold ${
                  flowStats.foreignNet >= 0 ? 'text-emerald-500' : 'text-rose-500'
                }`}
              >
                {flowStats.foreignNet >= 0 ? '+' : ''}
                {formatShortBillions(flowStats.foreignNet)}
              </span>
              <span className="text-[11px] text-[var(--rasi-muted)]">
                {flowStats.foreignNet >= 0 ? 'Foreign Inflow' : 'Foreign Outflow'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Comparative View */}
      {viewMode === 'comparison' && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* SISI KIRI: TOP BROKER AKUMULASI (NET BUY) */}
          <div className="overflow-hidden rounded-2xl border border-emerald-500/30 bg-[var(--surface-card)] shadow-[var(--rasi-card-shadow)]">
            <div className="flex items-center justify-between border-b border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
                  ✓
                </span>
                <h4 className="text-xs font-bold tracking-wider text-emerald-400 uppercase">
                  Broker yang Sedang Akumulasi (Top Pembeli Bersih)
                </h4>
              </div>
              <span className="font-mono text-[11px] font-bold text-emerald-400">
                CR3 Beli: {bandarmology.cr3Buy !== null ? `${bandarmology.cr3Buy}%` : '—'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[var(--border-subtle)] bg-[var(--rasi-muted-bg)]/40 text-[var(--rasi-muted)]">
                  <tr>
                    <th scope="col" className="px-3 py-2.5">
                      Broker
                    </th>
                    <th scope="col" className="px-2 py-2.5 text-center">
                      Tipe
                    </th>
                    <th scope="col" className="px-3 py-2.5 text-right">
                      Volume (Lot)
                    </th>
                    <th scope="col" className="px-3 py-2.5 text-right">
                      Avg Beli
                    </th>
                    <th scope="col" className="px-3 py-2.5 text-right font-bold text-emerald-400">
                      Beli Bersih
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--rasi-text)]">
                  {netBuyers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-xs text-[var(--rasi-muted)]">
                        Tidak ada data akumulasi broker.
                      </td>
                    </tr>
                  ) : (
                    netBuyers.map((b, idx) => (
                      <tr
                        key={b.code}
                        className="transition-colors hover:bg-[var(--rasi-muted-bg)]/30"
                      >
                        <td className="px-3 py-2.5">
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-mono font-bold text-emerald-400">{b.code}</span>
                            <span
                              className="max-w-[110px] truncate text-[11px] text-[var(--rasi-muted)]"
                              title={b.name}
                            >
                              {b.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-2 py-2.5 text-center">
                          <span
                            className={`inline-block text-[11px] font-semibold ${
                              b.isForeign
                                ? 'text-sky-300'
                                : b.cohort === 'retail'
                                  ? 'text-amber-300'
                                  : 'text-indigo-300'
                            }`}
                          >
                            {b.isForeign ? 'Asing' : b.cohort === 'retail' ? 'Ritel' : 'Institusi'}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-[var(--rasi-muted)] tabular-nums">
                          {formatLot(b.blot || b.nlot)}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-[var(--rasi-text)] tabular-nums">
                          {b.bavg > 0 ? `Rp ${b.bavg.toLocaleString('id-ID')}` : '—'}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono font-bold text-emerald-400 tabular-nums">
                          +{formatShortBillions(b.nval)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* SISI KANAN: TOP BROKER DISTRIBUSI (NET SELL) */}
          <div className="overflow-hidden rounded-2xl border border-rose-500/30 bg-[var(--surface-card)] shadow-[var(--rasi-card-shadow)]">
            <div className="flex items-center justify-between border-b border-rose-500/20 bg-rose-500/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                  ✕
                </span>
                <h4 className="text-xs font-bold tracking-wider text-rose-400 uppercase">
                  Broker yang Melepas Barang (Top Penjual Bersih)
                </h4>
              </div>
              <span className="font-mono text-[11px] font-bold text-rose-400">
                CR3 Jual: {bandarmology.cr3Sell !== null ? `${bandarmology.cr3Sell}%` : '—'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[var(--border-subtle)] bg-[var(--rasi-muted-bg)]/40 text-[var(--rasi-muted)]">
                  <tr>
                    <th scope="col" className="px-3 py-2.5">
                      Broker
                    </th>
                    <th scope="col" className="px-2 py-2.5 text-center">
                      Tipe
                    </th>
                    <th scope="col" className="px-3 py-2.5 text-right">
                      Volume (Lot)
                    </th>
                    <th scope="col" className="px-3 py-2.5 text-right">
                      Avg Jual
                    </th>
                    <th scope="col" className="px-3 py-2.5 text-right font-bold text-rose-400">
                      Jual Bersih
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--rasi-text)]">
                  {netSellers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-xs text-[var(--rasi-muted)]">
                        Tidak ada data distribusi broker.
                      </td>
                    </tr>
                  ) : (
                    netSellers.map((s, idx) => (
                      <tr
                        key={s.code}
                        className="transition-colors hover:bg-[var(--rasi-muted-bg)]/30"
                      >
                        <td className="px-3 py-2.5">
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-mono font-bold text-rose-400">{s.code}</span>
                            <span
                              className="max-w-[110px] truncate text-[11px] text-[var(--rasi-muted)]"
                              title={s.name}
                            >
                              {s.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-2 py-2.5 text-center">
                          <span
                            className={`inline-block text-[11px] font-semibold ${
                              s.isForeign
                                ? 'text-sky-300'
                                : s.cohort === 'retail'
                                  ? 'text-amber-300'
                                  : 'text-indigo-300'
                            }`}
                          >
                            {s.isForeign ? 'Asing' : s.cohort === 'retail' ? 'Ritel' : 'Institusi'}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-[var(--rasi-muted)] tabular-nums">
                          {formatLot(s.slot || s.nlot)}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-[var(--rasi-text)] tabular-nums">
                          {s.savg > 0 ? `Rp ${s.savg.toLocaleString('id-ID')}` : '—'}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono font-bold text-rose-400 tabular-nums">
                          {formatShortBillions(s.nval)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. Alternative View: All Active Brokers Table */}
      {viewMode === 'all' && (
        <div className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[var(--rasi-card-shadow)]">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] p-4">
            <h4 className="text-xs font-bold tracking-wider text-[var(--rasi-text)] uppercase">
              Daftar Seluruh Broker yang Bertransaksi ({enrichedRows.length})
            </h4>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[var(--rasi-muted)]">Urutkan:</span>
              <button
                type="button"
                onClick={() => setSortBy('netVal')}
                className={`rounded px-2 py-0.5 text-[11px] font-semibold ${
                  sortBy === 'netVal'
                    ? 'bg-[var(--rasi-primary)] text-[var(--rasi-primary-text)]'
                    : 'bg-[var(--rasi-muted-bg)] text-[var(--rasi-muted)]'
                }`}
              >
                Net Value
              </button>
              <button
                type="button"
                onClick={() => setSortBy('buyVal')}
                className={`rounded px-2 py-0.5 text-[11px] font-semibold ${
                  sortBy === 'buyVal'
                    ? 'bg-[var(--rasi-primary)] text-[var(--rasi-primary-text)]'
                    : 'bg-[var(--rasi-muted-bg)] text-[var(--rasi-muted)]'
                }`}
              >
                Total Beli
              </button>
              <button
                type="button"
                onClick={() => setSortBy('sellVal')}
                className={`rounded px-2 py-0.5 text-[11px] font-semibold ${
                  sortBy === 'sellVal'
                    ? 'bg-[var(--rasi-primary)] text-[var(--rasi-primary-text)]'
                    : 'bg-[var(--rasi-muted-bg)] text-[var(--rasi-muted)]'
                }`}
              >
                Total Jual
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[var(--border-subtle)] bg-[var(--rasi-muted-bg)]/40 text-[var(--rasi-muted)]">
                <tr>
                  <th scope="col" className="px-3 py-2.5">
                    Kode
                  </th>
                  <th scope="col" className="px-3 py-2.5">
                    Nama Broker
                  </th>
                  <th scope="col" className="px-2 py-2.5 text-center">
                    Tipe
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-right">
                    Beli (Rp M)
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-right">
                    Avg Beli
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-right">
                    Jual (Rp M)
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-right">
                    Avg Jual
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-right font-bold">
                    Net (Rp M)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--rasi-text)]">
                {[...enrichedRows]
                  .sort((a, b) => {
                    if (sortBy === 'buyVal') return b.bval - a.bval
                    if (sortBy === 'sellVal') return b.sval - a.sval
                    return b.nval - a.nval
                  })
                  .map((r) => (
                    <tr
                      key={r.code}
                      className="transition-colors hover:bg-[var(--rasi-muted-bg)]/30"
                    >
                      <td className="px-3 py-2 font-mono font-bold text-[var(--rasi-primary)]">
                        {r.code}
                      </td>
                      <td className="max-w-[140px] truncate px-3 py-2 text-[var(--rasi-muted)]">
                        {r.name}
                      </td>
                      <td className="px-2 py-2 text-center">
                        <span
                          className={`inline-block text-[11px] font-semibold ${
                            r.isForeign
                              ? 'text-sky-300'
                              : r.cohort === 'retail'
                                ? 'text-amber-300'
                                : 'text-indigo-300'
                          }`}
                        >
                          {r.isForeign ? 'Asing' : r.cohort === 'retail' ? 'Ritel' : 'Institusi'}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right font-mono tabular-nums">
                        {formatShortBillions(r.bval)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-[var(--rasi-muted)] tabular-nums">
                        {r.bavg > 0 ? `Rp ${r.bavg.toLocaleString('id-ID')}` : '—'}
                      </td>
                      <td className="px-3 py-2 text-right font-mono tabular-nums">
                        {formatShortBillions(r.sval)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-[var(--rasi-muted)] tabular-nums">
                        {r.savg > 0 ? `Rp ${r.savg.toLocaleString('id-ID')}` : '—'}
                      </td>
                      <td
                        className={`px-3 py-2 text-right font-mono font-bold tabular-nums ${
                          r.nval >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {r.nval >= 0 ? '+' : ''}
                        {formatShortBillions(r.nval)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Action Banner to Next Stage: Radar Pasar & Katalis Berita (Tahap 3 dari 4) */}
      <div className="relative overflow-hidden rounded-2xl border border-[var(--rasi-primary)]/40 bg-gradient-to-r from-[var(--rasi-primary)]/10 via-[var(--surface-card)] to-[var(--rasi-accent)]/10 p-6 shadow-[var(--rasi-card-shadow)]">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="max-w-xl space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--rasi-primary)]">
              <span>Langkah Selanjutnya (Tahap 3 dari 4)</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </div>
            <h3 className="text-base font-bold text-[var(--rasi-text)] sm:text-lg">
              Verifikasi dengan Radar Pasar & Katalis Berita {cleanTicker}
            </h3>
            <p className="text-xs leading-relaxed text-[var(--rasi-muted)]">
              Setelah memetakan siapa saja broker yang mengakumulasi saham {cleanTicker}, periksa
              apakah ada katalis berita positif berdampak besar (Sleeping Giants) atau aksi
              transaksi pemegang saham pengendali (Insider Filings) di Radar Pasar.
            </p>
          </div>

          <div className="shrink-0">
            <Link
              href={`/radar?ticker=${cleanTicker}&flow=discover`}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--rasi-primary)] px-5 py-3 text-sm font-bold text-[var(--rasi-primary-text)] shadow-md transition-all hover:opacity-90 active:scale-95"
            >
              <span>Lanjut ke Radar Pasar ({cleanTicker})</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

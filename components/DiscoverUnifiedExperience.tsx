'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Building2,
  Check,
  ChevronRight,
  Clock,
  ExternalLink,
  Eye,
  FileText,
  HelpCircle,
  History,
  Layers,
  Lightbulb,
  Loader2,
  Radar,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  X,
} from 'lucide-react'

import {
  type MarketRadarData,
  getMarketRadarFeed,
  getSignalAnalysisAction,
  getStockData,
  saveResearchNoteAction,
} from '@/app/actions'
import { BrokerAccumulationTable } from '@/components/BrokerAccumulationTable'
import { MarkdownContent } from '@/components/MarkdownContent'
import { SignalEvaluationPanel } from '@/components/SignalEvaluationPanel'
import { Button } from '@/components/ui'
import { POPULAR_STOCKS, type StockSuggestion, searchLocalStocks } from '@/domain/stocks'
import type { BandarmologyIndicator } from '@/lib/contracts/analysis'
import type { BrokerRegistryEntry, BrokerSummaryData, MarketNewsItem } from '@/lib/contracts/market'
import type { StockDataResult } from '@/lib/server/services/analysis'

const FEATURED_TICKERS = [
  { symbol: 'BBCA', name: 'Bank Central Asia' },
  { symbol: 'BBRI', name: 'Bank Rakyat Indonesia' },
  { symbol: 'BMRI', name: 'Bank Mandiri' },
  { symbol: 'TLKM', name: 'Telkom Indonesia' },
  { symbol: 'ASII', name: 'Astra International' },
  { symbol: 'AMMN', name: 'Amman Mineral' },
  { symbol: 'BREN', name: 'Barito Renewables' },
]

const CATEGORY_MAP: Record<string, string[]> = {
  banks: ['BBCA', 'BBRI', 'BMRI', 'BBNI', 'BRIS'],
  bluechip: ['ASII', 'TLKM', 'UNVR', 'ICBP', 'INDF'],
  commodity: ['AMMN', 'BREN', 'ADRO', 'PTBA', 'ANTM', 'MEDC', 'INCO', 'MDKA'],
  consumer_tech: ['GOTO', 'BUKA', 'KLBF', 'MYOR', 'ACES', 'MAPI'],
}

export function DiscoverUnifiedExperience() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const rawTicker = (searchParams.get('ticker') || searchParams.get('symbol') || '')
    .trim()
    .toUpperCase()
    .replace(/\.JK$/i, '')
  const tickerParam = /^[A-Z]{4}$/.test(rawTicker) ? rawTicker : ''
  const stageParam = Number(searchParams.get('stage') || '1')
  const initialStage = stageParam >= 1 && stageParam <= 4 ? (stageParam as 1 | 2 | 3 | 4) : 1

  const [ticker, setTicker] = useState<string>(tickerParam)
  const [currentStage, setCurrentStage] = useState<1 | 2 | 3 | 4>(initialStage)
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'banks' | 'bluechip' | 'commodity' | 'consumer_tech'
  >('all')

  // Search input state
  const [searchInput, setSearchInput] = useState<string>('')
  const [suggestions, setSuggestions] = useState<StockSuggestion[]>([])
  const [showDropdown, setShowDropdown] = useState<boolean>(false)
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const headerSearchRef = useRef<HTMLDivElement>(null)

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      const inLanding = searchContainerRef.current?.contains(target)
      const inHeader = headerSearchRef.current?.contains(target)
      if (!inLanding && !inHeader) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearchKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    targetStage: 1 | 2 | 3 | 4 = 1,
  ) => {
    if (e.key === 'Escape') {
      setShowDropdown(false)
      return
    }

    if (!showDropdown || suggestions.length === 0) {
      if (e.key === 'Enter' && searchInput.trim()) {
        e.preventDefault()
        const clean = searchInput.trim().toUpperCase()
        if (/^[A-Z]{4}$/.test(clean)) {
          handleSelectTicker(clean, targetStage)
        }
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSelectTicker(suggestions[selectedIndex].symbol, targetStage)
      } else if (suggestions.length > 0) {
        handleSelectTicker(suggestions[0].symbol, targetStage)
      }
    }
  }

  // Stock Data state (for broker and company metadata)
  const [stockData, setStockData] = useState<StockDataResult | null>(null)
  const [loadingStock, setLoadingStock] = useState<boolean>(false)

  // Radar Data state
  const [radarData, setRadarData] = useState<MarketRadarData | null>(null)
  const [loadingRadar, setLoadingRadar] = useState<boolean>(false)

  // AI Assistant Chat State (Stage 4)
  const defaultPrompt = ticker
    ? `Tolong berikan kesimpulan sintesis untuk saham ${ticker}: evaluasi sinyal sesi intraday, rencana risiko stop loss/take profit, peta akumulasi broker, dan pantauan radar pasar.`
    : ''
  const [chatInput, setChatInput] = useState(defaultPrompt)
  const [chatMessages, setChatMessages] = useState<
    Array<{ role: 'user' | 'assistant'; content: string }>
  >([])
  const [chatLoading, setChatLoading] = useState(false)
  const [chatError, setChatError] = useState('')

  // Research Note / Thesis state
  const [thesisText, setThesisText] = useState('')
  const [invalidationText, setInvalidationText] = useState('')
  const [thesisSaving, setThesisSaving] = useState(false)
  const [thesisMessage, setThesisMessage] = useState('')

  // Update URL state without page reload
  const syncUrl = (newTicker: string, newStage: number) => {
    const url = new URL(window.location.href)
    if (newTicker) {
      url.searchParams.set('ticker', newTicker)
      url.searchParams.set('stage', String(newStage))
    } else {
      url.searchParams.delete('ticker')
      url.searchParams.delete('stage')
    }
    window.history.replaceState(null, '', url.toString())
  }

  const handleResetTicker = () => {
    setTicker('')
    setStockData(null)
    setSearchInput('')
    setShowDropdown(false)
    syncUrl('', 1)
  }

  // Load stock details (broker, news, filings)
  const loadStockData = useCallback(async (sym: string, opts?: { forceRefresh?: boolean }) => {
    if (!sym) {
      setStockData(null)
      setLoadingStock(false)
      return
    }
    setLoadingStock(true)
    try {
      const res = await getStockData(sym, opts)
      if (res.success && res.data) {
        setStockData(res.data)
      } else {
        setStockData(null)
      }
    } catch {
      setStockData(null)
    } finally {
      setLoadingStock(false)
    }
  }, [])

  // Load radar data for Stage 3
  const loadRadarData = useCallback(async () => {
    if (radarData) return
    setLoadingRadar(true)
    try {
      const res = await getMarketRadarFeed()
      if (res.success && res.data) {
        setRadarData(res.data)
      }
    } catch {
      // Ignore
    } finally {
      setLoadingRadar(false)
    }
  }, [radarData])

  // Sync on ticker changes
  useEffect(() => {
    if (!ticker) return
    void loadStockData(ticker)
    setChatMessages([])
    setChatInput(
      `Tolong berikan kesimpulan sintesis untuk saham ${ticker}: evaluasi sinyal sesi intraday, rencana risiko stop loss/take profit, peta akumulasi broker, dan pantauan radar pasar.`,
    )
  }, [ticker, loadStockData])

  // Fetch radar when reaching stage 3 or 4
  useEffect(() => {
    if (currentStage >= 3) {
      void loadRadarData()
    }
  }, [currentStage, loadRadarData])

  const handleSelectTicker = (sym: string, stage: 1 | 2 | 3 | 4 = 1) => {
    const clean = sym.trim().toUpperCase()
    setTicker(clean)
    setCurrentStage(stage)
    setSearchInput('')
    setShowDropdown(false)
    syncUrl(clean, stage)
  }

  const handleStageChange = (stage: 1 | 2 | 3 | 4) => {
    setCurrentStage(stage)
    syncUrl(ticker, stage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSaveThesis = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!thesisText.trim()) return

    setThesisSaving(true)
    setThesisMessage('')

    try {
      const res = await saveResearchNoteAction(
        ticker,
        `snap-${ticker}-current`,
        thesisText.trim(),
        invalidationText.trim() || undefined,
      )
      if (res.success) {
        setThesisMessage('Tesis riset berhasil disimpan ke portofolio Anda!')
      } else if (res.error?.includes('AUTH_REQUIRED')) {
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem(
              `rasi_thesis_${ticker}`,
              JSON.stringify({
                thesis: thesisText.trim(),
                invalidationTriggers: invalidationText.trim(),
                updatedAt: new Date().toISOString(),
              }),
            )
          }
          setThesisMessage(
            'Tesis tersimpan di browser Anda (Masuk dengan Google untuk sinkronisasi cloud).',
          )
        } catch {
          setThesisMessage(res.error)
        }
      } else {
        setThesisMessage(res.error || 'Gagal menyimpan tesis riset.')
      }
    } catch (err) {
      setThesisMessage(err instanceof Error ? err.message : 'Terjadi kesalahan sistem.')
    } finally {
      setThesisSaving(false)
    }
  }

  const handleSendChat = async (textToSend = chatInput) => {
    const q = textToSend.trim()
    if (!q || chatLoading) return

    const next = [...chatMessages, { role: 'user' as const, content: q }]
    setChatMessages(next)
    setChatInput('')
    setChatLoading(true)
    setChatError('')

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: q,
          ticker,
        }),
      })

      const data = await res.json()
      if (res.ok && data.answer) {
        setChatMessages([...next, { role: 'assistant' as const, content: data.answer }])
      } else {
        setChatError(data.error || 'Asisten belum dapat memberikan jawaban.')
      }
    } catch (err) {
      setChatError(err instanceof Error ? err.message : 'Gagal menghubungi asisten.')
    } finally {
      setChatLoading(false)
    }
  }

  const currentStockInfo = POPULAR_STOCKS.find((s) => s.symbol === ticker) || {
    symbol: ticker,
    name: stockData?.companyName || ticker,
    sector: 'Bursa Efek Indonesia',
  }

  // Filtered radar matches for this ticker
  const tickerSleepingGiants = useMemo(() => {
    return (radarData?.sleepingGiants ?? []).filter((g: { ticker: string }) => g.ticker === ticker)
  }, [radarData, ticker])

  const tickerInsiderAlerts = useMemo(() => {
    return (radarData?.insiderAlerts ?? []).filter((i: { ticker: string }) => i.ticker === ticker)
  }, [radarData, ticker])

  const STAGES = [
    {
      num: 1,
      title: 'Sinyal & Risiko',
      desc: 'Evaluasi sesi & Stop Loss',
      icon: TrendingUp,
    },
    {
      num: 2,
      title: 'Akumulasi Broker',
      desc: 'Siapa yang borong barang?',
      icon: Building2,
    },
    {
      num: 3,
      title: 'Radar Pasar',
      desc: 'Berita & transaksi orang dalam',
      icon: Radar,
    },
    {
      num: 4,
      title: 'Asisten AI',
      desc: 'Sintesis & rekomendasi akhir',
      icon: Sparkles,
    },
  ]

  const displayStocks = useMemo(() => {
    if (selectedCategory === 'all') {
      return POPULAR_STOCKS.slice(0, 15)
    }
    const targetSymbols = CATEGORY_MAP[selectedCategory] || []
    return POPULAR_STOCKS.filter((s) => targetSymbols.includes(s.symbol))
  }, [selectedCategory])

  // ── A. LANDING VIEW: PENGGUNA BELUM MEMILIH SAHAM ──
  if (!ticker) {
    return (
      <div className="mx-auto max-w-6xl space-y-10 py-4">
        {/* 1. HERO BANNER */}
        <div className="relative rounded-3xl border border-[var(--border-subtle)] bg-gradient-to-br from-[var(--bg-main)] via-[var(--surface-card)] to-[var(--bg-main)] p-8 text-center shadow-[var(--rasi-card-shadow)] sm:p-12">
          <div className="mx-auto max-w-3xl space-y-4">
            <h1 className="text-3xl font-black tracking-tight text-[var(--rasi-text)] sm:text-5xl">
              Pilih Saham yang Ingin Anda Riset
            </h1>

            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-[var(--rasi-muted)] sm:text-base">
              Mulai eksplorasi terstruktur melalui 4 tahap riset terpadu: Evaluasi Sinyal & Risiko
              Sesi Intraday, Akumulasi Broker, Pantauan Radar Pasar, hingga Sintesis AI.
            </p>

            {/* Central Autocomplete Search Bar */}
            <div
              ref={searchContainerRef}
              className="relative z-40 mx-auto mt-6 max-w-2xl text-left"
            >
              <div className="relative flex items-center rounded-2xl border-2 border-[var(--border-subtle)] bg-[var(--rasi-surface)] shadow-lg transition-colors focus-within:border-[var(--rasi-primary)]">
                <div className="pr-2 pl-4 text-[var(--rasi-muted)]">
                  <Search className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  placeholder="Ketik kode saham atau nama emiten (misal: GOTO, BBRI, TLKM)..."
                  value={searchInput}
                  onChange={(e) => {
                    const val = e.target.value
                    setSearchInput(val)
                    if (val.trim()) {
                      setSuggestions(searchLocalStocks(val, 8))
                      setShowDropdown(true)
                      setSelectedIndex(-1)
                    } else {
                      setShowDropdown(false)
                    }
                  }}
                  onFocus={() => {
                    if (searchInput.trim()) setShowDropdown(true)
                  }}
                  onKeyDown={(e) => handleSearchKeyDown(e, 1)}
                  className="w-full bg-transparent py-4 text-sm text-[var(--rasi-text)] placeholder-[var(--rasi-muted)] ring-0 outline-none focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none sm:text-base"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('')
                      setShowDropdown(false)
                    }}
                    className="mr-2 rounded-xl p-2 text-[var(--rasi-muted)] transition-colors outline-none hover:bg-[var(--rasi-muted-bg)] hover:text-[var(--rasi-text)] focus:outline-none focus-visible:outline-none"
                    title="Bersihkan pencarian"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Floating Dropdown Suggestion Menu (Tidak terpotong container) */}
              {showDropdown && (
                <div className="animate-in fade-in slide-in-from-top-2 absolute top-full right-0 left-0 z-50 mt-2 divide-y divide-[var(--border-subtle)] overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-2xl backdrop-blur-xl duration-150">
                  {suggestions.length > 0 ? (
                    <>
                      <div className="flex items-center justify-between bg-[var(--rasi-muted-bg)]/40 px-4 py-2.5 text-[11px] font-semibold text-[var(--rasi-muted)]">
                        <span>Ditemukan {suggestions.length} Saham</span>
                        <span className="hidden text-[10px] sm:inline">
                          Gunakan tombol ↑ ↓ untuk memilih, tekan Enter
                        </span>
                      </div>
                      <div className="max-h-80 divide-y divide-[var(--border-subtle)] overflow-y-auto">
                        {suggestions.map((item, idx) => {
                          const isHighlighted = idx === selectedIndex
                          return (
                            <button
                              key={item.symbol}
                              type="button"
                              onClick={() => handleSelectTicker(item.symbol, 1)}
                              onMouseEnter={() => setSelectedIndex(idx)}
                              className={`group flex w-full items-center justify-between p-3.5 text-left transition-colors ${
                                isHighlighted
                                  ? 'border-l-4 border-l-[var(--rasi-primary)] bg-[var(--rasi-primary)]/15'
                                  : 'hover:bg-[var(--rasi-muted-bg)]'
                              }`}
                            >
                              <div className="flex min-w-0 items-center gap-3.5">
                                <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded-xl border border-[var(--rasi-primary)]/20 bg-[var(--rasi-primary)]/10 font-mono text-sm font-black text-[var(--rasi-primary)] shadow-xs transition-transform group-hover:scale-105">
                                  {item.symbol}
                                </div>
                                <div className="flex min-w-0 flex-col">
                                  <span className="truncate text-sm font-bold text-[var(--rasi-text)]">
                                    {item.name}
                                  </span>
                                  <span className="text-[11px] font-medium text-[var(--rasi-muted)]">
                                    {item.sector}
                                  </span>
                                </div>
                              </div>

                              <div className="flex shrink-0 items-center gap-1.5 pl-3">
                                <span className="flex items-center gap-1 text-[11px] font-bold text-[var(--rasi-muted)] transition-colors group-hover:text-[var(--rasi-primary)]">
                                  <span>Riset</span>
                                  <ArrowRight className="h-3 w-3" />
                                </span>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="space-y-1 p-6 text-center text-xs text-[var(--rasi-muted)]">
                      <p className="font-semibold text-[var(--rasi-text)]">
                        Tidak ada saham yang cocok
                      </p>
                      <p>
                        Kode saham atau nama &quot;{searchInput}&quot; tidak ditemukan di daftar
                        emiten.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. POPULAR CATEGORIES & STOCK CARDS */}
        <div className="space-y-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-black text-[var(--rasi-text)]">Pilihan Saham Populer</h2>
              <p className="text-xs text-[var(--rasi-muted)] sm:text-sm">
                Klik kartu saham untuk langsung membuka 4 tahapan riset lengkapnya.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'all', label: 'Semua Populer' },
                { id: 'banks', label: 'Perbankan' },
                { id: 'bluechip', label: 'Blue Chips' },
                { id: 'commodity', label: 'Komoditas' },
                { id: 'consumer_tech', label: 'Konsumer & Tech' },
              ].map((cat) => {
                const isActive = selectedCategory === cat.id
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() =>
                      setSelectedCategory(
                        cat.id as 'all' | 'banks' | 'bluechip' | 'commodity' | 'consumer_tech',
                      )
                    }
                    className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[var(--rasi-primary)] text-[var(--rasi-primary-text)] shadow-sm'
                        : 'border border-[var(--border-subtle)] bg-[var(--surface-card)] text-[var(--rasi-muted)] hover:border-[var(--rasi-border)] hover:text-[var(--rasi-text)]'
                    }`}
                  >
                    {cat.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayStocks.map((stock) => (
              <button
                key={stock.symbol}
                type="button"
                onClick={() => handleSelectTicker(stock.symbol, 1)}
                className="group relative flex flex-col justify-between rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:border-[var(--rasi-primary)] hover:shadow-lg"
              >
                <div>
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="font-mono text-xl font-black tracking-tight text-[var(--rasi-text)] transition-colors group-hover:text-[var(--rasi-primary)]">
                      {stock.symbol}
                    </span>
                    <span className="text-xs font-semibold text-[var(--rasi-muted)]">
                      {stock.sector}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-xs leading-relaxed text-[var(--rasi-muted)] sm:text-sm">
                    {stock.name}
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-[var(--border-subtle)] pt-4 text-xs font-bold text-[var(--rasi-primary)]">
                  <span>Mulai Riset Saham</span>
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--rasi-primary)]/10 transition-all group-hover:bg-[var(--rasi-primary)] group-hover:text-[var(--rasi-primary-text)]">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 3. VISUAL 4-STEP ROADMAP EXPLAINER */}
        <div className="rounded-3xl border border-[var(--border-subtle)] bg-gradient-to-br from-[var(--surface-card)] to-[var(--bg-main)] p-6 sm:p-8">
          <div className="mx-auto mb-8 max-w-xl text-center">
            <h3 className="text-lg font-black text-[var(--rasi-text)] sm:text-xl">
              Bagaimana Alur Riset 4 Langkah Bekerja?
            </h3>
            <p className="mt-1 text-xs text-[var(--rasi-muted)] sm:text-sm">
              Setiap saham yang Anda pilih akan dianalisis secara berurutan dan terukur:
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STAGES.map((s) => {
              const Icon = s.icon
              return (
                <div
                  key={s.num}
                  className="flex flex-col items-center rounded-2xl border border-[var(--border-subtle)] bg-[var(--rasi-surface)]/60 p-4 text-center"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--rasi-primary)]/10 text-sm font-black text-[var(--rasi-primary)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="mb-1 font-mono text-[10px] font-bold tracking-wider text-[var(--rasi-primary)] uppercase">
                    Tahap {s.num}
                  </span>
                  <h4 className="mb-1 text-xs font-bold text-[var(--rasi-text)] sm:text-sm">
                    {s.title}
                  </h4>
                  <p className="text-[11px] leading-relaxed text-[var(--rasi-muted)]">{s.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ── B. ACTIVE WORKSPACE VIEW: SAHAM TELAH DIPILIH ──
  return (
    <div className="space-y-8 py-2">
      {/* ── 1. TOP HEADER & INSTANT STOCK SELECTOR ── */}
      <div className="relative rounded-3xl border border-[var(--border-subtle)] bg-gradient-to-br from-[var(--bg-main)] via-[var(--surface-card)] to-[var(--bg-main)] p-6 shadow-[var(--rasi-card-shadow)] sm:p-8">
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-2xl space-y-2">
            <h1 className="text-2xl font-black tracking-tight text-[var(--rasi-text)] sm:text-3xl">
              Riset Saham 4 Langkah: Mudah, Jelas & Terukur
            </h1>
            <p className="text-xs leading-relaxed text-[var(--rasi-muted)] sm:text-sm">
              Panduan terstruktur meneliti saham dari evaluasi sinyal sesi intraday, rencana stop
              loss/take profit, siapa broker yang memborong, radar berita, hingga sintesis AI.
            </p>
          </div>

          {/* Active Stock Badge & Ganti Saham Action */}
          <div className="flex items-center gap-3">
            <div className="flex shrink-0 items-center gap-3 self-start rounded-2xl border border-[var(--border-subtle)] bg-[var(--rasi-surface)]/80 p-3.5 backdrop-blur-md md:self-auto">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--rasi-primary)] font-mono text-lg font-black text-[var(--rasi-primary-text)] shadow-sm">
                {ticker.slice(0, 2)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xl font-black text-[var(--rasi-text)]">
                    {ticker}
                  </span>
                  <span className="text-xs font-bold text-emerald-400">• IDX Aktif</span>
                </div>
                <p className="max-w-[180px] truncate text-xs text-[var(--rasi-muted)]">
                  {stockData?.companyName || currentStockInfo.name}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetTicker}
              title="Pilih saham lain untuk diriset"
              className="inline-flex items-center gap-1.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--rasi-surface)]/80 px-3.5 py-3 text-xs font-bold text-[var(--rasi-muted)] shadow-sm transition-all hover:border-[var(--rasi-primary)] hover:bg-[var(--surface-card)] hover:text-[var(--rasi-text)]"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Ganti Saham</span>
            </button>
          </div>
        </div>

        {/* Quick Ticker Chips & Search Bar */}
        <div className="mt-6 flex flex-col justify-between gap-4 border-t border-[var(--border-subtle)] pt-5 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 hidden text-xs font-medium text-[var(--rasi-muted)] sm:inline">
              Pilih Cepat:
            </span>
            {FEATURED_TICKERS.map((item) => {
              const isActive = item.symbol === ticker
              return (
                <button
                  key={item.symbol}
                  type="button"
                  onClick={() => handleSelectTicker(item.symbol)}
                  className={`rounded-xl px-3 py-1.5 font-mono text-xs font-bold transition-all ${
                    isActive
                      ? 'scale-105 bg-[var(--rasi-primary)] text-[var(--rasi-primary-text)] shadow-sm ring-2 ring-[var(--rasi-primary)]/30'
                      : 'border border-[var(--border-subtle)] bg-[var(--surface-card)] text-[var(--rasi-muted)] hover:border-[var(--rasi-border)] hover:text-[var(--rasi-text)]'
                  }`}
                >
                  {item.symbol}
                </button>
              )
            })}
          </div>

          {/* Autocomplete Search input */}
          <div ref={headerSearchRef} className="relative z-40 w-full text-left sm:w-72">
            <div className="relative flex items-center rounded-xl border border-[var(--border-subtle)] bg-[var(--rasi-surface)] shadow-xs transition-colors focus-within:border-[var(--rasi-primary)]">
              <Search className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-[var(--rasi-muted)]" />
              <input
                type="text"
                placeholder="Cari kode saham lain…"
                value={searchInput}
                onChange={(e) => {
                  const val = e.target.value
                  setSearchInput(val)
                  if (val.trim()) {
                    setSuggestions(searchLocalStocks(val, 6))
                    setShowDropdown(true)
                    setSelectedIndex(-1)
                  } else {
                    setShowDropdown(false)
                  }
                }}
                onFocus={() => {
                  if (searchInput.trim()) setShowDropdown(true)
                }}
                onKeyDown={(e) => handleSearchKeyDown(e, currentStage)}
                className="w-full bg-transparent py-2 pr-8 pl-9 text-xs text-[var(--rasi-text)] placeholder-[var(--rasi-muted)] ring-0 outline-none focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('')
                    setShowDropdown(false)
                  }}
                  className="absolute right-2 text-[var(--rasi-muted)] outline-none hover:text-[var(--rasi-text)] focus:outline-none focus-visible:outline-none"
                  title="Bersihkan"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {showDropdown && suggestions.length > 0 && (
              <div className="animate-in fade-in absolute top-full right-0 left-0 z-50 mt-1.5 max-h-72 divide-y divide-[var(--border-subtle)] overflow-hidden overflow-y-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-2xl duration-100">
                {suggestions.map((item, idx) => {
                  const isHighlighted = idx === selectedIndex
                  return (
                    <button
                      key={item.symbol}
                      type="button"
                      onClick={() => handleSelectTicker(item.symbol, currentStage)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`group flex w-full items-center justify-between p-2.5 text-left text-xs transition-colors ${
                        isHighlighted
                          ? 'border-l-2 border-l-[var(--rasi-primary)] bg-[var(--rasi-primary)]/15'
                          : 'hover:bg-[var(--rasi-muted-bg)]'
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="shrink-0 font-mono font-bold text-[var(--rasi-primary)]">
                          {item.symbol}
                        </span>
                        <span className="max-w-[130px] truncate text-[var(--rasi-text)]">
                          {item.name}
                        </span>
                      </div>
                      <span className="shrink-0 text-[10px] text-[var(--rasi-muted)]">
                        {item.sector}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 2. INTERACTIVE 5-STAGE NAVIGATION STEPPER ── */}
      <div className="space-y-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 shadow-[var(--rasi-card-shadow)] sm:p-4">
        {/* Progress Bar */}
        <div className="flex items-center justify-between px-1 text-xs text-[var(--rasi-muted)]">
          <span className="font-semibold text-[var(--rasi-text)]">
            Tahap {currentStage} dari 5: {STAGES[currentStage - 1].title}
          </span>
          <span className="font-mono font-bold text-[var(--rasi-primary)]">
            {currentStage * 20}% Selesai
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--rasi-muted-bg)]">
          <div
            className="h-full bg-gradient-to-r from-[var(--rasi-primary)] to-[var(--rasi-accent)] transition-all duration-300"
            style={{ width: `${currentStage * 20}%` }}
          />
        </div>

        {/* Stage Tabs */}
        <div className="grid grid-cols-2 gap-2 pt-1 sm:grid-cols-4">
          {STAGES.map((s) => {
            const isActive = s.num === currentStage
            const isPassed = s.num < currentStage
            const Icon = s.icon

            return (
              <button
                key={s.num}
                type="button"
                onClick={() => handleStageChange(s.num as 1 | 2 | 3 | 4)}
                className={`group flex items-start gap-2.5 rounded-xl border p-3 text-left transition-all ${
                  isActive
                    ? 'border-[var(--rasi-primary)] bg-[var(--rasi-primary)]/10 shadow-sm ring-1 ring-[var(--rasi-primary)]/30'
                    : 'border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-xs hover:border-[var(--rasi-border)] hover:bg-[var(--rasi-muted-bg)]/40'
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold ${
                    isActive
                      ? 'bg-[var(--rasi-primary)] text-[var(--rasi-primary-text)]'
                      : isPassed
                        ? 'bg-emerald-500 text-white shadow-xs dark:bg-emerald-600'
                        : 'bg-[var(--rasi-muted-bg)] text-[var(--rasi-muted)]'
                  }`}
                >
                  {isPassed ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : s.num}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span
                      className={`truncate text-xs font-bold ${
                        isActive ? 'text-[var(--rasi-primary)]' : 'text-[var(--rasi-text)]'
                      }`}
                    >
                      {s.title}
                    </span>
                  </div>
                  <p className="truncate text-[10px] text-[var(--rasi-muted)]">{s.desc}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── 3. STAGE CONTENT AREA ── */}
      <div className="transition-all duration-200">
        {/* ────── STAGE 1: EVALUASI SINYAL & RISIKO INTRADAY ────── */}
        {currentStage === 1 && (
          <div className="space-y-6">
            {/* Friendly Explanation Card */}
            <div className="flex items-start gap-3.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 shadow-xs sm:p-5">
              <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-[var(--rasi-primary)]" />
              <div className="space-y-1 text-xs leading-relaxed text-[var(--rasi-muted)]">
                <span className="block text-sm font-bold text-[var(--rasi-text)]">
                  Cara Membaca Sinyal & Batasan Risiko ({ticker})
                </span>
                <p>
                  Sistem mengevaluasi arah tren pada sesi perdagangan bursa (Sesi I & II). Di bawah
                  ini Anda dapat melihat data harga live, batas pengaman modal (
                  <strong>Stop Loss</strong>), target keuntungan (<strong>TP1 & TP2</strong>), serta
                  mensimulasikan jumlah lot yang aman dibeli sesuai modal Anda.
                </p>
              </div>
            </div>

            {/* Live Real Market Metrics Bar (Dari Sectors & Bursa API) */}
            {stockData && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 shadow-sm">
                  <span className="block text-[10px] font-bold tracking-wider text-[var(--rasi-muted)] uppercase">
                    Harga Pasar Terkini
                  </span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="font-mono text-xl font-black text-[var(--rasi-text)] sm:text-2xl">
                      {stockData.price != null
                        ? `Rp ${stockData.price.toLocaleString('id-ID')}`
                        : '—'}
                    </span>
                    {stockData.priceChangeFraction != null && (
                      <span
                        className={`font-mono text-xs font-bold ${
                          stockData.priceChangeFraction > 0
                            ? 'text-emerald-400'
                            : stockData.priceChangeFraction < 0
                              ? 'text-rose-400'
                              : 'text-[var(--rasi-muted)]'
                        }`}
                      >
                        {stockData.priceChangeFraction > 0 ? '+' : ''}
                        {(stockData.priceChangeFraction * 100).toFixed(2)}%
                      </span>
                    )}
                  </div>
                  <span className="mt-0.5 block text-[10px] text-[var(--rasi-muted)]">
                    Data Bursa: {stockData.priceDate || 'Bursa Terkini'}
                  </span>
                </div>

                <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 shadow-sm">
                  <span className="block text-[10px] font-bold tracking-wider text-[var(--rasi-muted)] uppercase">
                    Skor Komposit Risiko
                  </span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="font-mono text-xl font-black text-[var(--rasi-text)] sm:text-2xl">
                      {stockData.composite?.score ?? '—'}
                    </span>
                    <span className="font-mono text-xs text-[var(--rasi-muted)]">/100</span>
                  </div>
                  <span className="mt-0.5 block text-[10px] font-semibold text-[var(--rasi-primary)]">
                    Status: {stockData.composite?.status || 'Netral'}
                  </span>
                </div>

                <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 shadow-sm">
                  <span className="block text-[10px] font-bold tracking-wider text-[var(--rasi-muted)] uppercase">
                    Volume Spike Ratio
                  </span>
                  <div className="mt-1">
                    <span className="font-mono text-xl font-black text-[var(--rasi-text)] sm:text-2xl">
                      {stockData.indicators.volume.spikeRatio != null
                        ? `${stockData.indicators.volume.spikeRatio.toFixed(2)}x`
                        : stockData.indicators.volume.formattedRatio || '1.00x'}
                    </span>
                  </div>
                  <span className="mt-0.5 block truncate text-[10px] font-semibold text-[var(--rasi-muted)]">
                    {stockData.indicators.volume.status || 'Volume Normal'}
                  </span>
                </div>

                <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 shadow-sm">
                  <span className="block text-[10px] font-bold tracking-wider text-[var(--rasi-muted)] uppercase">
                    Arus Bandarmologi
                  </span>
                  <div className="mt-1">
                    <span className="block truncate font-mono text-base font-black text-emerald-400 sm:text-lg">
                      {stockData.indicators.bandarmology.status || 'Seimbang'}
                    </span>
                  </div>
                  <span className="mt-0.5 block truncate text-[10px] font-semibold text-[var(--rasi-muted)]">
                    Asing: {stockData.indicators.bandarmology.foreignFlowStatus || 'UNKNOWN'}
                  </span>
                </div>
              </div>
            )}

            {/* Signal Evaluation Panel */}
            <SignalEvaluationPanel
              ticker={ticker}
              companyName={stockData?.companyName || currentStockInfo.name}
            />

            {/* Next Step Action Button */}
            <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 shadow-[var(--rasi-card-shadow)] sm:flex-row">
              <div>
                <span className="text-[11px] font-bold tracking-wider text-[var(--rasi-primary)] uppercase">
                  Langkah Selesai
                </span>
                <p className="text-xs text-[var(--rasi-muted)]">
                  Sudah memahami level risiko dan sinyal {ticker}? Lanjutkan untuk memeriksa peta
                  akumulasi broker.
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={() => handleStageChange(2)}
                icon={ArrowRight}
              >
                Lanjut ke Tahap 2: Cek Akumulasi Broker
              </Button>
            </div>
          </div>
        )}

        {/* ────── STAGE 2: AKUMULASI BROKER (TABEL PERBANDINGAN) ────── */}
        {currentStage === 2 && (
          <div className="space-y-6">
            <div className="flex items-start gap-3.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 shadow-xs sm:p-5">
              <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-[var(--rasi-primary)]" />
              <div className="space-y-1 text-xs leading-relaxed text-[var(--rasi-muted)]">
                <span className="block text-sm font-bold text-[var(--rasi-text)]">
                  Cara Membaca Akumulasi Broker ({ticker})
                </span>
                <p>
                  Periksa siapa yang berada di balik transaksi. Kolom hijau menunjukkan sekuritas
                  yang paling banyak memborong saham ini (<strong>Akumulasi</strong>), sedangkan
                  kolom merah menunjukkan pihak yang sedang melepas barang (
                  <strong>Distribusi</strong>
                  ). Perhatikan apakah broker institusi sedang menyerap barang dari investor ritel.
                </p>
              </div>
            </div>

            {loadingStock ? (
              <div className="space-y-2 py-16 text-center text-xs text-[var(--rasi-muted)]">
                <Loader2 className="mx-auto h-6 w-6 animate-spin text-[var(--rasi-primary)]" />
                <p>Memuat data transaksi broker {ticker}…</p>
              </div>
            ) : stockData ? (
              <BrokerAccumulationTable
                ticker={ticker}
                bandarmology={stockData.indicators.bandarmology}
                brokerSummary={stockData.envelopes?.broker?.data}
                brokerRegistry={stockData.envelopes?.registry?.data}
                showStepper={false}
              />
            ) : (
              <div className="rounded-2xl border border-dashed border-[var(--border-subtle)] p-8 text-center text-xs text-[var(--rasi-muted)]">
                Data transaksi broker {ticker} belum tersedia untuk hari bursa terkini.
              </div>
            )}

            {/* Stepper Navigation */}
            <div className="flex items-center justify-between rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 shadow-[var(--rasi-card-shadow)]">
              <Button
                variant="secondary"
                size="md"
                onClick={() => handleStageChange(1)}
                icon={ArrowLeft}
              >
                Kembali ke Sinyal
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => handleStageChange(3)}
                icon={ArrowRight}
              >
                Lanjut ke Tahap 3: Radar Pasar & Katalis
              </Button>
            </div>
          </div>
        )}

        {/* ────── STAGE 3: RADAR PASAR & KATALIS BERITA ────── */}
        {currentStage === 3 && (
          <div className="space-y-6">
            <div className="flex items-start gap-3.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 shadow-xs sm:p-5">
              <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-[var(--rasi-primary)]" />
              <div className="space-y-1 text-xs leading-relaxed text-[var(--rasi-muted)]">
                <span className="block text-sm font-bold text-[var(--rasi-text)]">
                  Apa yang Dipantau di Radar Pasar?
                </span>
                <p>
                  Radar RASI memindai berita penting yang dampaknya belum sepenuhnya tercermin pada
                  harga (<strong>Sleeping Giants</strong>), serta memeriksa laporan aksi transaksi
                  oleh komisaris, direksi, atau pemegang saham pengendali (
                  <strong>Insider Filings</strong>).
                </p>
              </div>
            </div>

            {loadingRadar ? (
              <div className="space-y-2 py-16 text-center text-xs text-[var(--rasi-muted)]">
                <Loader2 className="mx-auto h-6 w-6 animate-spin text-[var(--rasi-primary)]" />
                <p>Memindai radar pasar dan berita terkini {ticker}…</p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Specific Alerts for Selected Ticker */}
                {tickerSleepingGiants.length > 0 || tickerInsiderAlerts.length > 0 ? (
                  <div className="space-y-4">
                    {tickerSleepingGiants.map(
                      (
                        item: {
                          ticker: string
                          headline: string
                          verdict: string
                          impactScore: number
                        },
                        idx: number,
                      ) => (
                        <div
                          key={idx}
                          className="space-y-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-sm font-bold text-emerald-400">
                              {item.ticker} — Berita Positif Terdeteksi
                            </span>
                            <span className="text-xs font-bold text-emerald-400">
                              Skor Dampak: +{item.impactScore}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-[var(--rasi-text)]">
                            {item.headline}
                          </h4>
                          <p className="text-xs text-[var(--rasi-muted)]">{item.verdict}</p>
                        </div>
                      ),
                    )}

                    {tickerInsiderAlerts.map(
                      (
                        item: {
                          ticker: string
                          action: string
                          holderName: string
                          summary: string
                        },
                        idx: number,
                      ) => (
                        <div
                          key={idx}
                          className="space-y-2 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-sm font-bold text-amber-400">
                              {item.ticker} — Transaksi Pemegang Saham Besar
                            </span>
                            <span
                              className={`text-xs font-bold ${
                                item.action === 'BUY' ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              {item.action === 'BUY' ? 'Pembelian Saham' : 'Penjualan Saham'}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-[var(--rasi-text)]">
                            Pelaku: {item.holderName}
                          </p>
                          <p className="text-xs text-[var(--rasi-muted)]">{item.summary}</p>
                        </div>
                      ),
                    )}
                  </div>
                ) : (
                  <div className="space-y-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 text-center shadow-[var(--rasi-card-shadow)]">
                    <ShieldCheck className="mx-auto h-8 w-8 text-emerald-400" />
                    <div>
                      <h4 className="text-sm font-bold text-[var(--rasi-text)]">
                        Kondisi Radar Saham {ticker} Terjaga Baik
                      </h4>
                      <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-[var(--rasi-muted)]">
                        Tidak terdeteksi aksi jual agresif oleh orang dalam (insider) ataupun
                        anomali berita negatif pada saham {ticker}. Sentimen pasar terpantau stabil.
                      </p>
                    </div>
                  </div>
                )}

                {/* 1. Real Market News from Sectors API */}
                {stockData?.envelopes?.news?.data && stockData.envelopes.news.data.length > 0 && (
                  <div className="space-y-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 shadow-[var(--rasi-card-shadow)]">
                    <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-[var(--rasi-primary)]" />
                        <h4 className="text-xs font-bold text-[var(--rasi-text)] sm:text-sm">
                          Arus Berita Terkini Emiten: {ticker} (Data Resmi Sectors API)
                        </h4>
                      </div>
                      <span className="font-mono text-[10px] text-[var(--rasi-muted)]">
                        {stockData.envelopes.news.data.length} Berita
                      </span>
                    </div>

                    <div className="divide-y divide-[var(--border-subtle)]">
                      {stockData.envelopes.news.data.slice(0, 4).map((item, idx) => (
                        <div key={idx} className="space-y-1 py-3 first:pt-1 last:pb-0">
                          <div className="flex items-center justify-between text-[11px] text-[var(--rasi-muted)]">
                            <span className="font-semibold text-[var(--rasi-primary)]">
                              {item.source}
                            </span>
                            <span>
                              {item.timestamp
                                ? new Date(item.timestamp).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                : 'Terkini'}
                            </span>
                          </div>
                          <h5 className="text-xs leading-snug font-bold text-[var(--rasi-text)] sm:text-sm">
                            {item.title}
                          </h5>
                          {item.body && (
                            <p className="line-clamp-2 text-[11px] leading-relaxed text-[var(--rasi-muted)]">
                              {item.body}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Real Corporate Filings & Insider Activity from IDX */}
                {stockData?.envelopes?.filings?.data &&
                  stockData.envelopes.filings.data.length > 0 && (
                    <div className="space-y-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 shadow-[var(--rasi-card-shadow)]">
                      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-[var(--rasi-primary)]" />
                          <h4 className="text-xs font-bold text-[var(--rasi-text)] sm:text-sm">
                            Keterbukaan Informasi & Aksi Orang Dalam (IDX Filings)
                          </h4>
                        </div>
                        <span className="font-mono text-[10px] text-[var(--rasi-muted)]">
                          {stockData.envelopes.filings.data.length} Laporan
                        </span>
                      </div>

                      <div className="divide-y divide-[var(--border-subtle)]">
                        {stockData.envelopes.filings.data.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="space-y-1 py-3 first:pt-1 last:pb-0">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-mono font-bold text-[var(--rasi-text)]">
                                {item.holder_name || item.source || 'Pelapor Terdaftar'}
                              </span>
                              {item.transaction_type && (
                                <span
                                  className={`text-xs font-bold ${
                                    item.transaction_type.toLowerCase() === 'buy'
                                      ? 'text-emerald-400'
                                      : 'text-rose-400'
                                  }`}
                                >
                                  {item.transaction_type.toUpperCase()}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[var(--rasi-muted)]">
                              {item.title || item.body || 'Laporan kepemilikan saham rutin BEI'}
                            </p>
                            {item.timestamp && (
                              <span className="block text-[10px] text-[var(--rasi-muted)]">
                                Tanggal:{' '}
                                {new Date(item.timestamp).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            )}

            {/* Stepper Navigation */}
            <div className="flex items-center justify-between rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 shadow-[var(--rasi-card-shadow)]">
              <Button
                variant="secondary"
                size="md"
                onClick={() => handleStageChange(2)}
                icon={ArrowLeft}
              >
                Kembali ke Broker
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => handleStageChange(4)}
                icon={ArrowRight}
              >
                Lanjut ke Tahap 4: Sintesis Asisten AI
              </Button>
            </div>
          </div>
        )}

        {/* ────── STAGE 4: ASISTEN AI RASI (SINTESIS AKHIR) ────── */}
        {currentStage === 4 && (
          <div className="space-y-6">
            <div className="flex items-start gap-3.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 shadow-xs sm:p-5">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[var(--rasi-primary)]" />
              <div className="space-y-1 text-xs leading-relaxed text-[var(--rasi-muted)]">
                <span className="block text-sm font-bold text-[var(--rasi-text)]">
                  Sintesis Cerdas AI RASI (Didukung Gemini)
                </span>
                <p>
                  Asisten AI membaca seluruh data yang telah Anda kumpulkan dari Tahap 1 sampai 3:
                  sinyal intraday, toleransi risiko, akumulasi broker, dan kondisi radar pasar untuk
                  memberikan kesimpulan ringkas yang objektif.
                </p>
              </div>
            </div>

            {/* Research Dossier Card */}
            <div className="space-y-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 shadow-[var(--rasi-card-shadow)] sm:p-6">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                <span className="text-xs font-bold tracking-wider text-[var(--rasi-primary)] uppercase">
                  Dossier Riset Saham {ticker}
                </span>
                <span className="font-mono text-xs text-[var(--rasi-muted)]">
                  Status: Siap Disintesis
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-3">
                <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--rasi-surface)] p-3">
                  <span className="block text-[10px] text-[var(--rasi-muted)]">
                    1. Sinyal & Risiko
                  </span>
                  <span className="mt-1 block font-bold text-[var(--rasi-text)]">
                    {stockData?.composite?.status
                      ? `${stockData.composite.status} (${stockData.composite.score}/100)`
                      : 'Terekam'}
                  </span>
                </div>
                <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--rasi-surface)] p-3">
                  <span className="block text-[10px] text-[var(--rasi-muted)]">
                    2. Akumulasi Broker
                  </span>
                  <span className="mt-1 block font-bold text-[var(--rasi-text)]">
                    {stockData?.indicators.bandarmology.status || 'Data Terhubung'}
                  </span>
                </div>
                <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--rasi-surface)] p-3">
                  <span className="block text-[10px] text-[var(--rasi-muted)]">3. Radar Pasar</span>
                  <span className="mt-1 block truncate font-bold text-[var(--rasi-text)]">
                    {tickerSleepingGiants.length > 0
                      ? 'Katalis Positif'
                      : tickerInsiderAlerts.length > 0
                        ? 'Aksi Orang Dalam'
                        : stockData?.indicators.insider.status || 'Stabil'}
                  </span>
                </div>
              </div>
            </div>

            {/* Embedded AI Chat Box */}
            <div className="flex min-h-[420px] flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[var(--rasi-card-shadow)]">
              {/* Chat Header */}
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--rasi-muted-bg)]/30 p-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[var(--rasi-primary)]" />
                  <span className="text-xs font-bold text-[var(--rasi-text)]">
                    Tanya & Sintesis AI RASI ({ticker})
                  </span>
                </div>
                <Link
                  href={`/asisten?symbol=${ticker}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--rasi-primary)] hover:underline"
                >
                  <span>Buka di Halaman Penuh</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>

              {/* Chat Messages */}
              <div className="max-h-[460px] flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
                {chatMessages.length === 0 ? (
                  <div className="space-y-3 py-8 text-center">
                    <Sparkles className="mx-auto h-8 w-8 animate-pulse text-[var(--rasi-primary)]" />
                    <div>
                      <h4 className="text-sm font-bold text-[var(--rasi-text)]">
                        Instruksi Sintesis {ticker} Telah Disiapkan
                      </h4>
                      <p className="mx-auto mt-1 max-w-md text-xs text-[var(--rasi-muted)]">
                        Klik tombol &quot;Kirim ke AI&quot; di bawah untuk meminta ringkasan
                        menyeluruh berdasarkan data kontinu sesi bursa, broker, dan radar pasar.
                      </p>
                    </div>
                  </div>
                ) : (
                  chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed sm:text-sm ${
                          msg.role === 'user'
                            ? 'rounded-tr-xs bg-[var(--rasi-primary)] font-medium text-[var(--rasi-primary-text)]'
                            : 'rounded-tl-xs border border-[var(--border-subtle)] bg-[var(--rasi-surface)] text-[var(--rasi-text)] shadow-xs'
                        }`}
                      >
                        {msg.role === 'user' ? (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        ) : (
                          <MarkdownContent content={msg.content} />
                        )}
                      </div>
                    </div>
                  ))
                )}

                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2 rounded-2xl rounded-tl-xs border border-[var(--border-subtle)] bg-[var(--rasi-surface)] p-3 text-xs text-[var(--rasi-muted)]">
                      <Loader2 className="h-4 w-4 animate-spin text-[var(--rasi-primary)]" />
                      <span>AI RASI sedang menyusun kesimpulan riset…</span>
                    </div>
                  </div>
                )}

                {chatError && (
                  <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-400">
                    {chatError}
                  </div>
                )}
              </div>

              {/* Chat Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSendChat()
                }}
                className="flex items-center gap-2 border-t border-[var(--border-subtle)] bg-[var(--rasi-muted-bg)]/20 p-3 sm:p-4"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={`Tanyakan apa saja seputar saham ${ticker}…`}
                  disabled={chatLoading}
                  className="flex-1 rounded-xl border border-[var(--rasi-border)] bg-[var(--rasi-surface)] px-4 py-2.5 text-xs text-[var(--rasi-text)] outline-none focus:border-[var(--rasi-primary)] focus:ring-1 focus:ring-[var(--rasi-primary)] sm:text-sm"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  icon={Send}
                  disabled={!chatInput.trim() || chatLoading}
                >
                  Kirim ke AI
                </Button>
              </form>
            </div>

            {/* Stepper Navigation */}
            <div className="flex items-center justify-between rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 shadow-[var(--rasi-card-shadow)]">
              <Button
                variant="secondary"
                size="md"
                onClick={() => handleStageChange(3)}
                icon={ArrowLeft}
              >
                Kembali ke Radar
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => handleStageChange(1)}
                icon={RefreshCw}
              >
                Ulangi dari Tahap 1
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

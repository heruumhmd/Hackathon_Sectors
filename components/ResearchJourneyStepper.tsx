'use client'

import React from 'react'
import Link from 'next/link'
import {
  TrendingUp,
  FileText,
  Building2,
  Radar,
  Sparkles,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react'

export interface ResearchJourneyStepperProps {
  currentStep: 1 | 2 | 3 | 4
  ticker: string
  compact?: boolean
  className?: string
}

export function ResearchJourneyStepper({
  currentStep,
  ticker,
  compact = false,
  className = '',
}: ResearchJourneyStepperProps) {
  const cleanTicker = (ticker || 'BBCA').trim().toUpperCase()

  const steps = [
    {
      num: 1,
      title: 'Evaluasi Sinyal',
      sub: 'Intraday & Risiko',
      icon: TrendingUp,
      href: `/?ticker=${cleanTicker}`,
    },
    {
      num: 2,
      title: 'Akumulasi Broker',
      sub: 'Tabel Perbandingan',
      icon: Building2,
      href: `/saham/${cleanTicker}?tab=broker&flow=discover`,
    },
    {
      num: 3,
      title: 'Radar Pasar',
      sub: 'Katalis & Insider',
      icon: Radar,
      href: `/radar?ticker=${cleanTicker}&flow=discover`,
    },
    {
      num: 4,
      title: 'Asisten AI',
      sub: 'Sintesis & Keputusan',
      icon: Sparkles,
      href: `/asisten?symbol=${cleanTicker}&flow=discover`,
    },
  ]

  if (compact) {
    return (
      <div
        className={`flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 text-xs ${className}`}
      >
        {steps.map((s, idx) => {
          const isActive = s.num === currentStep
          const isDone = s.num < currentStep
          const Icon = s.icon

          return (
            <React.Fragment key={s.num}>
              <Link
                href={s.href}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-[var(--rasi-primary)] text-[var(--rasi-primary-text)] font-semibold shadow-xs'
                    : isDone
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                      : 'bg-[var(--surface-card)] text-[var(--rasi-muted)] border border-[var(--border-subtle)] hover:text-[var(--rasi-text)]'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                ) : (
                  <Icon className="h-3 w-3 shrink-0" />
                )}
                <span>
                  {s.num}. {s.title}
                </span>
              </Link>
              {idx < steps.length - 1 && (
                <ChevronRight className="h-3 w-3 text-[var(--rasi-muted)]/50 shrink-0" />
              )}
            </React.Fragment>
          )
        })}
      </div>
    )
  }

  return (
    <div
      className={`rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)]/90 backdrop-blur-md p-4 sm:p-5 shadow-[var(--rasi-card-shadow)] ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-[var(--border-subtle)] pb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--rasi-primary)]">
            Alur Riset Terpadu RASI
          </span>
          <h4 className="text-sm font-bold text-[var(--rasi-text)]">
            Panduan 4 Langkah Meneliti Saham <span className="font-mono text-[var(--rasi-primary)]">{cleanTicker}</span>
          </h4>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--rasi-muted)]">
          <span>
            Langkah <strong>{currentStep}</strong> dari <strong>4</strong>
          </span>
          <div className="w-24 h-1.5 rounded-full bg-[var(--rasi-muted-bg)] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[var(--rasi-primary)] to-[var(--rasi-accent)] transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {steps.map((s, idx) => {
          const isActive = s.num === currentStep
          const isDone = s.num < currentStep
          const Icon = s.icon

          return (
            <Link
              key={s.num}
              href={s.href}
              className={`group relative flex flex-col p-3 rounded-xl border transition-all ${
                isActive
                  ? 'border-[var(--rasi-primary)] bg-[var(--rasi-primary)]/10 shadow-sm ring-1 ring-[var(--rasi-primary)]/30'
                  : isDone
                    ? 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50'
                    : 'border-[var(--border-subtle)] bg-[var(--surface-card)] hover:border-[var(--rasi-border)] hover:bg-[var(--rasi-muted-bg)]/40'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold font-mono ${
                    isActive
                      ? 'bg-[var(--rasi-primary)] text-[var(--rasi-primary-text)]'
                      : isDone
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-[var(--rasi-muted-bg)] text-[var(--rasi-muted)]'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : s.num}
                </span>

                <Icon
                  className={`h-4 w-4 ${
                    isActive
                      ? 'text-[var(--rasi-primary)]'
                      : isDone
                        ? 'text-emerald-400'
                        : 'text-[var(--rasi-muted)] group-hover:text-[var(--rasi-text)]'
                  }`}
                />
              </div>

              <span
                className={`text-xs font-bold truncate ${
                  isActive
                    ? 'text-[var(--rasi-primary)]'
                    : isDone
                      ? 'text-emerald-400'
                      : 'text-[var(--rasi-text)]'
                }`}
              >
                {s.title}
              </span>
              <span className="text-[11px] text-[var(--rasi-muted)] truncate">{s.sub}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

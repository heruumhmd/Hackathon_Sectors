'use client'

import React from 'react'

import Link from 'next/link'

import { Building2, Check, ChevronRight, FileText, Radar, Sparkles, TrendingUp } from 'lucide-react'

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
        className={`no-scrollbar flex items-center gap-1.5 overflow-x-auto py-1 text-xs ${className}`}
      >
        {steps.map((s, idx) => {
          const isActive = s.num === currentStep
          const isDone = s.num < currentStep
          const Icon = s.icon

          return (
            <React.Fragment key={s.num}>
              <Link
                href={s.href}
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-[var(--rasi-primary)] font-semibold text-[var(--rasi-primary-text)] shadow-xs'
                    : isDone
                      ? 'border border-[var(--border-subtle)] bg-[var(--surface-card)] text-[var(--rasi-text)] shadow-xs hover:border-[var(--rasi-border)]'
                      : 'border border-[var(--border-subtle)] bg-[var(--surface-card)] text-[var(--rasi-muted)] hover:text-[var(--rasi-text)]'
                }`}
              >
                {isDone ? (
                  <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white dark:bg-emerald-600">
                    <Check className="h-2 w-2 stroke-[3]" />
                  </span>
                ) : (
                  <Icon className="h-3 w-3 shrink-0" />
                )}
                <span>
                  {s.num}. {s.title}
                </span>
              </Link>
              {idx < steps.length - 1 && (
                <ChevronRight className="h-3 w-3 shrink-0 text-[var(--rasi-muted)]/50" />
              )}
            </React.Fragment>
          )
        })}
      </div>
    )
  }

  return (
    <div
      className={`rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)]/90 p-4 shadow-[var(--rasi-card-shadow)] backdrop-blur-md sm:p-5 ${className}`}
    >
      <div className="mb-4 flex flex-col justify-between gap-3 border-b border-[var(--border-subtle)] pb-3 sm:flex-row sm:items-center">
        <div>
          <span className="text-[10px] font-bold tracking-wider text-[var(--rasi-primary)] uppercase">
            Alur Riset Terpadu RASI
          </span>
          <h4 className="text-sm font-bold text-[var(--rasi-text)]">
            Panduan 4 Langkah Meneliti Saham{' '}
            <span className="font-mono text-[var(--rasi-primary)]">{cleanTicker}</span>
          </h4>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--rasi-muted)]">
          <span>
            Langkah <strong>{currentStep}</strong> dari <strong>4</strong>
          </span>
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[var(--rasi-muted-bg)]">
            <div
              className="h-full bg-gradient-to-r from-[var(--rasi-primary)] to-[var(--rasi-accent)] transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {steps.map((s, idx) => {
          const isActive = s.num === currentStep
          const isDone = s.num < currentStep
          const Icon = s.icon

          return (
            <Link
              key={s.num}
              href={s.href}
              className={`group relative flex flex-col rounded-xl border p-3 transition-all ${
                isActive
                  ? 'border-[var(--rasi-primary)] bg-[var(--rasi-primary)]/10 shadow-sm ring-1 ring-[var(--rasi-primary)]/30'
                  : 'border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-xs hover:border-[var(--rasi-border)] hover:bg-[var(--rasi-muted-bg)]/40'
              }`}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-lg font-mono text-xs font-bold ${
                    isActive
                      ? 'bg-[var(--rasi-primary)] text-[var(--rasi-primary-text)]'
                      : isDone
                        ? 'bg-emerald-500 text-white shadow-xs dark:bg-emerald-600'
                        : 'bg-[var(--rasi-muted-bg)] text-[var(--rasi-muted)]'
                  }`}
                >
                  {isDone ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : s.num}
                </span>

                <Icon
                  className={`h-4 w-4 ${
                    isActive
                      ? 'text-[var(--rasi-primary)]'
                      : 'text-[var(--rasi-muted)] group-hover:text-[var(--rasi-text)]'
                  }`}
                />
              </div>

              <span
                className={`truncate text-xs font-bold ${
                  isActive ? 'text-[var(--rasi-primary)]' : 'text-[var(--rasi-text)]'
                }`}
              >
                {s.title}
              </span>
              <span className="truncate text-[11px] text-[var(--rasi-muted)]">{s.sub}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

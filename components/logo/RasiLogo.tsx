'use client'

import React from 'react'

import { RasiSymbol, type RasiSymbolProps } from './RasiSymbol'

export interface RasiLogoProps {
  layout?: 'horizontal' | 'vertical' | 'symbol-only' | 'wordmark-only'
  symbolSize?: RasiSymbolProps['size']
  variant?: RasiSymbolProps['variant']
  className?: string
  showTagline?: boolean
  animated?: boolean
  interactive?: boolean
  is3D?: boolean
  /** Render inside a 3D glassmorphic badge container */
  badge?: boolean
}

export function RasiLogo({
  layout = 'horizontal',
  symbolSize = 'md',
  variant = 'cyan',
  className = '',
  showTagline = false,
  animated = false,
  interactive = true,
  is3D = true,
  badge = false,
}: RasiLogoProps) {
  if (layout === 'symbol-only') {
    return (
      <RasiSymbol
        size={symbolSize}
        variant={variant}
        animated={animated}
        interactive={interactive}
        is3D={is3D}
        className={className}
      />
    )
  }

  const isVertical = layout === 'vertical'
  const isNavy = variant === 'navy'

  const content = (
    <div
      className={`inline-flex ${
        isVertical ? 'flex-col items-center text-center' : 'items-center gap-3.5'
      } ${className}`}
    >
      {layout !== 'wordmark-only' && (
        <RasiSymbol
          size={symbolSize}
          variant={variant}
          animated={animated}
          interactive={interactive}
          is3D={is3D}
          className={isVertical ? 'mb-2' : ''}
        />
      )}

      <div className={`flex flex-col leading-tight ${isVertical ? 'items-center' : 'items-start'}`}>
        <div className="flex items-center gap-1.5">
          <span
            className={`font-black tracking-[0.20em] text-lg select-none ${
              isNavy
                ? 'bg-gradient-to-b from-slate-900 via-slate-800 to-sky-950 bg-clip-text text-transparent'
                : variant === 'monochrome'
                  ? 'text-current'
                  : 'bg-gradient-to-b from-white via-sky-50 to-slate-300 dark:from-white dark:via-sky-100 dark:to-slate-300 bg-clip-text text-transparent drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]'
            }`}
          >
            RASI
          </span>
          {is3D && (
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--rasi-cyan)] shadow-[0_0_8px_var(--rasi-cyan)]" />
          )}
        </div>
        <span className="text-[10px] font-semibold tracking-[0.24em] text-[var(--rasi-muted)] uppercase select-none">
          Riset Saham Indonesia
        </span>
        {showTagline && (
          <span className="mt-1 font-mono text-[9px] tracking-wider text-[var(--rasi-cyan)] opacity-90 select-none">
            Data · Pattern · Insight
          </span>
        )}
      </div>
    </div>
  )

  if (badge) {
    return (
      <div className="inline-block rounded-2xl border border-sky-400/20 bg-gradient-to-b from-slate-900/80 to-slate-950/90 p-4 shadow-[0_8px_32px_rgba(2,6,23,0.6),inset_0_1px_1px_rgba(255,255,255,0.15)] backdrop-blur-md">
        {content}
      </div>
    )
  }

  return content
}

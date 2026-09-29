'use client'

import React, { useEffect, useState, useId, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, X } from 'lucide-react'

export type LoadingMode = 'text-collapse' | 'logo-reveal'

export interface RasiInitialLoadingProps {
  /** If true, forces the loading screen to display (e.g., for preview in Settings) */
  forceShow?: boolean
  /** Callback fired when loading animation finishes and overlay dismisses */
  onComplete?: () => void
  /** Which animation concept to run: 'logo-reveal' (default) or 'text-collapse' */
  mode?: LoadingMode
  /** Whether the user can manually close / dismiss the loading screen */
  allowSkip?: boolean
  /** Whether preview controls (replay, mode toggle) are shown */
  showControls?: boolean
}

/**
 * 26 Astronomical Data Points mapped between:
 * 1. Constellation S Cluster (Stock wave & S-symbol stage)
 * 2. Pure Minimalist Constellation Letters "R-A-S-I"
 */
interface AnimationPoint {
  id: string
  letter: {
    x: number
    y: number
    group: 'R' | 'A' | 'S' | 'I'
    isAlpha?: boolean
    r?: number
  }
  constellation: {
    x: number
    y: number
    isPrimary?: boolean
    r?: number
  }
}

const ANIMATION_POINTS: AnimationPoint[] = [
  // ── Letter 'R' (7 Nodes) ──
  { id: 'p-r1', letter: { x: 72, y: 70, group: 'R', r: 4.0 }, constellation: { x: 216, y: 79, r: 2.6 } },
  { id: 'p-r2', letter: { x: 72, y: 105, group: 'R', r: 3.4 }, constellation: { x: 160, y: 95, r: 2.2 } },
  { id: 'p-r3', letter: { x: 72, y: 140, group: 'R', r: 3.8 }, constellation: { x: 150, y: 40, r: 2.2 } },
  { id: 'p-r4', letter: { x: 106, y: 70, group: 'R', r: 3.4 }, constellation: { x: 145, y: 120, r: 2.2 } },
  { id: 'p-r5', letter: { x: 118, y: 88, group: 'R', r: 3.8 }, constellation: { x: 158, y: 160, r: 2.2 } },
  { id: 'p-r6', letter: { x: 106, y: 105, group: 'R', r: 3.4 }, constellation: { x: 180, y: 64, r: 2.4 } },
  { id: 'p-r7', letter: { x: 120, y: 140, group: 'R', r: 3.8 }, constellation: { x: 192, y: 130, r: 2.2 } },

  // ── Letter 'A' (5 Nodes) ──
  { id: 'p-a1', letter: { x: 140, y: 140, group: 'A', r: 3.8 }, constellation: { x: 176, y: 131, r: 2.4 } },
  { id: 'p-a2', letter: { x: 152, y: 110, group: 'A', r: 3.4 }, constellation: { x: 205, y: 165, r: 2.2 } },
  { id: 'p-a3', letter: { x: 165, y: 70, group: 'A', r: 4.4 }, constellation: { x: 215, y: 150, r: 2.2 } },
  { id: 'p-a4', letter: { x: 178, y: 110, group: 'A', r: 3.4 }, constellation: { x: 256, y: 38, r: 2.0 } },
  { id: 'p-a5', letter: { x: 190, y: 140, group: 'A', r: 3.8 }, constellation: { x: 225, y: 92, r: 2.4 } },

  // ── Letter 'S' (9 Nodes) ──
  { id: 'p-s1', letter: { x: 252, y: 70, group: 'S', r: 3.4 }, constellation: { x: 234, y: 43, r: 3.6 } },
  { id: 'p-s2', letter: { x: 236, y: 65, group: 'S', r: 3.4 }, constellation: { x: 202, y: 35, r: 4.0 } },
  { id: 'p-s3', letter: { x: 222, y: 75, group: 'S', r: 3.4 }, constellation: { x: 168, y: 51, r: 4.2 } },
  { id: 'p-s4', letter: { x: 218, y: 88, group: 'S', r: 3.4 }, constellation: { x: 158, y: 79, r: 3.8 } },
  { id: 'p-s5', letter: { x: 236, y: 105, group: 'S', r: 5.2 }, constellation: { x: 195, y: 95, isPrimary: true, r: 5.6 } }, // Focal Pivot
  { id: 'p-s6', letter: { x: 254, y: 118, group: 'S', r: 3.6 }, constellation: { x: 236, y: 110, r: 4.6 } },
  { id: 'p-s7', letter: { x: 250, y: 135, group: 'S', r: 3.6 }, constellation: { x: 228, y: 139, r: 3.8 } },
  { id: 'p-s8', letter: { x: 236, y: 145, group: 'S', r: 3.4 }, constellation: { x: 192, y: 155, r: 4.0 } },
  { id: 'p-s9', letter: { x: 218, y: 138, group: 'S', r: 3.4 }, constellation: { x: 164, y: 144, r: 3.4 } },

  // ── Letter 'I' (5 Nodes) ──
  { id: 'p-i1', letter: { x: 306, y: 70, group: 'I', r: 3.8 }, constellation: { x: 244, y: 61, r: 2.4 } },
  { id: 'p-i2', letter: { x: 306, y: 88, group: 'I', r: 3.4 }, constellation: { x: 242, y: 125, r: 2.2 } },
  { id: 'p-i3', letter: { x: 306, y: 105, group: 'I', r: 3.4 }, constellation: { x: 210, y: 168, r: 2.0 } },
  { id: 'p-i4', letter: { x: 306, y: 122, group: 'I', r: 3.4 }, constellation: { x: 130, y: 90, r: 2.2 } },
  { id: 'p-i5', letter: { x: 306, y: 140, group: 'I', r: 3.8 }, constellation: { x: 120, y: 130, r: 2.0 } },
]

// Constellation S main path passing through official nodes n0 -> n1 -> n2 -> n3 -> n4 -> n5 -> n6 -> n7 -> n8
const S_CONSTELLATION_PATH_D =
  'M 234 43 L 202 35 L 168 51 L 158 79 L 195 95 L 236 110 L 228 139 L 192 155 L 164 144'
const S_ASTERISM_D =
  'M 252 70 L 236 65 L 222 75 L 218 88 L 236 105 L 254 118 L 250 135 L 236 145 L 218 138'

// Satellite filaments for S-constellation
const S_SATELLITE_LINES = [
  { x1: 234, y1: 43, x2: 244, y2: 61 },
  { x1: 195, y1: 95, x2: 216, y2: 79 },
  { x1: 164, y1: 144, x2: 176, y2: 131 },
]

/**
 * Clean, Precision Geometric Lines for Letters R, A, and I
 * All line coordinates strictly connect the nodes at their exact centers.
 */
const LETTER_LINES = [
  // ── Letter 'R' ──
  { id: 'r-stem', d: 'M 72 70 L 72 140', delay: 0.0 }, // Spine
  { id: 'r-loop', d: 'M 72 70 L 106 70 L 118 88 L 106 105 L 72 105', delay: 0.08 }, // Loop
  { id: 'r-leg', d: 'M 72 105 L 120 140', delay: 0.16 }, // Leg

  // ── Letter 'A' ──
  { id: 'a-left', d: 'M 140 140 L 165 70', delay: 0.04 }, // Left diagonal
  { id: 'a-right', d: 'M 165 70 L 190 140', delay: 0.12 }, // Right diagonal
  { id: 'a-bar', d: 'M 152 110 L 178 110', delay: 0.2 }, // Crossbar

  // ── Letter 'I' ──
  { id: 'i-stem', d: 'M 306 70 L 306 140', delay: 0.1 }, // Solid vertical column
]

/**
 * Dynamic Celestial "Cling-Cling" Starlight Sparkles
 * Staggered glints that periodically twinkle across the letters like living celestial stars
 */
const RASI_SPARKLES = [
  { id: 'sp-r-top', x: 72, y: 70, size: 6.5, delay: 0.2 }, // R spine top
  { id: 'sp-r-apex', x: 118, y: 88, size: 8.0, delay: 0.8 }, // R loop apex
  { id: 'sp-r-foot', x: 120, y: 140, size: 6.5, delay: 1.5 }, // R leg foot
  { id: 'sp-a-apex', x: 165, y: 70, size: 9.0, delay: 0.4 }, // A crown apex
  { id: 'sp-a-cross', x: 152, y: 110, size: 6.0, delay: 1.1 }, // A crossbar junction
  { id: 'sp-a-foot', x: 190, y: 140, size: 6.5, delay: 1.8 }, // A right foot
  { id: 'sp-s-crest', x: 252, y: 70, size: 6.5, delay: 0.6 }, // S upper crest
  { id: 'sp-s-pivot', x: 236, y: 105, size: 10.0, delay: 0.1 }, // S focal breakout pivot
  { id: 'sp-s-curve', x: 250, y: 135, size: 6.5, delay: 1.3 }, // S lower sweep
  { id: 'sp-i-top', x: 306, y: 70, size: 7.5, delay: 0.9 }, // I crown
  { id: 'sp-i-base', x: 306, y: 140, size: 6.5, delay: 1.7 }, // I base anchor
]

const S_LOGO_SPARKLES = [
  { id: 'sp-s-pivot', x: 195, y: 95, size: 10.5, delay: 0.1 }, // Focal breakout pivot
  { id: 'sp-s-top', x: 234, y: 43, size: 7.0, delay: 0.5 }, // Top of S
  { id: 'sp-s-ingress', x: 168, y: 51, size: 6.5, delay: 1.1 }, // Upper inflection
  { id: 'sp-s-sweep', x: 236, y: 110, size: 7.0, delay: 1.6 }, // Mid acceleration
  { id: 'sp-s-bottom', x: 164, y: 144, size: 7.0, delay: 0.8 }, // Bottom sweep
]

export function RasiInitialLoading({
  forceShow = false,
  onComplete,
  mode = 'logo-reveal',
  allowSkip = true,
  showControls = false,
}: RasiInitialLoadingProps) {
  const [activeMode, setActiveMode] = useState<LoadingMode>(mode)
  const [visible, setVisible] = useState<boolean>(true)
  const [stage, setStage] = useState<number>(1)
  const [animTrigger, setAnimTrigger] = useState(0)
  const idSuffix = useId().replace(/:/g, '')

  const dismiss = useCallback(() => {
    setVisible(false)
    onComplete?.()
  }, [onComplete])

  const replay = useCallback((newMode?: LoadingMode) => {
    if (newMode) setActiveMode(newMode)
    setStage(1)
    setAnimTrigger((v) => v + 1)
  }, [])

  useEffect(() => {
    if (!visible) return

    const timers: NodeJS.Timeout[] = []

    if (activeMode === 'logo-reveal') {
      timers.push(setTimeout(() => setStage(2), 1200))
      timers.push(
        setTimeout(() => {
          if (!forceShow) {
            dismiss()
          }
        }, 2600)
      )
    } else {
      timers.push(setTimeout(() => setStage(2), 600))
      timers.push(
        setTimeout(() => {
          if (!forceShow) {
            dismiss()
          }
        }, 1600)
      )
    }

    return () => {
      timers.forEach((t) => clearTimeout(t))
    }
  }, [visible, activeMode, forceShow, dismiss, animTrigger])

  const getPointCoords = (pt: AnimationPoint) => {
    if (stage >= 2) {
      return pt.letter
    }
    return pt.constellation
  }

  const isRasiTextActive = stage >= 2
  const isSConstellationActive = stage === 1

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="rasi-initial-loading-overlay"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02, filter: 'blur(6px)' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#02050c] text-white select-none overflow-hidden"
          role="dialog"
          aria-label="Memuat aplikasi RASI"
        >
          {/* Clean, Subtle Dark Gradient Backdrop */}
          <div className="pointer-events-none absolute inset-0 z-0">
            {/* Soft Ambient Cyan Glow (Minimalist, No Clutter) */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(14,165,233,0.12)_0%,transparent_65%)]" />
          </div>

          {/* Top Controls / Header */}
          <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
            {showControls && (
              <div className="flex items-center gap-1 rounded-full border border-slate-800 bg-slate-950/80 p-1 text-xs backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => replay('logo-reveal')}
                  className={`rounded-full px-3 py-1 font-medium transition-colors ${
                    activeMode === 'logo-reveal'
                      ? 'bg-sky-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Logo S → Teks RASI
                </button>
                <button
                  type="button"
                  onClick={() => replay()}
                  title="Putar Ulang"
                  className="flex items-center gap-1 rounded-full px-2.5 py-1 text-slate-400 hover:text-white"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span className="hidden sm:inline">Ulang</span>
                </button>
              </div>
            )}

            {allowSkip && (
              <button
                type="button"
                onClick={dismiss}
                className="flex items-center gap-1 rounded-full border border-slate-800/80 bg-slate-900/60 px-3.5 py-1.5 text-xs font-semibold text-slate-300 backdrop-blur-md transition hover:border-sky-500/50 hover:bg-slate-800 hover:text-white focus-visible:outline-none"
              >
                <span>Lewati</span>
                <X className="h-3.5 w-3.5 text-slate-400" />
              </button>
            )}
          </div>

          {/* Central Stage / Canvas */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative h-[220px] w-[340px] sm:h-[260px] sm:w-[440px]">
              <svg
                viewBox="0 0 400 220"
                className="h-full w-full overflow-visible"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  {/* Clean 3D Volumetric Spherical Gradient for Data Nodes */}
                  <radialGradient
                    id={`node-sphere-grad-${idSuffix}`}
                    cx="34%"
                    cy="28%"
                    r="68%"
                    fx="28%"
                    fy="22%"
                  >
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="25%" stopColor="#bae6fd" />
                    <stop offset="55%" stopColor="#38bdf8" />
                    <stop offset="85%" stopColor="#0284c7" />
                    <stop offset="100%" stopColor="#072b4f" />
                  </radialGradient>

                  {/* Soft Radiant Glow Aura for Beacon */}
                  <radialGradient id={`beacon-glow-${idSuffix}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.7" />
                    <stop offset="50%" stopColor="#0ea5e9" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
                  </radialGradient>

                  {/* Celestial Cling Sparkle Gradient */}
                  <radialGradient id={`sparkle-glow-${idSuffix}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                    <stop offset="35%" stopColor="#38bdf8" stopOpacity="0.7" />
                    <stop offset="70%" stopColor="#0ea5e9" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* ══════════════════════════════════════════════════════════
                    LAYER 0: MACRO ASTROLABE CELESTIAL HORIZON & ORBITAL RINGS
                    Mathematical cosmic framework anchoring the constellation field
                    ══════════════════════════════════════════════════════════ */}
                <g className="pointer-events-none">
                  {/* Outer Horizon Ring (r=155) with Slow Clockwise Drift */}
                  <motion.circle
                    cx={200}
                    cy={105}
                    r={155}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="0.65"
                    strokeDasharray="4 6"
                    opacity={0.16}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
                    style={{ transformOrigin: '200px 105px' }}
                  />

                  {/* Mid Celestial Coordinate Ring (r=125) */}
                  <circle
                    cx={200}
                    cy={105}
                    r={125}
                    fill="none"
                    stroke="#0ea5e9"
                    strokeWidth="0.5"
                    strokeDasharray="2 5"
                    opacity={0.18}
                  />

                  {/* Ecliptic Coordinate Orbit (Inclination -18 deg) */}
                  <ellipse
                    cx={200}
                    cy={105}
                    rx={145}
                    ry={46}
                    transform="rotate(-18 200 105)"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="0.75"
                    strokeDasharray="5 4"
                    opacity={0.25}
                  />

                  {/* Polar Coordinate Orbit (Inclination +28 deg) */}
                  <ellipse
                    cx={200}
                    cy={105}
                    rx={140}
                    ry={42}
                    transform="rotate(28 200 105)"
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="0.65"
                    strokeDasharray="3 5"
                    opacity={0.22}
                  />

                  {/* Cardinal Axis Compass Coordinate Ticks */}
                  <g stroke="#38bdf8" strokeWidth="0.8" opacity="0.3">
                    <line x1={200} y1={8} x2={200} y2={18} />
                    <line x1={200} y1={192} x2={200} y2={202} />
                    <line x1={45} y1={105} x2={55} y2={105} />
                    <line x1={345} y1={105} x2={355} y2={105} />
                  </g>

                  {/* Dynamic Concentric Harmonic Breakout Pulse Waves (Tracking the Pivot Star) */}
                  <motion.g
                    animate={{
                      x: stage >= 2 ? 236 : 195,
                      y: stage >= 2 ? 105 : 95,
                    }}
                    transition={{ duration: 0.75, ease: [0.25, 0.1, 0.25, 1] }}
                  >
                    {/* Ripple 1: Inner High-Frequency Pulse */}
                    <motion.circle
                      cx={0}
                      cy={0}
                      r={10}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="0.85"
                      strokeDasharray="2 2"
                      animate={{ scale: [1, 1.25, 1], opacity: [0.75, 0.3, 0.75] }}
                      transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    {/* Ripple 2: Mid Harmonic Expansion Wave */}
                    <motion.circle
                      cx={0}
                      cy={0}
                      r={18}
                      fill="none"
                      stroke="#0ea5e9"
                      strokeWidth="0.65"
                      strokeDasharray="3 3"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.55, 0.18, 0.55] }}
                      transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
                    />
                    {/* Ripple 3: Outer Macro Resonance Ring */}
                    <motion.circle
                      cx={0}
                      cy={0}
                      r={28}
                      fill="none"
                      stroke="#0284c7"
                      strokeWidth="0.5"
                      strokeDasharray="2 5"
                      animate={{ scale: [1, 1.35, 1], opacity: [0.4, 0.1, 0.4] }}
                      transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
                    />
                  </motion.g>

                  {/* Stage 2 Local Micro-Orbital Rings on Key Letter Crowns */}
                  <motion.g
                    animate={{ opacity: isRasiTextActive ? 1 : 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    {/* Letter R: Loop Apex Micro-Orbit */}
                    <ellipse
                      cx={118}
                      cy={88}
                      rx={9}
                      ry={4.5}
                      transform="rotate(-15 118 88)"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="0.6"
                      strokeDasharray="1.5 2"
                      opacity={0.4}
                    />

                    {/* Letter A: Dual Halo Crown Rings */}
                    <circle
                      cx={165}
                      cy={70}
                      r={8}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="0.6"
                      strokeDasharray="2 2"
                      opacity={0.45}
                    />
                    <circle
                      cx={165}
                      cy={70}
                      r={14}
                      fill="none"
                      stroke="#0ea5e9"
                      strokeWidth="0.45"
                      strokeDasharray="2 4"
                      opacity={0.3}
                    />

                    {/* Letter I: Antenna Cap Micro-Orbit */}
                    <ellipse
                      cx={306}
                      cy={70}
                      rx={8.5}
                      ry={3.8}
                      transform="rotate(12 306 70)"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="0.6"
                      strokeDasharray="1.5 2"
                      opacity={0.4}
                    />
                  </motion.g>
                </g>

                {/* S-CONSTELLATION CONTAINER */}
                <motion.g
                  animate={{ rotate: 0, scale: 1.0 }}
                  transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transformOrigin: '200px 100px' }}
                >
                  {/* Satellite Filaments (Stage 1 only) */}
                  <motion.g
                    animate={{ opacity: isSConstellationActive ? 1 : 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    {S_SATELLITE_LINES.map((sat, idx) => (
                      <line
                        key={`sat-line-${idx}`}
                        x1={sat.x1}
                        y1={sat.y1}
                        x2={sat.x2}
                        y2={sat.y2}
                        stroke="#38bdf8"
                        strokeWidth="0.8"
                        strokeDasharray="2 2"
                        strokeOpacity="0.45"
                      />
                    ))}
                  </motion.g>

                  {/* Main S-Constellation Path (Smoothly morphs into Letter S) */}
                  {/* Underglow */}
                  <motion.path
                    stroke="#0284c7"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeOpacity="0.35"
                    initial={{ pathLength: 0, opacity: 0, d: S_CONSTELLATION_PATH_D }}
                    animate={{
                      pathLength: 1,
                      opacity: 0.6,
                      d: stage >= 2 ? S_ASTERISM_D : S_CONSTELLATION_PATH_D,
                    }}
                    transition={{
                      pathLength: { duration: 0.65, ease: [0.25, 0.1, 0.25, 1] },
                      opacity: { duration: 0.4 },
                      d: { duration: 0.75, ease: [0.25, 0.1, 0.25, 1] },
                    }}
                  />
                  {/* Core Sharp Cyan Laser */}
                  <motion.path
                    stroke="#38bdf8"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0, opacity: 0, d: S_CONSTELLATION_PATH_D }}
                    animate={{
                      pathLength: 1,
                      opacity: 1,
                      d: stage >= 2 ? S_ASTERISM_D : S_CONSTELLATION_PATH_D,
                    }}
                    transition={{
                      pathLength: { duration: 0.65, ease: [0.25, 0.1, 0.25, 1] },
                      opacity: { duration: 0.4 },
                      d: { duration: 0.75, ease: [0.25, 0.1, 0.25, 1] },
                    }}
                  />

                  {/* GEOMETRIC ASTERISM LINES FOR R, A, AND I (Stage 2) */}
                  <motion.g
                    animate={{ opacity: isRasiTextActive ? 1 : 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  >
                    {LETTER_LINES.map((line) => (
                      <React.Fragment key={line.id}>
                        {/* Soft Outer Bloom */}
                        <motion.path
                          d={line.d}
                          stroke="#0284c7"
                          strokeWidth="4.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeOpacity="0.35"
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{
                            pathLength: isRasiTextActive ? 1 : 0,
                            opacity: isRasiTextActive ? 0.6 : 0,
                          }}
                          transition={{
                            duration: 0.6,
                            delay: isRasiTextActive ? line.delay : 0,
                            ease: [0.25, 0.1, 0.25, 1],
                          }}
                        />
                        {/* Core Cyan Filament */}
                        <motion.path
                          d={line.d}
                          stroke="#38bdf8"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{
                            pathLength: isRasiTextActive ? 1 : 0,
                            opacity: isRasiTextActive ? 1 : 0,
                          }}
                          transition={{
                            duration: 0.6,
                            delay: isRasiTextActive ? line.delay : 0,
                            ease: [0.25, 0.1, 0.25, 1],
                          }}
                        />
                      </React.Fragment>
                    ))}
                  </motion.g>

                  {/* 26 CONSTELLATION DATA NODES */}
                  {ANIMATION_POINTS.map((pt, idx) => {
                    const pos = getPointCoords(pt)
                    const isCrown = pt.constellation.isPrimary
                    const radius = isCrown ? 5.2 : pt.letter.r || 3.4

                    return (
                      <motion.g
                        key={pt.id}
                        animate={{
                          x: pos.x,
                          y: pos.y,
                        }}
                        transition={{
                          duration: 0.75,
                          ease: [0.25, 0.1, 0.25, 1],
                          delay: stage >= 2 ? (idx % 6) * 0.02 : 0,
                        }}
                      >
                        {/* Focal Star Pulsing Cyan Ring */}
                        {isCrown && (
                          <motion.circle
                            cx={0}
                            cy={0}
                            r={radius * 1.8}
                            fill="none"
                            stroke="#38bdf8"
                            strokeWidth="1"
                            strokeDasharray="2.5 2.5"
                            animate={{
                              scale: [1, 1.25, 1],
                              opacity: [0.7, 0.25, 0.7],
                            }}
                            transition={{
                              duration: 2.8,
                              repeat: Infinity,
                              ease: 'easeInOut',
                            }}
                          />
                        )}

                        {/* Subtle Glow Aura */}
                        <circle
                          cx={0}
                          cy={0}
                          r={radius * 1.6}
                          fill={`url(#beacon-glow-${idSuffix})`}
                          opacity="0.75"
                        />

                        {/* Volumetric 3D Cyan Sphere */}
                        <circle
                          cx={0}
                          cy={0}
                          r={radius}
                          fill={`url(#node-sphere-grad-${idSuffix})`}
                          stroke="#38bdf8"
                          strokeWidth="0.8"
                        />

                        {/* Micro Specular Highlight */}
                        <circle
                          cx={-radius * 0.28}
                          cy={-radius * 0.28}
                          r={radius * 0.3}
                          fill="#ffffff"
                          opacity="0.9"
                        />
                      </motion.g>
                    )
                  })}

                  {/* ══════════════════════════════════════════════════════════
                      DYNAMIC CELESTIAL "CLING-CLING" TWINKLE SPARKLES
                      Periodically glints on key nodes like living celestial stars
                      ══════════════════════════════════════════════════════════ */}
                  {/* Stage 1: S Logo Sparkles */}
                  {isSConstellationActive &&
                    S_LOGO_SPARKLES.map((sp) => (
                      <motion.g
                        key={sp.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{
                          scale: [0, 1.25, 0.85, 0],
                          opacity: [0, 1, 0.8, 0],
                          rotate: [0, 30, 60, 90],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          repeatDelay: 1.6,
                          delay: sp.delay,
                          ease: 'easeInOut',
                        }}
                        style={{ transformOrigin: `${sp.x}px ${sp.y}px` }}
                        className="pointer-events-none"
                      >
                        <circle
                          cx={sp.x}
                          cy={sp.y}
                          r={sp.size * 1.4}
                          fill={`url(#sparkle-glow-${idSuffix})`}
                        />
                        {/* Slender Outer Cyan Needle Glint */}
                        <path
                          d={`M ${sp.x} ${sp.y - sp.size} 
                              Q ${sp.x} ${sp.y} ${sp.x + sp.size} ${sp.y} 
                              Q ${sp.x} ${sp.y} ${sp.x} ${sp.y + sp.size} 
                              Q ${sp.x} ${sp.y} ${sp.x - sp.size} ${sp.y} 
                              Z`}
                          fill="#38bdf8"
                          opacity="0.9"
                        />
                        {/* Incandescent White Center Glint */}
                        <path
                          d={`M ${sp.x} ${sp.y - sp.size * 0.55} 
                              Q ${sp.x} ${sp.y} ${sp.x + sp.size * 0.55} ${sp.y} 
                              Q ${sp.x} ${sp.y} ${sp.x} ${sp.y + sp.size * 0.55} 
                              Q ${sp.x} ${sp.y} ${sp.x - sp.size * 0.55} ${sp.y} 
                              Z`}
                          fill="#ffffff"
                        />
                        <circle cx={sp.x} cy={sp.y} r={1.2} fill="#ffffff" />
                      </motion.g>
                    ))}

                  {/* Stage 2: RASI Constellation Letters Sparkles */}
                  {isRasiTextActive &&
                    RASI_SPARKLES.map((sp) => (
                      <motion.g
                        key={sp.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{
                          scale: [0, 1.25, 0.85, 0],
                          opacity: [0, 1, 0.8, 0],
                          rotate: [0, 30, 60, 90],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          repeatDelay: 1.8,
                          delay: sp.delay,
                          ease: 'easeInOut',
                        }}
                        style={{ transformOrigin: `${sp.x}px ${sp.y}px` }}
                        className="pointer-events-none"
                      >
                        <circle
                          cx={sp.x}
                          cy={sp.y}
                          r={sp.size * 1.4}
                          fill={`url(#sparkle-glow-${idSuffix})`}
                        />
                        {/* Slender Outer Cyan Needle Glint */}
                        <path
                          d={`M ${sp.x} ${sp.y - sp.size} 
                              Q ${sp.x} ${sp.y} ${sp.x + sp.size} ${sp.y} 
                              Q ${sp.x} ${sp.y} ${sp.x} ${sp.y + sp.size} 
                              Q ${sp.x} ${sp.y} ${sp.x - sp.size} ${sp.y} 
                              Z`}
                          fill="#38bdf8"
                          opacity="0.9"
                        />
                        {/* Incandescent White Center Glint */}
                        <path
                          d={`M ${sp.x} ${sp.y - sp.size * 0.55} 
                              Q ${sp.x} ${sp.y} ${sp.x + sp.size * 0.55} ${sp.y} 
                              Q ${sp.x} ${sp.y} ${sp.x} ${sp.y + sp.size * 0.55} 
                              Q ${sp.x} ${sp.y} ${sp.x - sp.size * 0.55} ${sp.y} 
                              Z`}
                          fill="#ffffff"
                        />
                        <circle cx={sp.x} cy={sp.y} r={1.2} fill="#ffffff" />
                      </motion.g>
                    ))}
                </motion.g>
              </svg>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

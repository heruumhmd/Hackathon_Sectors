'use client'

import React, { useState, useId } from 'react'

import {
  RASI_CONSTELLATION_NODES,
  RASI_SATELLITE_NODES,
  RASI_PATH_D,
  RASI_HERO_STAR,
  RASI_3D_ORBIT,
  RASI_GYRO_RINGS,
  RASI_LOCAL_ORBITS,
  RASI_SYMBOL_SPARKLES,
} from './constants'

export {
  RASI_CONSTELLATION_NODES,
  RASI_SATELLITE_NODES,
  RASI_PATH_D,
  RASI_HERO_STAR,
  RASI_3D_ORBIT,
  RASI_GYRO_RINGS,
  RASI_LOCAL_ORBITS,
  RASI_SYMBOL_SPARKLES,
}

export interface RasiSymbolProps {
  /** Size preset or exact pixel width */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number
  /** Additional CSS class names */
  className?: string
  /** Whether the symbol has an ambient breathing / floating 3D animation */
  animated?: boolean
  /** Color theme variant */
  variant?: 'cyan' | 'white' | 'monochrome' | 'navy'
  /** Enable interactive 3D perspective tilt on cursor movement (default: true) */
  interactive?: boolean
  /** Whether to render full volumetric 3D shaders and lighting (default: true) */
  is3D?: boolean
  /** Show 3D isometric orbital ring around the breakout pivot (default: true) */
  showOrbits?: boolean
}

const SIZE_MAP: Record<string, number> = {
  xs: 18,
  sm: 24,
  md: 36,
  lg: 48,
  xl: 72,
  '2xl': 96,
}

export function RasiSymbol({
  size = 'md',
  className = '',
  animated = false,
  variant = 'cyan',
  interactive = true,
  is3D = true,
  showOrbits = true,
}: RasiSymbolProps) {
  const pixelSize = typeof size === 'number' ? size : SIZE_MAP[size] || 36
  const rawId = useId()
  const id = rawId.replace(/[^a-zA-Z0-9]/g, '')

  // 3D Interactive Mouse-tilt state
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, isHovered: false })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive) return
    const rect = e.currentTarget.getBoundingClientRect()
    if (!rect.width || !rect.height) return
    // Relative coordinates (-0.5 to 0.5)
    const normX = (e.clientX - rect.left) / rect.width - 0.5
    const normY = (e.clientY - rect.top) / rect.height - 0.5
    // Max 10 deg rotation in X & Y
    setTilt({
      rx: -normY * 12,
      ry: normX * 12,
      isHovered: true,
    })
  }

  const handleMouseLeave = () => {
    if (!interactive) return
    setTilt({ rx: 0, ry: 0, isHovered: false })
  }

  // Color tokens per variant
  const isCyan = variant === 'cyan'
  const isWhite = variant === 'white'
  const isNavy = variant === 'navy'
  const isMono = variant === 'monochrome'

  // Tube colors
  const tubeBaseColor = isMono
    ? 'currentColor'
    : isNavy
      ? '#080f1e'
      : `url(#rasi-3d-tube-base-${id})`

  const tubeCoreColor = isMono
    ? 'currentColor'
    : isNavy
      ? '#0284c7'
      : `url(#rasi-3d-tube-core-${id})`

  const tubeSpecularColor = isMono
    ? 'currentColor'
    : isNavy
      ? '#38bdf8'
      : `url(#rasi-3d-tube-specular-${id})`

  // Sphere fills
  const sphereFill = isMono
    ? 'currentColor'
    : isNavy
      ? `url(#rasi-3d-sphere-navy-${id})`
      : isWhite
        ? `url(#rasi-3d-sphere-white-${id})`
        : `url(#rasi-3d-sphere-cyan-${id})`

  const haloColor = isMono
    ? 'currentColor'
    : isNavy
      ? '#0284c7'
      : isWhite
        ? '#ffffff'
        : '#38bdf8'

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        width: pixelSize,
        height: (pixelSize * 120) / 100,
        perspective: interactive ? '600px' : undefined,
      }}
      className={`inline-block shrink-0 select-none ${interactive ? 'cursor-pointer' : ''} ${className}`}
    >
      <div
        style={{
          transform: tilt.isHovered
            ? `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateZ(4px) scale(1.04)`
            : undefined,
          transition: tilt.isHovered
            ? 'transform 0.12s ease-out'
            : 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
          transformStyle: 'preserve-3d',
        }}
        className={`w-full h-full ${animated ? 'animate-rasi-3d-float' : ''}`}
      >
        <svg
          viewBox="0 0 100 120"
          width="100%"
          height="100%"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="overflow-visible"
          aria-hidden="true"
        >
          <defs>
            {/* ── 1. Soft Ambient Depth Filter ── */}
            <filter id={`rasi-shadow-${id}`} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="1.6" />
              <feOffset dx="0.8" dy="2.2" result="offsetblur" />
              <feFlood floodColor="#020617" floodOpacity="0.45" />
              <feComposite in2="offsetblur" operator="in" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* ── 2. 3D Volumetric Tube Gradients ── */}
            {/* Base outer cylinder body (provides curvature & dark underside) */}
            <linearGradient
              id={`rasi-3d-tube-base-${id}`}
              x1="20"
              y1="14"
              x2="80"
              y2="106"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.85" />
              <stop offset="30%" stopColor="#0369a1" stopOpacity="0.95" />
              <stop offset="55%" stopColor="#075985" stopOpacity="1" />
              <stop offset="80%" stopColor="#0284c7" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0c4a6e" stopOpacity="0.85" />
            </linearGradient>

            {/* Core luminous neon tube (clean cyan energy conduit) */}
            <linearGradient
              id={`rasi-3d-tube-core-${id}`}
              x1="20"
              y1="14"
              x2="80"
              y2="106"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.95" />
              <stop offset="42%" stopColor="#bae6fd" stopOpacity="1" />
              <stop offset="65%" stopColor="#38bdf8" stopOpacity="1" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.9" />
            </linearGradient>

            {/* Top specular ridge line (studio light highlight) */}
            <linearGradient
              id={`rasi-3d-tube-specular-${id}`}
              x1="20"
              y1="14"
              x2="80"
              y2="106"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
              <stop offset="45%" stopColor="#ffffff" stopOpacity="0.85" />
              <stop offset="85%" stopColor="#bae6fd" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.2" />
            </linearGradient>

            {/* ── 3. 3D Volumetric Spherical Gradients for Nodes ── */}
            {/* Signature Cyan Sphere */}
            <radialGradient
              id={`rasi-3d-sphere-cyan-${id}`}
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

            {/* Platinum White Luxury Sphere */}
            <radialGradient
              id={`rasi-3d-sphere-white-${id}`}
              cx="34%"
              cy="28%"
              r="68%"
              fx="28%"
              fy="22%"
            >
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="28%" stopColor="#f8fafc" />
              <stop offset="60%" stopColor="#e2e8f0" />
              <stop offset="85%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#334155" />
            </radialGradient>

            {/* Executive Navy / Light Theme Sphere */}
            <radialGradient
              id={`rasi-3d-sphere-navy-${id}`}
              cx="34%"
              cy="28%"
              r="68%"
              fx="28%"
              fy="22%"
            >
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="35%" stopColor="#0ea5e9" />
              <stop offset="70%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#080f1e" />
            </radialGradient>

            {/* ── 4. Radiant Beacon Glow Aura ── */}
            <radialGradient id={`rasi-star-glow-${id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={haloColor} stopOpacity="0.65" />
              <stop offset="50%" stopColor={haloColor} stopOpacity="0.18" />
              <stop offset="100%" stopColor={haloColor} stopOpacity="0" />
            </radialGradient>

            {/* Subtle Node Halo */}
            <radialGradient id={`rasi-node-halo-${id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={haloColor} stopOpacity="0.45" />
              <stop offset="60%" stopColor={haloColor} stopOpacity="0.12" />
              <stop offset="100%" stopColor={haloColor} stopOpacity="0" />
            </radialGradient>

            {/* ── 5. 3D Isometric Orbital Plane Gradient ── */}
            <linearGradient
              id={`rasi-orbit-grad-${id}`}
              x1="30"
              y1="55"
              x2="62"
              y2="65"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* ══════════════════════════════════════════════════════════════
              LAYER 1: 3D FINANCIAL PERSPECTIVE CHART GRID
              ══════════════════════════════════════════════════════════════ */}
          {is3D && (
            <g opacity="0.15" stroke="currentColor" strokeWidth="0.5">
              <line x1="16" y1="20" x2="84" y2="20" strokeDasharray="2 3" />
              <line x1="16" y1="60" x2="84" y2="60" strokeDasharray="2 3" />
              <line x1="16" y1="100" x2="84" y2="100" strokeDasharray="2 3" />
            </g>
          )}

          {/* ══════════════════════════════════════════════════════════════
              LAYER 2: SATELLITE TETHER STRUTS
              ══════════════════════════════════════════════════════════════ */}
          <g opacity="0.28" stroke="currentColor" strokeWidth="0.65" strokeDasharray="1.5 2">
            <line x1="76" y1="20" x2="84" y2="34" />
            <line x1="46" y1="60" x2="62" y2="48" />
            <line x1="22" y1="98" x2="32" y2="88" />
          </g>

          {/* ══════════════════════════════════════════════════════════════
              LAYER 3: 3D MULTI-AXIS GYROSCOPIC ORBITAL RINGS & ASTROLABE
              ══════════════════════════════════════════════════════════════ */}
          {is3D && showOrbits && (
            <g>
              {/* Astrolabe Horizon Outer Ring (r=28) */}
              <circle
                cx={RASI_GYRO_RINGS.outerAstrolabe.cx}
                cy={RASI_GYRO_RINGS.outerAstrolabe.cy}
                r={RASI_GYRO_RINGS.outerAstrolabe.rx}
                fill="none"
                stroke={isCyan ? '#38bdf8' : isNavy ? '#0284c7' : '#ffffff'}
                strokeWidth="0.5"
                strokeDasharray="2.5 4.5"
                opacity="0.32"
                className="animate-rasi-orbit-cw"
              />

              {/* Gyroscope Ring 1: Ecliptic Orbit (-22 deg) */}
              <ellipse
                cx={RASI_GYRO_RINGS.primary.cx}
                cy={RASI_GYRO_RINGS.primary.cy}
                rx={RASI_GYRO_RINGS.primary.rx}
                ry={RASI_GYRO_RINGS.primary.ry}
                transform={`rotate(${RASI_GYRO_RINGS.primary.rotation} ${RASI_GYRO_RINGS.primary.cx} ${RASI_GYRO_RINGS.primary.cy})`}
                fill="none"
                stroke={`url(#rasi-orbit-grad-${id})`}
                strokeWidth="0.85"
                strokeDasharray="2.5 2.5"
                opacity="0.85"
              />

              {/* Gyroscope Ring 2: Polar Crossed Orbit (+32 deg) */}
              <ellipse
                cx={RASI_GYRO_RINGS.secondary.cx}
                cy={RASI_GYRO_RINGS.secondary.cy}
                rx={RASI_GYRO_RINGS.secondary.rx}
                ry={RASI_GYRO_RINGS.secondary.ry}
                transform={`rotate(${RASI_GYRO_RINGS.secondary.rotation} ${RASI_GYRO_RINGS.secondary.cx} ${RASI_GYRO_RINGS.secondary.cy})`}
                fill="none"
                stroke={`url(#rasi-orbit-grad-${id})`}
                strokeWidth="0.75"
                strokeDasharray="1.5 3"
                opacity="0.65"
              />

              {/* Gyroscope Ring 3: Meridian Crossed Orbit (-65 deg) */}
              <ellipse
                cx={RASI_GYRO_RINGS.tertiary.cx}
                cy={RASI_GYRO_RINGS.tertiary.cy}
                rx={RASI_GYRO_RINGS.tertiary.rx}
                ry={RASI_GYRO_RINGS.tertiary.ry}
                transform={`rotate(${RASI_GYRO_RINGS.tertiary.rotation} ${RASI_GYRO_RINGS.tertiary.cx} ${RASI_GYRO_RINGS.tertiary.cy})`}
                fill="none"
                stroke={`url(#rasi-orbit-grad-${id})`}
                strokeWidth="0.6"
                strokeDasharray="1.5 3.5"
                opacity="0.45"
              />

              {/* Gyroscope Ring 4: Concentric Equatorial Pulse Ring (r=12) */}
              <circle
                cx={RASI_GYRO_RINGS.equatorial.cx}
                cy={RASI_GYRO_RINGS.equatorial.cy}
                r={RASI_GYRO_RINGS.equatorial.rx}
                fill="none"
                stroke={isCyan ? '#38bdf8' : isNavy ? '#0284c7' : '#ffffff'}
                strokeWidth="0.65"
                strokeDasharray="1.5 2.5"
                opacity="0.5"
                className="animate-rasi-pulse-ring"
              />

              {/* Gyroscope Ring 5: Inner Quantum Harmonic Beacon Ring (r=7.5) */}
              <circle
                cx={RASI_GYRO_RINGS.innerHarmonic.cx}
                cy={RASI_GYRO_RINGS.innerHarmonic.cy}
                r={RASI_GYRO_RINGS.innerHarmonic.rx}
                fill="none"
                stroke={isCyan ? '#7dd3fc' : isNavy ? '#38bdf8' : '#ffffff'}
                strokeWidth="0.6"
                strokeDasharray="1 2"
                opacity="0.6"
                className="animate-rasi-pulse-ring"
              />

              {/* Local Micro-Orbital Rings on Anchor Stars */}
              {RASI_LOCAL_ORBITS.map((orb) => (
                <ellipse
                  key={orb.id}
                  cx={orb.cx}
                  cy={orb.cy}
                  rx={orb.rx}
                  ry={orb.ry}
                  transform={orb.rotation ? `rotate(${orb.rotation} ${orb.cx} ${orb.cy})` : undefined}
                  fill="none"
                  stroke={isCyan ? '#38bdf8' : isNavy ? '#0284c7' : '#ffffff'}
                  strokeWidth="0.5"
                  strokeDasharray="1 2"
                  opacity="0.35"
                />
              ))}
            </g>
          )}

          {/* ══════════════════════════════════════════════════════════════
              LAYER 4: 3D VOLUMETRIC CYLINDRICAL TUBE (S-CONSTELLATION TRACK)
              ══════════════════════════════════════════════════════════════ */}
          {is3D ? (
            <g>
              {/* Pass 4.1: Soft Ground Drop Shadow */}
              <path
                d={RASI_PATH_D}
                fill="none"
                stroke="#020617"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.35"
                transform="translate(1.0, 2.0)"
              />

              {/* Pass 4.2: Outer Cylindrical Body */}
              <path
                d={RASI_PATH_D}
                fill="none"
                stroke={tubeBaseColor}
                strokeWidth="3.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Pass 4.3: High-Intensity Luminous Core Conduit */}
              <path
                d={RASI_PATH_D}
                fill="none"
                stroke={tubeCoreColor}
                strokeWidth="2.1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Pass 4.4: Top Specular Reflection Ridge */}
              <path
                d={RASI_PATH_D}
                fill="none"
                stroke={tubeSpecularColor}
                strokeWidth="0.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                transform="translate(-0.3, -0.4)"
                opacity="0.85"
              />
            </g>
          ) : (
            <path
              d={RASI_PATH_D}
              fill="none"
              stroke={tubeCoreColor}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* ══════════════════════════════════════════════════════════════
              LAYER 5: SATELLITE MICRO DATA NODES
              ══════════════════════════════════════════════════════════════ */}
          {RASI_SATELLITE_NODES.map((s) => (
            <g key={s.id}>
              {is3D && (
                <circle
                  cx={s.x + 0.4}
                  cy={s.y + 0.8}
                  r={s.r}
                  fill="#020617"
                  opacity="0.3"
                />
              )}
              <circle
                cx={s.x}
                cy={s.y}
                r={s.r}
                fill={sphereFill}
                fillOpacity={s.opacity}
              />
              {is3D && (
                <circle
                  cx={s.x - s.r * 0.25}
                  cy={s.y - s.r * 0.25}
                  r={s.r * 0.35}
                  fill="#ffffff"
                  opacity="0.8"
                />
              )}
            </g>
          ))}

          {/* ══════════════════════════════════════════════════════════════
              LAYER 6: 3D VOLUMETRIC CONSTELLATION NODES & HERO BREAKOUT BEACON
              ══════════════════════════════════════════════════════════════ */}
          {RASI_CONSTELLATION_NODES.map((node) => {
            // ── HERO BREAKOUT BEACON ORB (n4 at x=46, y=60) ──
            if (node.isPrimary) {
              return (
                <g key={node.id}>
                  {/* Radiant Ambient Halo */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.r * 2.8}
                    fill={`url(#rasi-star-glow-${id})`}
                  />

                  {/* Contact Elevation Shadow */}
                  {is3D && (
                    <circle
                      cx={node.x + 0.8}
                      cy={node.y + 1.8}
                      r={node.r * 1.2}
                      fill="#020617"
                      opacity="0.38"
                    />
                  )}

                  {/* Concentric Cybernetic Beacon Pulse Ring */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.r * 1.65}
                    fill="none"
                    stroke={isCyan ? '#38bdf8' : isNavy ? '#0284c7' : '#ffffff'}
                    strokeWidth="0.85"
                    strokeDasharray="2 2"
                    opacity="0.6"
                  />

                  {/* Central Floating 3D Core Sphere */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.r * 1.05}
                    fill={sphereFill}
                    stroke={isCyan ? '#7dd3fc' : '#ffffff'}
                    strokeWidth="1.2"
                  />
                  {/* Specular Glint */}
                  <circle
                    cx={node.x - node.r * 0.3}
                    cy={node.y - node.r * 0.3}
                    r={node.r * 0.32}
                    fill="#ffffff"
                    opacity="0.95"
                  />
                </g>
              )
            }

            // ── REGULAR 3D CONSTELLATION NODES ──
            return (
              <g key={node.id}>
                {/* Soft Contact Drop Shadow */}
                {is3D && (
                  <circle
                    cx={node.x + 0.6}
                    cy={node.y + 1.4}
                    r={node.r * 1.05}
                    fill="#020617"
                    opacity="0.35"
                  />
                )}

                {/* Atmospheric Ambient Glow */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.r * 1.6}
                  fill={`url(#rasi-node-halo-${id})`}
                />

                {/* Volumetric 3D Sphere Body */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.r}
                  fill={sphereFill}
                  stroke={isCyan ? '#38bdf8' : isNavy ? '#0284c7' : '#ffffff'}
                  strokeWidth="0.8"
                />

                {/* Top-Left Specular Gleam Highlight */}
                {is3D && (
                  <circle
                    cx={node.x - node.r * 0.28}
                    cy={node.y - node.r * 0.28}
                    r={node.r * 0.3}
                    fill="#ffffff"
                    opacity="0.9"
                  />
                )}
              </g>
            )
          })}

          {/* ══════════════════════════════════════════════════════════════
              LAYER 7: DYNAMIC CELESTIAL "CLING" STARLIGHT SPARKLES
              Multi-node polyrhythmic scintillation across the constellation
              ══════════════════════════════════════════════════════════════ */}
          {RASI_SYMBOL_SPARKLES.map((sp) => (
            <g
              key={sp.id}
              style={{ transformOrigin: `${sp.x}px ${sp.y}px` }}
              className={`animate-rasi-cling ${sp.delayClass} pointer-events-none`}
            >
              {/* Subtle Glow Bloom */}
              <circle
                cx={sp.x}
                cy={sp.y}
                r={sp.size * 1.3}
                fill={`url(#rasi-star-glow-${id})`}
                opacity="0.8"
              />
              {/* Slender Outer Needle Glint */}
              <path
                d={`M ${sp.x} ${sp.y - sp.size} 
                    Q ${sp.x} ${sp.y} ${sp.x + sp.size} ${sp.y} 
                    Q ${sp.x} ${sp.y} ${sp.x} ${sp.y + sp.size} 
                    Q ${sp.x} ${sp.y} ${sp.x - sp.size} ${sp.y} 
                    Z`}
                fill={isCyan ? '#38bdf8' : isNavy ? '#0284c7' : '#ffffff'}
                opacity="0.85"
              />
              {/* High-Luminance White Core Needle */}
              <path
                d={`M ${sp.x} ${sp.y - sp.size * 0.55} 
                    Q ${sp.x} ${sp.y} ${sp.x + sp.size * 0.55} ${sp.y} 
                    Q ${sp.x} ${sp.y} ${sp.x} ${sp.y + sp.size * 0.55} 
                    Q ${sp.x} ${sp.y} ${sp.x - sp.size * 0.55} ${sp.y} 
                    Z`}
                fill="#ffffff"
              />
              <circle cx={sp.x} cy={sp.y} r={sp.size > 5 ? 1.2 : 0.8} fill="#ffffff" />
            </g>
          ))}
        </svg>
      </div>
    </div>
  )
}

import { ImageResponse } from 'next/og'

import {
  RASI_CONSTELLATION_NODES,
  RASI_SATELLITE_NODES,
  RASI_PATH_D,
  RASI_3D_ORBIT,
  RASI_GYRO_RINGS,
} from '@/components/logo/constants'

export const size = {
  width: 120,
  height: 120,
}

export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(145deg, #0b1528 0%, #030712 100%)',
          borderRadius: '26px',
          border: '1.5px solid rgba(56, 189, 248, 0.35)',
          position: 'relative',
        }}
      >
        <svg
          viewBox="0 0 100 120"
          width="104"
          height="104"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* 3D Tube Gradients */}
            <linearGradient
              id="icon-tube-base"
              x1="20"
              y1="14"
              x2="80"
              y2="106"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="30%" stopColor="#0369a1" />
              <stop offset="70%" stopColor="#075985" />
              <stop offset="100%" stopColor="#082f49" />
            </linearGradient>

            <linearGradient
              id="icon-tube-core"
              x1="20"
              y1="14"
              x2="80"
              y2="106"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="48%" stopColor="#bae6fd" />
              <stop offset="70%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0ea5e9" />
            </linearGradient>

            <linearGradient
              id="icon-tube-specular"
              x1="20"
              y1="14"
              x2="80"
              y2="106"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.25" />
            </linearGradient>

            {/* 3D Volumetric Spherical Gradient */}
            <radialGradient
              id="icon-sphere-cyan"
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

            <radialGradient id="icon-star-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.65" />
              <stop offset="50%" stopColor="#0ea5e9" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Perspective grid lines */}
          <g opacity="0.18" stroke="#38bdf8" strokeWidth="0.5">
            <line x1="16" y1="20" x2="84" y2="20" strokeDasharray="2 3" />
            <line x1="16" y1="60" x2="84" y2="60" strokeDasharray="2 3" />
            <line x1="16" y1="100" x2="84" y2="100" strokeDasharray="2 3" />
          </g>

          {/* 3D Multi-Axis Gyroscopic Astrolabe Rings */}
          {/* Outer Astrolabe Horizon Ring (r=28) */}
          <circle
            cx={RASI_GYRO_RINGS.outerAstrolabe.cx}
            cy={RASI_GYRO_RINGS.outerAstrolabe.cy}
            r={RASI_GYRO_RINGS.outerAstrolabe.rx}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="0.5"
            strokeDasharray="2.5 4.5"
            opacity="0.28"
          />

          {/* Primary Ecliptic Orbit (-22 deg) */}
          <ellipse
            cx={RASI_GYRO_RINGS.primary.cx}
            cy={RASI_GYRO_RINGS.primary.cy}
            rx={RASI_GYRO_RINGS.primary.rx}
            ry={RASI_GYRO_RINGS.primary.ry}
            transform={`rotate(${RASI_GYRO_RINGS.primary.rotation} ${RASI_GYRO_RINGS.primary.cx} ${RASI_GYRO_RINGS.primary.cy})`}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="0.85"
            strokeDasharray="2.5 2.5"
            opacity="0.75"
          />

          {/* Secondary Polar Crossed Orbit (+32 deg) */}
          <ellipse
            cx={RASI_GYRO_RINGS.secondary.cx}
            cy={RASI_GYRO_RINGS.secondary.cy}
            rx={RASI_GYRO_RINGS.secondary.rx}
            ry={RASI_GYRO_RINGS.secondary.ry}
            transform={`rotate(${RASI_GYRO_RINGS.secondary.rotation} ${RASI_GYRO_RINGS.secondary.cx} ${RASI_GYRO_RINGS.secondary.cy})`}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="0.7"
            strokeDasharray="1.5 3"
            opacity="0.5"
          />

          {/* Concentric Equatorial Pulse Ring (r=12) */}
          <circle
            cx={RASI_GYRO_RINGS.equatorial.cx}
            cy={RASI_GYRO_RINGS.equatorial.cy}
            r={RASI_GYRO_RINGS.equatorial.rx}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="0.65"
            strokeDasharray="1.5 2.5"
            opacity="0.45"
          />

          {/* Inner Harmonic Beacon Ring (r=7.5) */}
          <circle
            cx={RASI_GYRO_RINGS.innerHarmonic.cx}
            cy={RASI_GYRO_RINGS.innerHarmonic.cy}
            r={RASI_GYRO_RINGS.innerHarmonic.rx}
            fill="none"
            stroke="#7dd3fc"
            strokeWidth="0.6"
            strokeDasharray="1 2"
            opacity="0.6"
          />

          {/* 3D Cylindrical Tube Track */}
          {/* Base outer cylinder */}
          <path
            d={RASI_PATH_D}
            fill="none"
            stroke="url(#icon-tube-base)"
            strokeWidth="4.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Luminous Neon Core */}
          <path
            d={RASI_PATH_D}
            fill="none"
            stroke="url(#icon-tube-core)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Specular Ridge */}
          <path
            d={RASI_PATH_D}
            fill="none"
            stroke="url(#icon-tube-specular)"
            strokeWidth="0.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="translate(-0.3, -0.4)"
            opacity="0.85"
          />

          {/* Satellite Micro Data Points */}
          {RASI_SATELLITE_NODES.map((s) => (
            <g key={s.id}>
              <circle
                cx={s.x}
                cy={s.y}
                r={s.r * 1.2}
                fill="url(#icon-sphere-cyan)"
                fillOpacity={s.opacity}
              />
              <circle
                cx={s.x - s.r * 0.3}
                cy={s.y - s.r * 0.3}
                r={s.r * 0.35}
                fill="#ffffff"
                opacity="0.85"
              />
            </g>
          ))}

          {/* Constellation Nodes */}
          {RASI_CONSTELLATION_NODES.map((node) => {
            if (node.isPrimary) {
              return (
                <g key={node.id}>
                  {/* Star Glow */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.r * 2.8}
                    fill="url(#icon-star-glow)"
                  />

                  {/* Concentric Cybernetic Pulse Ring */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.r * 1.65}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="0.85"
                    strokeDasharray="2 2"
                    opacity="0.6"
                  />

                  {/* Central Core Beacon Orb */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.r * 1.05}
                    fill="url(#icon-sphere-cyan)"
                    stroke="#7dd3fc"
                    strokeWidth="1.2"
                  />
                  <circle
                    cx={node.x - node.r * 0.3}
                    cy={node.y - node.r * 0.3}
                    r={node.r * 0.32}
                    fill="#ffffff"
                  />
                </g>
              )
            }

            return (
              <g key={node.id}>
                {/* 3D Sphere Node */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.r}
                  fill="url(#icon-sphere-cyan)"
                  stroke="#38bdf8"
                  strokeWidth="0.8"
                />
                {/* Specular Hotspot */}
                <circle
                  cx={node.x - node.r * 0.28}
                  cy={node.y - node.r * 0.28}
                  r={node.r * 0.3}
                  fill="#ffffff"
                  opacity="0.9"
                />
              </g>
            )
          })}

          {/* Celestial Starlight Diffraction Glints */}
          {/* Hero Beacon Glint at n4 */}
          <path
            d="M 46 52.5 Q 46 60 53.5 60 Q 46 60 46 67.5 Q 46 60 38.5 60 Z"
            fill="#38bdf8"
            opacity="0.85"
          />
          <path
            d="M 46 55.5 Q 46 60 50.5 60 Q 46 60 46 64.5 Q 46 60 41.5 60 Z"
            fill="#ffffff"
          />
          <circle cx="46" cy="60" r="1.2" fill="#ffffff" />

          {/* Top Ingress Glint at n0 */}
          <path
            d="M 76 15 Q 76 20 81 20 Q 76 20 76 25 Q 76 20 71 20 Z"
            fill="#38bdf8"
            opacity="0.75"
          />
          <circle cx="76" cy="20" r="1.0" fill="#ffffff" />

          {/* Lower Harmonic Glint at n7 */}
          <path
            d="M 44 101 Q 44 106 49 106 Q 44 106 44 111 Q 44 106 39 106 Z"
            fill="#38bdf8"
            opacity="0.7"
          />
          <circle cx="44" cy="106" r="0.9" fill="#ffffff" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}

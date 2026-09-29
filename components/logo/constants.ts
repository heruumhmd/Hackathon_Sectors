/**
 * 8-9 constellation nodes forming an abstract "S" curve
 * representing the stock price movement and star constellation of RASI.
 */
export const RASI_CONSTELLATION_NODES = [
  { id: 'n0', x: 76, y: 20, r: 3.2, isPrimary: false },
  { id: 'n1', x: 52, y: 14, r: 3.8, isPrimary: false },
  { id: 'n2', x: 26, y: 26, r: 4.2, isPrimary: false },
  { id: 'n3', x: 18, y: 48, r: 3.6, isPrimary: false },
  { id: 'n4', x: 46, y: 60, r: 5.6, isPrimary: true }, // Focal star / Breakout pivot
  { id: 'n5', x: 78, y: 72, r: 4.6, isPrimary: false },
  { id: 'n6', x: 72, y: 94, r: 3.6, isPrimary: false },
  { id: 'n7', x: 44, y: 106, r: 4.0, isPrimary: false },
  { id: 'n8', x: 22, y: 98, r: 3.2, isPrimary: false },
]

export const RASI_SATELLITE_NODES = [
  { id: 's0', x: 84, y: 34, r: 1.8, opacity: 0.65 },
  { id: 's1', x: 62, y: 48, r: 2.0, opacity: 0.75 },
  { id: 's2', x: 32, y: 88, r: 1.8, opacity: 0.65 },
]

export const RASI_PATH_D =
  'M 76 20 L 52 14 L 26 26 L 18 48 L 46 60 L 78 72 L 72 94 L 44 106 L 22 98'

/**
 * 3D Breakout Pivot Geometry (Focal Star n4)
 * Facet vertices for 3D diamond octahedron rendering with directional illumination.
 */
export const RASI_HERO_STAR = {
  id: 'n4',
  x: 46,
  y: 60,
  r: 5.6,
  reach: 14.5,
  facets: {
    top: { x: 46, y: 45.5 },
    bottom: { x: 46, y: 74.5 },
    left: { x: 31.5, y: 60 },
    right: { x: 60.5, y: 60 },
    center: { x: 46, y: 60 },
  },
}

/**
 * 3D Isometric Orbital & Depth Plane Reference Elements
 */
export const RASI_3D_ORBIT = {
  cx: 46,
  cy: 60,
  rx: 16,
  ry: 5.5,
  rotation: -22,
}

/**
 * Multi-Axis Gyroscopic Celestial Rings (Armillary sphere & Quantum orbital geometry)
 * Mathematical ellipses and circles modeling financial breakout momentum and cosmic navigation.
 */
export const RASI_GYRO_RINGS = {
  primary: { cx: 46, cy: 60, rx: 16, ry: 5.5, rotation: -22 },
  secondary: { cx: 46, cy: 60, rx: 17, ry: 6.0, rotation: 32 },
  tertiary: { cx: 46, cy: 60, rx: 20, ry: 6.8, rotation: -65 },
  equatorial: { cx: 46, cy: 60, rx: 12, ry: 12, rotation: 0 },
  innerHarmonic: { cx: 46, cy: 60, rx: 7.5, ry: 7.5, rotation: 0 },
  outerAstrolabe: { cx: 46, cy: 60, rx: 28, ry: 28, rotation: 0 },
}

/**
 * Local Micro-Orbital Rings for Constellation Nodes
 */
export const RASI_LOCAL_ORBITS = [
  { id: 'orb-n0', cx: 76, cy: 20, rx: 6.0, ry: 2.5, rotation: -18 },
  { id: 'orb-n2', cx: 26, cy: 26, rx: 6.5, ry: 2.8, rotation: 25 },
  { id: 'orb-s1', cx: 62, cy: 48, rx: 4.8, ry: 4.8, rotation: 0 },
  { id: 'orb-n7', cx: 44, cy: 106, rx: 7.0, ry: 3.0, rotation: -15 },
]

/**
 * Cohesive Celestial "Cling" Starlight Sparkle Positions on the S Symbol
 */
export const RASI_SYMBOL_SPARKLES = [
  { id: 'sp-hero', x: 46, y: 60, size: 7.5, delayClass: '' }, // Focal breakout pivot n4
  { id: 'sp-top', x: 76, y: 20, size: 4.8, delayClass: 'animate-rasi-cling-delay-1' }, // Node n0
  { id: 'sp-crest', x: 26, y: 26, size: 4.0, delayClass: 'animate-rasi-cling-delay-2' }, // Node n2
  { id: 'sp-lower', x: 44, y: 106, size: 4.5, delayClass: 'animate-rasi-cling-delay-3' }, // Node n7
  { id: 'sp-sat', x: 62, y: 48, size: 3.6, delayClass: 'animate-rasi-cling-delay-4' }, // Satellite s1
]



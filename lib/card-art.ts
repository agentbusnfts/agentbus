// AgentBus — Deterministic Procedural Art Generator
// Creates unique SVG art per agent based on tokenId + name hash
// Single clean avatar centered on gradient background — no clutter

export function hashSeed(input: string): number {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

function mulberry32(seed: number): () => number {
  return function() {
    let t = seed += 0x6D2B79F5
    t = Math.imul(t ^ t >>> 15, t | 1)
    t ^= t + Math.imul(t ^ t >>> 7, t | 61)
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

function generatePalette(seed: number) {
  const rand = mulberry32(seed)
  const hue1 = Math.floor(rand() * 360)
  const sat1 = 50 + Math.floor(rand() * 35)
  const light1 = 50 + Math.floor(rand() * 15)
  const bodyColor = `hsl(${hue1}, ${sat1}%, ${light1}%)`
  const hue2 = (hue1 + 120 + Math.floor(rand() * 60)) % 360
  const sat2 = 55 + Math.floor(rand() * 30)
  const light2 = 55 + Math.floor(rand() * 15)
  const accentColor = `hsl(${hue2}, ${sat2}%, ${light2}%)`
  const bgHue = (hue1 + 180 + Math.floor(rand() * 40 - 20)) % 360
  const bg1 = `hsl(${bgHue}, 25%, ${6 + Math.floor(rand() * 8)}%)`
  const bg2 = `hsl(${(bgHue + 30) % 360}, 15%, ${2 + Math.floor(rand() * 4)}%)`
  return { bodyColor, accentColor, bg1, bg2 }
}

// Generate a single clean centered avatar
function generateAvatar(seed: number, bodyColor: string, accentColor: string): string {
  const rand = mulberry32(seed + 5000)
  const cx = 144, cy = 95
  const parts: string[] = []

  // Subtle glow behind avatar
  const glowR = 35 + Math.floor(rand() * 10)
  parts.push(`<circle cx="${cx}" cy="${cy}" r="${glowR}" fill="${bodyColor}" opacity="0.06" />`)
  parts.push(`<circle cx="${cx}" cy="${cy}" r="${glowR * 0.6}" fill="${bodyColor}" opacity="0.1" />`)

  // Pick one avatar style (0-4)
  const style = Math.floor(rand() * 5)

  if (style === 0) {
    // ── Humanoid ──
    const bw = 20 + Math.floor(rand() * 8)
    const bh = 38 + Math.floor(rand() * 12)
    const hr = 12 + Math.floor(rand() * 5)
    // Body
    parts.push(`<rect x="${cx - bw/2}" y="${cy - bh/2}" width="${bw}" height="${bh}" rx="${bw * 0.25}" fill="${bodyColor}" opacity="0.9" />`)
    // Head
    parts.push(`<circle cx="${cx}" cy="${cy - bh/2 - hr * 0.6}" r="${hr}" fill="${bodyColor}" />`)
    parts.push(`<circle cx="${cx}" cy="${cy - bh/2 - hr * 0.6}" r="${hr * 0.65}" fill="#1a1a2e" />`)
    parts.push(`<circle cx="${cx}" cy="${cy - bh/2 - hr * 0.6}" r="${hr * 0.35}" fill="${accentColor}" opacity="0.9" />`)
    parts.push(`<circle cx="${cx}" cy="${cy - bh/2 - hr * 0.6}" r="${hr * 0.12}" fill="white" opacity="0.8" />`)
    // Arms
    const al = 18 + Math.floor(rand() * 10)
    parts.push(`<rect x="${cx - bw/2 - 7}" y="${cy - bh/4}" width="5" height="${al}" rx="2.5" fill="${bodyColor}" opacity="0.7" />`)
    parts.push(`<rect x="${cx + bw/2 + 2}" y="${cy - bh/4}" width="5" height="${al}" rx="2.5" fill="${bodyColor}" opacity="0.7" />`)
    // Legs
    const ll = 12 + Math.floor(rand() * 8)
    parts.push(`<rect x="${cx - bw/3}" y="${cy + bh/2}" width="5" height="${ll}" rx="2.5" fill="${bodyColor}" opacity="0.6" />`)
    parts.push(`<rect x="${cx + bw/3 - 5}" y="${cy + bh/2}" width="5" height="${ll}" rx="2.5" fill="${bodyColor}" opacity="0.6" />`)

  } else if (style === 1) {
    // ── Orb / Eye ──
    const r = 22 + Math.floor(rand() * 10)
    parts.push(`<circle cx="${cx}" cy="${cy}" r="${r + 8}" fill="none" stroke="${bodyColor}" stroke-width="1" opacity="0.2" />`)
    parts.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${bodyColor}" opacity="0.85" />`)
    parts.push(`<circle cx="${cx}" cy="${cy}" r="${r * 0.65}" fill="#0d0d1a" />`)
    parts.push(`<circle cx="${cx}" cy="${cy}" r="${r * 0.35}" fill="${accentColor}" opacity="0.95" />`)
    parts.push(`<circle cx="${cx}" cy="${cy}" r="${r * 0.12}" fill="white" opacity="0.9" />`)
    // Orbiting ring
    const ringTilt = 15 + Math.floor(rand() * 30)
    parts.push(`<ellipse cx="${cx}" cy="${cy}" rx="${r + 18}" ry="${r * 0.25}" fill="none" stroke="${accentColor}" stroke-width="1" opacity="0.3" transform="rotate(${ringTilt},${cx},${cy})" />`)

  } else if (style === 2) {
    // ── Beast / Creature ──
    const br = 24 + Math.floor(rand() * 8)
    // Body
    parts.push(`<ellipse cx="${cx}" cy="${cy + 5}" rx="${br}" ry="${br * 0.75}" fill="${bodyColor}" opacity="0.85" />`)
    // Head
    parts.push(`<circle cx="${cx}" cy="${cy - br * 0.45}" r="${br * 0.55}" fill="${bodyColor}" />`)
    // Eyes
    parts.push(`<ellipse cx="${cx - 6}" cy="${cy - br * 0.55}" rx="4" ry="5" fill="${accentColor}" opacity="0.9" />`)
    parts.push(`<ellipse cx="${cx + 6}" cy="${cy - br * 0.55}" rx="4" ry="5" fill="${accentColor}" opacity="0.9" />`)
    parts.push(`<circle cx="${cx - 6}" cy="${cy - br * 0.55}" r="2" fill="white" opacity="0.95" />`)
    parts.push(`<circle cx="${cx + 6}" cy="${cy - br * 0.55}" r="2" fill="white" opacity="0.95" />`)
    // Ears
    const earA = 15 + Math.floor(rand() * 15)
    parts.push(`<ellipse cx="${cx - 14}" cy="${cy - br * 0.95}" rx="5" ry="12" fill="${bodyColor}" opacity="0.7" transform="rotate(-${earA},${cx - 14},${cy - br * 0.95})" />`)
    parts.push(`<ellipse cx="${cx + 14}" cy="${cy - br * 0.95}" rx="5" ry="12" fill="${bodyColor}" opacity="0.7" transform="rotate(${earA},${cx + 14},${cy - br * 0.95})" />`)
    // Arms
    parts.push(`<path d="M${cx - 22},${cy} Q${cx - 38},${cy - 8} ${cx - 48},${cy + 12}" stroke="${bodyColor}" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.8" />`)
    parts.push(`<path d="M${cx + 22},${cy} Q${cx + 38},${cy - 8} ${cx + 48},${cy + 12}" stroke="${bodyColor}" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.8" />`)

  } else if (style === 3) {
    // ── Crystal / Gem ──
    const cr = 20 + Math.floor(rand() * 8)
    const sides = 5 + Math.floor(rand() * 3)
    const outerPts: string[] = []
    const innerPts: string[] = []
    for (let i = 0; i < sides; i++) {
      const a = (Math.PI * 2 / sides) * i - Math.PI / 2
      outerPts.push(`${cx + cr * Math.cos(a)},${cy + cr * Math.sin(a)}`)
      innerPts.push(`${cx + cr * 0.45 * Math.cos(a)},${cy + cr * 0.45 * Math.sin(a)}`)
    }
    parts.push(`<polygon points="${outerPts.join(' ')}" fill="${bodyColor}" opacity="0.7" />`)
    parts.push(`<polygon points="${outerPts.join(' ')}" fill="none" stroke="${accentColor}" stroke-width="1.5" opacity="0.5" />`)
    parts.push(`<polygon points="${innerPts.join(' ')}" fill="${accentColor}" opacity="0.5" />`)
    parts.push(`<circle cx="${cx}" cy="${cy}" r="3" fill="white" opacity="0.7" />`)

  } else {
    // ── Serpent / Dragon ──
    const segments = 5 + Math.floor(rand() * 3)
    let px = cx - 30, py = cy
    for (let i = 0; i < segments; i++) {
      const nx = px + 10 + rand() * 6
      const ny = cy + (rand() - 0.5) * 25
      const sr = 7 - (i * 0.4)
      parts.push(`<circle cx="${nx}" cy="${ny}" r="${sr}" fill="${bodyColor}" opacity="${0.9 - i * 0.06}" />`)
      px = nx; py = ny
    }
    // Head
    parts.push(`<circle cx="${cx - 34}" cy="${cy}" r="9" fill="${bodyColor}" />`)
    parts.push(`<circle cx="${cx - 37}" cy="${cy - 3}" r="2.5" fill="${accentColor}" opacity="0.9" />`)
    parts.push(`<circle cx="${cx - 37}" cy="${cy - 3}" r="1" fill="white" />`)
    // Wings
    parts.push(`<path d="M${cx - 8},${cy - 12} Q${cx - 25},${cy - 35} ${cx - 45},${cy - 20}" stroke="${accentColor}" stroke-width="1.5" fill="none" opacity="0.4" />`)
    parts.push(`<path d="M${cx - 8},${cy + 12} Q${cx - 25},${cy + 35} ${cx - 45},${cy + 20}" stroke="${accentColor}" stroke-width="1.5" fill="none" opacity="0.4" />`)
  }

  // Small accent dots around avatar (subtle, not cluttered)
  for (let i = 0; i < 4; i++) {
    const angle = (Math.PI / 2) * i + rand() * 0.8
    const dist = 40 + rand() * 12
    const px = cx + dist * Math.cos(angle)
    const py = cy + dist * Math.sin(angle)
    parts.push(`<circle cx="${Math.round(px)}" cy="${Math.round(py)}" r="1.5" fill="${accentColor}" opacity="0.25" />`)
  }

  return parts.join('')
}

// Main export: generate complete card art SVG
export function generateCardArt(tokenId: number | string | null, name: string): {
  svg: string
  bodyColor: string
  accentColor: string
  bg1: string
  bg2: string
} {
  const seed = hashSeed(`${name}-${tokenId ?? 0}`)
  const palette = generatePalette(seed)
  const avatar = generateAvatar(seed, palette.bodyColor, palette.accentColor)

  // Subtle grid lines only
  const gridLines: string[] = []
  for (let gx = 0; gx < 288; gx += 48) {
    gridLines.push(`<line x1="${gx}" y1="0" x2="${gx}" y2="190" stroke="rgba(255,255,255,0.02)" stroke-width="0.5"/>`)
  }
  for (let gy = 0; gy < 190; gy += 38) {
    gridLines.push(`<line x1="0" y1="${gy}" x2="288" y2="${gy}" stroke="rgba(255,255,255,0.02)" stroke-width="0.5"/>`)
  }

  const svg = [...gridLines, avatar].join('')

  return { svg, bodyColor: palette.bodyColor, accentColor: palette.accentColor, bg1: palette.bg1, bg2: palette.bg2 }
}

// Compact art for grid previews — same avatar, no grid lines
export function generateCompactArt(tokenId: number | string | null, name: string): {
  svg: string
  bodyColor: string
  accentColor: string
} {
  const seed = hashSeed(`${name}-${tokenId ?? 0}-c`)
  const palette = generatePalette(seed)
  const avatar = generateAvatar(seed, palette.bodyColor, palette.accentColor)
  return { svg: avatar, bodyColor: palette.bodyColor, accentColor: palette.accentColor }
}

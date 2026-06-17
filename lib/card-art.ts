// AgentBus — Deterministic Procedural Art Generator
// Creates unique SVG art per agent based on tokenId + name hash
// Same agent always produces the same art (deterministic)

// Simple hash function — converts string to numeric seed
export function hashSeed(input: string): number {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

// Seeded pseudo-random number generator (mulberry32)
function mulberry32(seed: number): () => number {
  return function() {
    let t = seed += 0x6D2B79F5
    t = Math.imul(t ^ t >>> 15, t | 1)
    t ^= t + Math.imul(t ^ t >>> 7, t | 61)
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

// Generate a deterministic random number from seed + offset
function seededRandom(seed: number, offset: number): number {
  return mulberry32(seed + offset * 7919)()
}

// Color palette generation from seed
function generatePalette(seed: number) {
  const rand = mulberry32(seed)

  // Generate body color — vibrant hue
  const hue1 = Math.floor(rand() * 360)
  const sat1 = 50 + Math.floor(rand() * 40)
  const light1 = 45 + Math.floor(rand() * 20)
  const bodyColor = `hsl(${hue1}, ${sat1}%, ${light1}%)`

  // Accent color — complementary or analogous
  const hueOffset = rand() > 0.5 ? 120 + Math.floor(rand() * 60) : 30 + Math.floor(rand() * 30)
  const hue2 = (hue1 + hueOffset) % 360
  const sat2 = 60 + Math.floor(rand() * 30)
  const light2 = 50 + Math.floor(rand() * 20)
  const accentColor = `hsl(${hue2}, ${sat2}%, ${light2}%)`

  // Background gradient
  const bgHue = (hue1 + 180) % 360
  const bg1 = `hsl(${bgHue}, 30%, ${8 + Math.floor(rand() * 12)}%)`
  const bg2 = `hsl(${(bgHue + 40) % 360}, 20%, ${3 + Math.floor(rand() * 5)}%)`

  // Glow color
  const glowColor = `hsl(${hue1}, ${sat1}%, ${light1 + 15}%)`

  return { bodyColor, accentColor, bg1, bg2, glowColor, hue1, hue2 }
}

// Shape types for procedural generation
type ShapeType = 'circle' | 'rect' | 'triangle' | 'diamond' | 'star' | 'ring' | 'arc' | 'cross'

interface ProceduralShape {
  type: ShapeType
  x: number
  y: number
  size: number
  rotation: number
  color: string
  opacity: number
  strokeOnly?: boolean
  strokeWidth?: number
}

// Generate procedural shapes from seed
function generateShapes(seed: number, count: number): ProceduralShape[] {
  const rand = mulberry32(seed + 1000)
  const palette = generatePalette(seed)
  const shapes: ProceduralShape[] = []

  const shapeTypes: ShapeType[] = ['circle', 'rect', 'triangle', 'diamond', 'star', 'ring', 'arc', 'cross']

  for (let i = 0; i < count; i++) {
    const type = shapeTypes[Math.floor(rand() * shapeTypes.length)]
    const x = 20 + Math.floor(rand() * 248)
    const y = 15 + Math.floor(rand() * 160)
    const size = 5 + Math.floor(rand() * 35)
    const rotation = Math.floor(rand() * 360)
    const useAccent = rand() > 0.6
    const color = useAccent ? palette.accentColor : palette.bodyColor
    const opacity = 0.2 + rand() * 0.6
    const strokeOnly = rand() > 0.7

    shapes.push({ type, x, y, size, rotation, color, opacity, strokeOnly, strokeWidth: 1 + Math.floor(rand() * 2) })
  }

  return shapes
}

// Convert shape to SVG element string
function shapeToSVG(shape: ProceduralShape): string {
  const { type, x, y, size, rotation, color, opacity, strokeOnly, strokeWidth } = shape
  const fill = strokeOnly ? 'none' : color
  const stroke = strokeOnly ? color : 'none'
  const sw = strokeWidth || 1.5

  switch (type) {
    case 'circle':
      return `<circle cx="${x}" cy="${y}" r="${size}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" opacity="${opacity}" />`
    case 'rect':
      return `<rect x="${x - size}" y="${y - size}" width="${size * 2}" height="${size * 2}" rx="${size * 0.2}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" opacity="${opacity}" transform="rotate(${rotation},${x},${y})" />`
    case 'triangle':
      return `<polygon points="${x},${y - size} ${x - size},${y + size} ${x + size},${y + size}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" opacity="${opacity}" transform="rotate(${rotation},${x},${y})" />`
    case 'diamond':
      return `<polygon points="${x},${y - size} ${x + size},${y} ${x},${y + size} ${x - size},${y}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" opacity="${opacity}" transform="rotate(${rotation},${x},${y})" />`
    case 'star': {
      const points: string[] = []
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? size : size * 0.4
        const angle = (Math.PI / 5) * i - Math.PI / 2
        points.push(`${x + r * Math.cos(angle)},${y + r * Math.sin(angle)}`)
      }
      return `<polygon points="${points.join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" opacity="${opacity}" transform="rotate(${rotation},${x},${y})" />`
    }
    case 'ring':
      return `<circle cx="${x}" cy="${y}" r="${size}" fill="none" stroke="${color}" stroke-width="${sw}" opacity="${opacity}" /><circle cx="${x}" cy="${y}" r="${size * 0.5}" fill="none" stroke="${color}" stroke-width="${sw * 0.7}" opacity="${opacity * 0.7}" />`
    case 'arc': {
      const startAngle = (rotation * Math.PI) / 180
      const endAngle = startAngle + Math.PI * (0.5 + Math.random() * 1.5)
      const x1 = x + size * Math.cos(startAngle)
      const y1 = y + size * Math.sin(startAngle)
      const x2 = x + size * Math.cos(endAngle)
      const y2 = y + size * Math.sin(endAngle)
      return `<path d="M${x1},${y1} A${size},${size} 0 0,1 ${x2},${y2}" fill="none" stroke="${color}" stroke-width="${sw}" opacity="${opacity}" stroke-linecap="round" />`
    }
    case 'cross':
      return `<line x1="${x - size}" y1="${y}" x2="${x + size}" y2="${y}" stroke="${color}" stroke-width="${sw}" opacity="${opacity}" transform="rotate(${rotation},${x},${y})" /><line x1="${x}" y1="${y - size}" x2="${x}" y2="${y + size}" stroke="${color}" stroke-width="${sw}" opacity="${opacity}" transform="rotate(${rotation},${x},${y})" />`
    default:
      return ''
  }
}

// Generate the central avatar figure — unique per agent
function generateAvatar(seed: number, bodyColor: string, accentColor: string): string {
  const rand = mulberry32(seed + 5000)
  const cx = 144
  const cy = 95
  const parts: string[] = []

  // Body shape — 0=humanoid, 1=orb, 2=beast, 3=crystal, 4=serpent
  const bodyType = Math.floor(rand() * 5)

  // Glow effect
  parts.push(`<circle cx="${cx}" cy="${cy}" r="${30 + Math.floor(rand() * 15)}" fill="${bodyColor}" opacity="0.08" />`)
  parts.push(`<circle cx="${cx}" cy="${cy}" r="${20 + Math.floor(rand() * 10)}" fill="${bodyColor}" opacity="0.12" />`)

  if (bodyType === 0) {
    // Humanoid
    const bodyW = 18 + Math.floor(rand() * 10)
    const bodyH = 35 + Math.floor(rand() * 15)
    const headR = 12 + Math.floor(rand() * 6)
    parts.push(`<rect x="${cx - bodyW / 2}" y="${cy - bodyH / 2}" width="${bodyW}" height="${bodyH}" rx="${bodyW * 0.3}" fill="${bodyColor}" opacity="0.85" />`)
    parts.push(`<circle cx="${cx}" cy="${cy - bodyH / 2 - headR * 0.5}" r="${headR}" fill="${bodyColor}" />`)
    parts.push(`<circle cx="${cx}" cy="${cy - bodyH / 2 - headR * 0.5}" r="${headR * 0.6}" fill="#1a1a2e" />`)
    parts.push(`<circle cx="${cx}" cy="${cy - bodyH / 2 - headR * 0.5}" r="${headR * 0.35}" fill="${accentColor}" opacity="0.9" />`)
    // Arms
    const armLen = 15 + Math.floor(rand() * 12)
    parts.push(`<rect x="${cx - bodyW / 2 - 8}" y="${cy - bodyH / 4}" width="6" height="${armLen}" rx="3" fill="${bodyColor}" opacity="0.7" />`)
    parts.push(`<rect x="${cx + bodyW / 2 + 2}" y="${cy - bodyH / 4}" width="6" height="${armLen}" rx="3" fill="${bodyColor}" opacity="0.7" />`)
    // Eyes
    parts.push(`<circle cx="${cx - 4}" cy="${cy - bodyH / 2 - headR * 0.5}" r="2" fill="white" opacity="0.9" />`)
    parts.push(`<circle cx="${cx + 4}" cy="${cy - bodyH / 2 - headR * 0.5}" r="2" fill="white" opacity="0.9" />`)
  } else if (bodyType === 1) {
    // Orb/entity
    const orbR = 20 + Math.floor(rand() * 12)
    parts.push(`<circle cx="${cx}" cy="${cy}" r="${orbR}" fill="${bodyColor}" opacity="0.8" />`)
    parts.push(`<circle cx="${cx}" cy="${cy}" r="${orbR * 0.7}" fill="#0d0d1a" />`)
    parts.push(`<circle cx="${cx}" cy="${cy}" r="${orbR * 0.4}" fill="${accentColor}" opacity="0.9" />`)
    parts.push(`<circle cx="${cx}" cy="${cy}" r="${orbR * 0.15}" fill="white" opacity="0.8" />`)
    // Orbiting rings
    parts.push(`<ellipse cx="${cx}" cy="${cy}" rx="${orbR + 15}" ry="${orbR * 0.3}" fill="none" stroke="${accentColor}" stroke-width="1" opacity="0.4" transform="rotate(${Math.floor(rand() * 45)},${cx},${cy})" />`)
    parts.push(`<ellipse cx="${cx}" cy="${cy}" rx="${orbR + 8}" ry="${orbR * 0.2}" fill="none" stroke="${bodyColor}" stroke-width="0.8" opacity="0.3" transform="rotate(${-Math.floor(rand() * 30)},${cx},${cy})" />`)
  } else if (bodyType === 2) {
    // Beast/mascot
    const bodyR = 22 + Math.floor(rand() * 10)
    parts.push(`<ellipse cx="${cx}" cy="${cy + 5}" rx="${bodyR}" ry="${bodyR * 0.8}" fill="${bodyColor}" opacity="0.85" />`)
    parts.push(`<circle cx="${cx}" cy="${cy - bodyR * 0.4}" r="${bodyR * 0.6}" fill="${bodyColor}" />`)
    // Eyes
    parts.push(`<ellipse cx="${cx - 6}" cy="${cy - bodyR * 0.5}" rx="5" ry="6" fill="${accentColor}" opacity="0.9" />`)
    parts.push(`<ellipse cx="${cx + 6}" cy="${cy - bodyR * 0.5}" rx="5" ry="6" fill="${accentColor}" opacity="0.9" />`)
    parts.push(`<circle cx="${cx - 6}" cy="${cy - bodyR * 0.5}" r="2.5" fill="white" opacity="0.95" />`)
    parts.push(`<circle cx="${cx + 6}" cy="${cy - bodyR * 0.5}" r="2.5" fill="white" opacity="0.95" />`)
    // Ears/horns
    const earAngle = 15 + Math.floor(rand() * 20)
    parts.push(`<ellipse cx="${cx - 14}" cy="${cy - bodyR * 0.9}" rx="6" ry="14" fill="${bodyColor}" opacity="0.7" transform="rotate(-${earAngle},${cx - 14},${cy - bodyR * 0.9})" />`)
    parts.push(`<ellipse cx="${cx + 14}" cy="${cy - bodyR * 0.9}" rx="6" ry="14" fill="${bodyColor}" opacity="0.7" transform="rotate(${earAngle},${cx + 14},${cy - bodyR * 0.9})" />`)
    // Arms
    parts.push(`<path d="M${cx - 22},${cy} Q${cx - 40},${cy - 10} ${cx - 50},${cy + 10}" stroke="${bodyColor}" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.8" />`)
    parts.push(`<path d="M${cx + 22},${cy} Q${cx + 40},${cy - 10} ${cx + 50},${cy + 10}" stroke="${bodyColor}" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.8" />`)
  } else if (bodyType === 3) {
    // Crystal/geometric
    const crystalR = 18 + Math.floor(rand() * 10)
    const sides = 5 + Math.floor(rand() * 4)
    const points: string[] = []
    for (let i = 0; i < sides; i++) {
      const angle = (Math.PI * 2 / sides) * i - Math.PI / 2
      points.push(`${cx + crystalR * Math.cos(angle)},${cy + crystalR * Math.sin(angle)}`)
    }
    parts.push(`<polygon points="${points.join(' ')}" fill="${bodyColor}" opacity="0.7" />`)
    parts.push(`<polygon points="${points.join(' ')}" fill="none" stroke="${accentColor}" stroke-width="1.5" opacity="0.6" />`)
    // Inner crystal
    const innerPoints: string[] = []
    for (let i = 0; i < sides; i++) {
      const angle = (Math.PI * 2 / sides) * i - Math.PI / 2
      innerPoints.push(`${cx + crystalR * 0.5 * Math.cos(angle)},${cy + crystalR * 0.5 * Math.sin(angle)}`)
    }
    parts.push(`<polygon points="${innerPoints.join(' ')}" fill="${accentColor}" opacity="0.5" />`)
    parts.push(`<circle cx="${cx}" cy="${cy}" r="4" fill="white" opacity="0.7" />`)
    // Sparkles
    for (let i = 0; i < 4; i++) {
      const sx = cx + (rand() - 0.5) * 60
      const sy = cy + (rand() - 0.5) * 60
      parts.push(`<circle cx="${sx}" cy="${sy}" r="1.5" fill="${accentColor}" opacity="${0.3 + rand() * 0.4}" />`)
    }
  } else {
    // Serpent/dragon
    const segments = 6 + Math.floor(rand() * 4)
    let px = cx - 30, py = cy
    for (let i = 0; i < segments; i++) {
      const nx = px + 10 + rand() * 8
      const ny = cy + (rand() - 0.5) * 30
      const segR = 8 - (i * 0.5)
      parts.push(`<circle cx="${nx}" cy="${ny}" r="${segR}" fill="${bodyColor}" opacity="${0.9 - i * 0.05}" />`)
      px = nx; py = ny
    }
    // Head
    parts.push(`<circle cx="${cx - 35}" cy="${cy}" r="10" fill="${bodyColor}" />`)
    parts.push(`<circle cx="${cx - 38}" cy="${cy - 3}" r="3" fill="${accentColor}" opacity="0.9" />`)
    parts.push(`<circle cx="${cx - 38}" cy="${cy - 3}" r="1.5" fill="white" />`)
    // Wings
    parts.push(`<path d="M${cx - 10},${cy - 15} Q${cx - 30},${cy - 40} ${cx - 50},${cy - 25}" stroke="${accentColor}" stroke-width="2" fill="none" opacity="0.5" />`)
    parts.push(`<path d="M${cx - 10},${cy + 15} Q${cx - 30},${cy + 40} ${cx - 50},${cy + 25}" stroke="${accentColor}" stroke-width="2" fill="none" opacity="0.5" />`)
  }

  // Add accent particles around the avatar
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI * 2 / 6) * i + rand() * 0.5
    const dist = 35 + rand() * 20
    const px = cx + dist * Math.cos(angle)
    const py = cy + dist * Math.sin(angle)
    const pSize = 1 + rand() * 3
    parts.push(`<circle cx="${px}" cy="${py}" r="${pSize}" fill="${accentColor}" opacity="${0.3 + rand() * 0.4}" />`)
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
  const shapes = generateShapes(seed, 8 + (seed % 6)) // 8-13 background shapes
  const avatar = generateAvatar(seed, palette.bodyColor, palette.accentColor)

  // Grid lines
  const gridLines: string[] = []
  for (let gx = 0; gx < 288; gx += 40) {
    gridLines.push(`<line x1="${gx}" y1="0" x2="${gx}" y2="190" stroke="rgba(255,255,255,0.03)" stroke-width="0.5"/>`)
  }
  for (let gy = 0; gy < 190; gy += 30) {
    gridLines.push(`<line x1="0" y1="${gy}" x2="288" y2="${gy}" stroke="rgba(255,255,255,0.03)" stroke-width="0.5"/>`)
  }

  const shapeSvgs = shapes.map(shapeToSVG).join('')

  const svg = [
    ...gridLines,
    shapeSvgs,
    avatar,
  ].join('')

  return {
    svg,
    bodyColor: palette.bodyColor,
    accentColor: palette.accentColor,
    bg1: palette.bg1,
    bg2: palette.bg2,
  }
}

// Generate compact art for grid previews (smaller, simpler)
export function generateCompactArt(tokenId: number | string | null, name: string): {
  svg: string
  bodyColor: string
  accentColor: string
} {
  const seed = hashSeed(`${name}-${tokenId ?? 0}-compact`)
  const palette = generatePalette(seed)
  const shapes = generateShapes(seed, 4 + (seed % 4))
  const avatar = generateAvatar(seed, palette.bodyColor, palette.accentColor)

  const shapeSvgs = shapes.map(shapeToSVG).join('')

  const svg = [shapeSvgs, avatar].join('')

  return {
    svg,
    bodyColor: palette.bodyColor,
    accentColor: palette.accentColor,
  }
}

// AgentBus — Card Metadata Types
// Maps agent on-chain + off-chain data to Pokémon-style card attributes

export interface CardStat {
  n: string   // name: ATK, DEF, SPD, SPC, STA
  v: number   // value: 0-200
  c: string   // color hex
}

export interface CardMove {
  name: string
  dmg: number
  energy: number
  color: string
}

export interface CardAbility {
  name: string
  desc: string
}

export interface CardTrait {
  k: string   // key
  v: string   // value
}

export interface CardMetadata {
  // Visual identity
  bodyColor: string
  accentColor: string
  bgGrad: [string, string]
  borderGrad: string
  holoColor: string
  holoAccent: string
  cardImage?: string        // URL or data URI for custom uploaded image

  // Card content
  edition: string                // e.g. "Genesis Edition · 2025"
  lore: string                   // origin story (back of card)
  flavor: string                 // short flavor text (front)

  // Battle attributes
  abilities: CardAbility[]       // special abilities (back of card)
  traits: CardTrait[]            // dossier traits (back of card)
  weakness: string               // e.g. "×2 Ghost"
  resistance: string             // e.g. "-30 Water"

  // Stats (computed from chain data or overridden)
  stats: CardStat[]
  moves: CardMove[]

  // Rarity override (optional — falls back to tier)
  rarity?: string
}

export type CardEdition =
  | 'Genesis'
  | 'Shadow'
  | 'Inferno'
  | 'Apex'
  | 'Nebula'
  | 'Quantum'

export type CardElement =
  | 'Cyber' | 'Fire' | 'Ghost' | 'Water' | 'Steel'
  | 'Dark' | 'Bio' | 'Psi'

// AgentRecord with card metadata attached
export interface AgentWithCard {
  id: string
  name: string
  tokenId: number | null
  agentType: string
  tier: string
  reputation: number
  battlesWon: number
  battlesLost: number
  projectsCompleted: number
  totalEarnings: string
  totalSpent: string
  owner: string | null
  active: boolean
  capabilities: string        // JSON string
  cardMetadata: CardMetadata | null
}

// Element type → visual mapping
export const ELEMENT_COLORS: Record<CardElement, { bg: string; text: string; border: string; dot: string }> = {
  Cyber:  { bg: 'rgba(99,102,241,0.4)',  text: '#a5b4fc', border: '#6366f1', dot: '#6366f1' },
  Fire:   { bg: 'rgba(239,68,68,0.4)',   text: '#fca5a5', border: '#ef4444', dot: '#ef4444' },
  Ghost:  { bg: 'rgba(139,92,246,0.4)',  text: '#c4b5fd', border: '#8b5cf6', dot: '#8b5cf6' },
  Water:  { bg: 'rgba(59,130,246,0.4)',  text: '#93c5fd', border: '#3b82f6', dot: '#3b82f6' },
  Steel:  { bg: 'rgba(148,163,184,0.4)', text: '#e2e8f0', border: '#94a3b8', dot: '#94a3b8' },
  Dark:   { bg: 'rgba(30,30,60,0.6)',    text: '#94a3b8', border: '#475569', dot: '#475569' },
  Bio:    { bg: 'rgba(16,185,129,0.3)',  text: '#6ee7b7', border: '#10b981', dot: '#10b981' },
  Psi:    { bg: 'rgba(244,114,182,0.3)', text: '#f9a8d4', border: '#f472b6', dot: '#f472b6' },
}

// Agent type → default element mapping
export const AGENT_TYPE_ELEMENTS: Record<string, CardElement[]> = {
  OPERATIONS:  ['Cyber', 'Steel'],
  RESEARCH:    ['Psi', 'Water'],
  TRADING:     ['Fire', 'Steel'],
  CREATIVE:    ['Bio', 'Psi'],
  SECURITY:    ['Dark', 'Cyber'],
  GOVERNANCE:  ['Water', 'Steel'],
  ANALYTICS:   ['Cyber', 'Water'],
  COORDINATION:['Steel', 'Bio'],
  CODING:      ['Fire', 'Cyber'],
  CUSTOM:      ['Ghost', 'Dark'],
  REWARDS:     ['Bio', 'Water'],
}

// Tier → rarity label mapping
export const TIER_RARITY: Record<string, string> = {
  BRONZE:   '● COMMON',
  SILVER:   '◆ UNCOMMON',
  GOLD:     '★ RARE',
  PLATINUM: '◆ ULTRA RARE',
  DIAMOND:  '★ LEGENDARY',
}

// Edition by tier
export const TIER_EDITION: Record<string, string> = {
  BRONZE:   'Base Edition · 2025',
  SILVER:   'Genesis Edition · 2025',
  GOLD:     'Shadow Edition · 2025',
  PLATINUM: 'Inferno Edition · 2025',
  DIAMOND:  'Apex Edition · 2025',
}

// Stat name → color
export const STAT_COLORS: Record<string, string> = {
  ATK: '#ef4444',
  DEF: '#3b82f6',
  SPD: '#10b981',
  SPC: '#8b5cf6',
  STA: '#f59e0b',
}

// Move energy → element color
export const ENERGY_ELEMENT_COLORS = ['#6366f1', '#8b5cf6', '#ef4444', '#10b981', '#f59e0b']

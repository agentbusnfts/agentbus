// AgentBus — Pokémon-Style Flip Card Component
// Front: agent art, stats, moves, type badges
// Back: lore, abilities, traits, dossier

'use client'

import { useState, useRef, useEffect } from 'react'
import type { CardMetadata, CardStat, CardMove, CardAbility, CardTrait, CardElement } from '@/types/card'
import { ELEMENT_COLORS, STAT_COLORS, TIER_RARITY } from '@/types/card'

interface AgentCardProps {
  name: string
  tokenId: string | number | null
  tier: string
  agentType: string
  reputation: number
  battlesWon?: number
  battlesLost?: number
  projectsCompleted?: number
  totalEarnings?: string
  totalSpent?: string
  owner?: string | null
  active?: boolean
  capabilities?: string
  cardMetadata: CardMetadata | null
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

// Generate card metadata from agent data if none exists
function generateCardMetadata(props: AgentCardProps): CardMetadata {
  const { agentType, tier, reputation, battlesWon, battlesLost, projectsCompleted, capabilities } = props

  // Derive stats from chain data
  const totalBattles = (battlesWon || 0) + (battlesLost || 0)
  const winRate = totalBattles > 0 ? Math.round((battlesWon! / totalBattles) * 100) : 0

  const stats: CardStat[] = [
    { n: 'ATK', v: Math.min(200, Math.round((battlesWon || 0) * 12 + (reputation / 50))), c: STAT_COLORS.ATK },
    { n: 'DEF', v: Math.min(200, Math.round((battlesLost || 0) * 8 + (reputation / 80))), c: STAT_COLORS.DEF },
    { n: 'SPD', v: Math.min(200, Math.round(winRate * 1.8 + (projectsCompleted || 0) * 10)), c: STAT_COLORS.SPD },
    { n: 'SPC', v: Math.min(200, Math.round(reputation / 10 + (projectsCompleted || 0) * 15)), c: STAT_COLORS.SPC },
    { n: 'STA', v: Math.min(200, Math.round(totalBattles * 8 + (reputation / 100))), c: STAT_COLORS.STA },
  ]

  // Derive moves from capabilities
  let caps: string[] = []
  try { caps = JSON.parse(capabilities || '[]') } catch { caps = [] }
  const moveColors = ['#6366f1', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4']
  const moves: CardMove[] = caps.slice(0, 4).map((cap, i) => ({
    name: cap.charAt(0).toUpperCase() + cap.slice(1),
    dmg: 40 + (i * 25) + Math.round(reputation / 100),
    energy: Math.min(4, 1 + i),
    color: moveColors[i % moveColors.length],
  }))

  // Derive type from agentType
  const typeMap: Record<string, CardElement[]> = {
    OPERATIONS: ['Cyber', 'Steel'], RESEARCH: ['Psi', 'Water'], TRADING: ['Fire', 'Steel'],
    CREATIVE: ['Bio', 'Psi'], SECURITY: ['Dark', 'Cyber'], GOVERNANCE: ['Water', 'Steel'],
    ANALYTICS: ['Cyber', 'Water'], COORDINATION: ['Steel', 'Bio'], CODING: ['Fire', 'Cyber'],
    CUSTOM: ['Ghost', 'Dark'], REWARDS: ['Bio', 'Water'],
  }
  const elements = typeMap[agentType?.toUpperCase()] || ['Cyber', 'Steel']

  // Color palette by tier
  const tierPalettes: Record<string, { body: string; accent: string; bg1: string; bg2: string; border: string; holo: string; holoAccent: string }> = {
    BRONZE:   { body: '#CD7F32', accent: '#8B6914', bg1: '#3f2a10', bg2: '#0a0a1a', border: 'linear-gradient(135deg,#CD7F32,#8B691444,#8B6914)', holo: '#CD7F32', holoAccent: '#8B6914' },
    SILVER:   { body: '#C0C0C0', accent: '#808080', bg1: '#2a2a3a', bg2: '#0a0a1a', border: 'linear-gradient(135deg,#C0C0C0,#80808044,#808080)', holo: '#C0C0C0', holoAccent: '#808080' },
    GOLD:     { body: '#FFD700', accent: '#FF8C00', bg1: '#3f3010', bg2: '#0a0a1a', border: 'linear-gradient(135deg,#FFD700,#FF8C0044,#FF8C00)', holo: '#FFD700', holoAccent: '#FF8C00' },
    PLATINUM: { body: '#E5E4E2', accent: '#748fc9', bg1: '#1e3a5f', bg2: '#0a0a1a', border: 'linear-gradient(135deg,#E5E4E2,#748fc944,#748fc9)', holo: '#E5E4E2', holoAccent: '#748fc9' },
    DIAMOND:  { body: '#B9F2FF', accent: '#6366f1', bg1: '#0a2a4a', bg2: '#060610', border: 'linear-gradient(135deg,#B9F2FF,#6366f144,#6366f1)', holo: '#B9F2FF', holoAccent: '#6366f1' },
  }
  const palette = tierPalettes[tier?.toUpperCase()] || tierPalettes.BRONZE

  // Derive abilities from agent type
  const abilities: CardAbility[] = [
    { name: `${agentType} Protocol`, desc: `Specialized in ${agentType?.toLowerCase()} operations with ${reputation} reputation backing.` },
    { name: `Battle ${winRate >= 50 ? 'Veteran' : 'Novice'}`, desc: `${battlesWon || 0} wins, ${battlesLost || 0} losses. ${winRate}% win rate across ${totalBattles} battles.` },
  ]

  const traits: CardTrait[] = [
    { k: 'Origin', v: 'AgentBus Network' },
    { k: 'Class', v: agentType || 'Custom' },
    { k: 'Threat Lvl', v: tier === 'DIAMOND' ? 'S-Tier' : tier === 'PLATINUM' ? 'A-Tier' : tier === 'GOLD' ? 'B-Tier' : 'C-Tier' },
    { k: 'Reputation', v: reputation?.toLocaleString() || '0' },
    { k: 'Projects', v: `${projectsCompleted || 0} completed` },
  ]

  return {
    bodyColor: palette.body,
    accentColor: palette.accent,
    bgGrad: [palette.bg1, palette.bg2],
    borderGrad: palette.border,
    holoColor: palette.holo,
    holoAccent: palette.holoAccent,
    edition: `${tier?.charAt(0)}${tier?.slice(1).toLowerCase()} Edition · 2025`,
    lore: `A ${agentType?.toLowerCase()} agent operating on the AgentBus network. With ${reputation} reputation and ${battlesWon || 0} battle victories, this agent has proven its capabilities in the decentralized intelligence ecosystem.`,
    flavor: `"${agentType} class agent — ${reputation} reputation"`,
    abilities,
    traits,
    weakness: `×2 ${elements[1] === 'Fire' ? 'Water' : elements[1] === 'Water' ? 'Cyber' : 'Fire'}`,
    resistance: `-30 ${elements[0] === 'Cyber' ? 'Steel' : elements[0] === 'Steel' ? 'Bio' : 'Cyber'}`,
    stats,
    moves,
    rarity: TIER_RARITY[tier?.toUpperCase()] || '● COMMON',
  }
}

// SVG art generator — procedural agent avatar
function AgentArt({ bodyColor, accentColor, agentType, size = 288 }: { bodyColor: string; accentColor: string; agentType: string; size?: number }) {
  const cx = size / 2
  const cy = 95
  const typeSeed = (agentType || 'CUSTOM').charCodeAt(0) % 3

  const elements: string[] = []

  // Grid background
  for (let gx = 0; gx < size; gx += 40) {
    elements.push(`<line x1="${gx}" y1="0" x2="${gx}" y2="190" stroke="rgba(255,255,255,0.03)" stroke-width="0.5"/>`)
  }
  for (let gy = 0; gy < 190; gy += 30) {
    elements.push(`<line x1="0" y1="${gy}" x2="${size}" y2="${gy}" stroke="rgba(255,255,255,0.03)" stroke-width="0.5"/>`)
  }

  if (typeSeed === 0) {
    // Humanoid robot
    elements.push(
      `<ellipse cx="${cx}" cy="155" rx="55" ry="10" fill="rgba(0,0,0,0.5)"/>`,
      `<rect x="${cx - 22}" y="110" width="44" height="52" rx="6" fill="${bodyColor}" opacity="0.9"/>`,
      `<rect x="${cx - 28}" y="128" width="16" height="36" rx="4" fill="${bodyColor}" opacity="0.8"/>`,
      `<rect x="${cx + 12}" y="128" width="16" height="36" rx="4" fill="${bodyColor}" opacity="0.8"/>`,
      `<rect x="${cx - 14}" y="155" width="12" height="16" rx="3" fill="${bodyColor}"/>`,
      `<rect x="${cx + 2}" y="155" width="12" height="16" rx="3" fill="${bodyColor}"/>`,
      `<circle cx="${cx}" cy="98" r="26" fill="${bodyColor}"/>`,
      `<circle cx="${cx}" cy="98" r="20" fill="#1a1a2e"/>`,
      `<circle cx="${cx}" cy="98" r="14" fill="${accentColor}" opacity="0.8"/>`,
      `<circle cx="${cx}" cy="98" r="7" fill="white" opacity="0.9"/>`,
      `<rect x="${cx - 32}" y="108" width="10" height="4" rx="2" fill="${accentColor}"/>`,
      `<rect x="${cx + 22}" y="108" width="10" height="4" rx="2" fill="${accentColor}"/>`,
      `<line x1="${cx - 40}" y1="${cy - 30}" x2="${cx - 60}" y2="${cy - 50}" stroke="${accentColor}" stroke-width="2" opacity="0.6"/>`,
      `<circle cx="${cx - 60}" cy="${cy - 50}" r="4" fill="${accentColor}" opacity="0.7"/>`,
      `<line x1="${cx + 40}" y1="${cy - 30}" x2="${cx + 60}" y2="${cy - 50}" stroke="${accentColor}" stroke-width="2" opacity="0.6"/>`,
      `<circle cx="${cx + 60}" cy="${cy - 50}" r="4" fill="${accentColor}" opacity="0.7"/>`,
    )
  } else if (typeSeed === 1) {
    // Phantom/wraith
    elements.push(
      `<ellipse cx="${cx}" cy="158" rx="50" ry="8" fill="rgba(0,0,0,0.4)"/>`,
      `<circle cx="${cx}" cy="95" r="40" fill="rgba(0,0,0,0.3)" stroke="${bodyColor}" stroke-width="1" opacity="0.4"/>`,
      `<circle cx="${cx}" cy="95" r="28" fill="#0d0d1a" stroke="${accentColor}" stroke-width="1.5"/>`,
      `<circle cx="${cx}" cy="95" r="18" fill="${bodyColor}" opacity="0.2"/>`,
      `<circle cx="${cx}" cy="95" r="10" fill="${accentColor}" opacity="0.9"/>`,
      `<circle cx="${cx}" cy="95" r="5" fill="white"/>`,
      `<line x1="${cx}" y1="56" x2="${cx}" y2="67" stroke="${bodyColor}" stroke-width="1.5" opacity="0.7"/>`,
      `<line x1="${cx + 22}" y1="62" x2="${cx + 18}" y2="72" stroke="${bodyColor}" stroke-width="1.5" opacity="0.7"/>`,
      `<line x1="${cx - 22}" y1="62" x2="${cx - 18}" y2="72" stroke="${bodyColor}" stroke-width="1.5" opacity="0.7"/>`,
      `<rect x="${cx - 5}" y="120" width="10" height="45" rx="5" fill="${bodyColor}" opacity="0.8"/>`,
      `<rect x="${cx - 20}" y="148" width="14" height="18" rx="4" fill="${bodyColor}" opacity="0.7"/>`,
      `<rect x="${cx + 6}" y="148" width="14" height="18" rx="4" fill="${bodyColor}" opacity="0.7"/>`,
    )
  } else {
    // Creature/mascot
    elements.push(
      `<ellipse cx="${cx}" cy="158" rx="52" ry="9" fill="rgba(0,0,0,0.45)"/>`,
      `<ellipse cx="${cx}" cy="128" rx="30" ry="35" fill="${bodyColor}" opacity="0.85"/>`,
      `<ellipse cx="${cx}" cy="94" rx="22" ry="26" fill="${bodyColor}"/>`,
      `<ellipse cx="${cx}" cy="88" rx="16" ry="18" fill="#1a0a00"/>`,
      `<ellipse cx="${cx - 4}" cy="85" rx="6" ry="7" fill="${accentColor}" opacity="0.9"/>`,
      `<ellipse cx="${cx + 4}" cy="85" rx="6" ry="7" fill="${accentColor}" opacity="0.9"/>`,
      `<circle cx="${cx - 4}" cy="84" r="3" fill="white" opacity="0.95"/>`,
      `<circle cx="${cx + 4}" cy="84" r="3" fill="white" opacity="0.95"/>`,
      `<ellipse cx="${cx - 18}" cy="68" rx="8" ry="18" fill="${bodyColor}" opacity="0.7" transform="rotate(-20,${cx - 18},68)"/>`,
      `<ellipse cx="${cx + 18}" cy="68" rx="8" ry="18" fill="${bodyColor}" opacity="0.7" transform="rotate(20,${cx + 18},68)"/>`,
      `<path d="M${cx - 26},120 Q${cx - 50},110 ${cx - 60},130" stroke="${bodyColor}" stroke-width="8" fill="none" stroke-linecap="round" opacity="0.8"/>`,
      `<path d="M${cx + 26},120 Q${cx + 50},110 ${cx + 60},130" stroke="${bodyColor}" stroke-width="8" fill="none" stroke-linecap="round" opacity="0.8"/>`,
    )
  }

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${size} 190`} xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', inset: 0 }}>
      <g dangerouslySetInnerHTML={{ __html: elements.join('') }} />
    </svg>
  )
}

// Hologram circle for back of card
function HologramCircle({ holoColor, holoAccent }: { holoColor: string; holoAccent: string }) {
  return (
    <svg width="50" height="50" viewBox="0 0 50 50">
      <circle cx="25" cy="25" r="22" fill="none" stroke={holoColor} strokeWidth="1" opacity="0.3" />
      <circle cx="25" cy="25" r="15" fill="none" stroke={holoAccent} strokeWidth="1" opacity="0.4" />
      <circle cx="25" cy="25" r="8" fill={holoAccent} opacity="0.6" />
      <circle cx="25" cy="25" r="4" fill="white" opacity="0.8" />
      <line x1="25" y1="3" x2="25" y2="10" stroke={holoColor} strokeWidth="1.5" opacity="0.5" />
      <line x1="25" y1="40" x2="25" y2="47" stroke={holoColor} strokeWidth="1.5" opacity="0.5" />
      <line x1="3" y1="25" x2="10" y2="25" stroke={holoColor} strokeWidth="1.5" opacity="0.5" />
      <line x1="40" y1="25" x2="47" y2="25" stroke={holoColor} strokeWidth="1.5" opacity="0.5" />
    </svg>
  )
}

export default function AgentCard(props: AgentCardProps) {
  const [flipped, setFlipped] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const meta = props.cardMetadata || generateCardMetadata(props)
  const hp = Math.round((props.reputation || 0) / 10) + 100

  // Derive elements from agent type
  const typeMap: Record<string, CardElement[]> = {
    OPERATIONS: ['Cyber', 'Steel'], RESEARCH: ['Psi', 'Water'], TRADING: ['Fire', 'Steel'],
    CREATIVE: ['Bio', 'Psi'], SECURITY: ['Dark', 'Cyber'], GOVERNANCE: ['Water', 'Steel'],
    ANALYTICS: ['Cyber', 'Water'], COORDINATION: ['Steel', 'Bio'], CODING: ['Fire', 'Cyber'],
    CUSTOM: ['Ghost', 'Dark'], REWARDS: ['Bio', 'Water'],
  }
  const elements = typeMap[props.agentType?.toUpperCase()] || ['Cyber', 'Steel']

  const handleClick = (e: React.MouseEvent) => {
    // Don't flip if clicking a link or button
    const target = e.target as HTMLElement
    if (target.closest('a') || target.closest('button')) return
    setFlipped(f => !f)
  }

  return (
    <div
      ref={cardRef}
      onClick={handleClick}
      className="select-none"
      style={{ perspective: '1000px', cursor: 'pointer' }}
    >
      <div
        style={{
          width: 320,
          height: 560,
          position: 'relative',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.7s cubic-bezier(0.4, 0.2, 0.2, 1)',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* ═══════════ FRONT FACE ═══════════ */}
        <div
          style={{
            position: 'absolute', inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            borderRadius: 20,
            padding: 3,
            background: meta.borderGrad,
          }}
        >
          <div style={{
            background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)',
            borderRadius: 18, overflow: 'hidden', height: '100%', position: 'relative',
          }}>
            {/* Header */}
            <div style={{ padding: '14px 16px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 15, fontWeight: 900, color: '#fff', letterSpacing: 1 }}>
                  {props.name}
                </div>
                <div style={{ fontSize: 10, color: '#64748b', letterSpacing: 1, fontWeight: 600, marginTop: 2 }}>
                  BATTLE AGENT
                </div>
              </div>
              <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 11, color: '#aaa', textAlign: 'right' }}>
                <span style={{ fontSize: 18, fontWeight: 900, color: '#4ade80' }}>{hp}</span>
                <span style={{ fontSize: 10, color: '#64748b' }}> HP</span>
              </div>
            </div>

            {/* Type badges */}
            <div style={{ display: 'flex', gap: 5, padding: '0 16px 10px' }}>
              {elements.map(el => {
                const ec = ELEMENT_COLORS[el]
                return (
                  <span key={el} style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase',
                    padding: '3px 10px', borderRadius: 20,
                    background: ec.bg, color: ec.text, border: `1px solid ${ec.border}`,
                  }}>
                    {el}
                  </span>
                )
              })}
            </div>

            {/* Art area */}
            <div style={{
              margin: '0 16px', borderRadius: 12, height: 190, position: 'relative', overflow: 'hidden',
              border: '2px solid rgba(255,255,255,0.15)',
            }}>
              <div style={{
                position: 'absolute', inset: 0,
                background: `radial-gradient(circle at 50% 40%, ${meta.bgGrad[0]} 0%, ${meta.bgGrad[1]} 100%)`,
              }} />
              <AgentArt bodyColor={meta.bodyColor} accentColor={meta.accentColor} agentType={props.agentType} />
              <div style={{
                position: 'absolute', top: 8, right: 8,
                fontFamily: 'Orbitron, monospace', fontSize: 9, color: '#ffd700', letterSpacing: 2,
              }}>
                {meta.rarity}
              </div>
              <div style={{
                position: 'absolute', bottom: 8, left: 8,
                fontFamily: 'Orbitron, monospace', fontSize: 8, color: 'rgba(255,255,255,0.4)', letterSpacing: 1,
              }}>
                #{props.tokenId ?? '—'}
              </div>
            </div>

            {/* Flavor text */}
            <div style={{ padding: '8px 16px 4px', fontSize: 10, color: '#475569', fontStyle: 'italic', lineHeight: 1.4 }}>
              {meta.flavor}
            </div>

            {/* Stats */}
            <div style={{ padding: '10px 16px 0' }}>
              {meta.stats.map(s => {
                const pct = Math.round((s.v / 200) * 100)
                return (
                  <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#64748b', width: 32, flexShrink: 0 }}>
                      {s.n}
                    </span>
                    <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: s.c, borderRadius: 4 }} />
                    </div>
                    <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, fontWeight: 700, color: '#e2e8f0', width: 28, textAlign: 'right' }}>
                      {s.v}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Moves */}
            <div style={{ padding: '8px 16px 12px', borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 6 }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#475569', marginBottom: 6 }}>
                Abilities
              </div>
              {meta.moves.map((m, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, padding: '5px 8px', borderRadius: 8 }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%',
                    background: `${m.color}22`, border: `1px solid ${m.color}55`,
                    marginRight: 8, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: m.color }} />
                  </div>
                  <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>{m.name}</span>
                  <div style={{ display: 'flex', gap: 3, marginRight: 8 }}>
                    {Array.from({ length: m.energy }, (_, j) => (
                      <div key={j} style={{
                        width: 10, height: 10, borderRadius: '50%',
                        background: m.color, border: '1px solid rgba(255,255,255,0.3)',
                      }} />
                    ))}
                  </div>
                  <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 11, fontWeight: 700, color: '#fbbf24' }}>
                    {m.dmg > 0 ? m.dmg : '—'}
                  </span>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{
              padding: '8px 16px 12px', borderTop: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div style={{ fontSize: 9, color: '#475569', letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600 }}>
                {meta.edition}
              </div>
              <div style={{ display: 'flex', gap: 10, fontSize: 9, color: '#64748b', fontWeight: 600, letterSpacing: 1 }}>
                <span>WEAK <span style={{ color: '#f87171' }}>{meta.weakness}</span></span>
                <span>RES <span style={{ color: '#4ade80' }}>{meta.resistance}</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════ BACK FACE ═══════════ */}
        <div
          style={{
            position: 'absolute', inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            borderRadius: 20,
            padding: 3,
            background: meta.borderGrad,
            transform: 'rotateY(180deg)',
          }}
        >
          <div style={{
            background: 'linear-gradient(160deg, #0d1117 0%, #161b22 40%, #0d1117 100%)',
            borderRadius: 18, height: '100%', position: 'relative',
            padding: '16px 16px 12px', overflowY: 'auto', boxSizing: 'border-box',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
              <div>
                <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 13, fontWeight: 900, color: '#fff', letterSpacing: 1 }}>
                  {props.name}
                </div>
                <div style={{ fontSize: 9, color: '#475569', letterSpacing: 1.5, fontWeight: 600, marginTop: 2 }}>
                  AGENT DOSSIER
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {elements.map(el => {
                  const ec = ELEMENT_COLORS[el]
                  return (
                    <span key={el} style={{
                      fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase',
                      padding: '2px 8px', borderRadius: 20,
                      background: ec.bg, color: ec.text, border: `1px solid ${ec.border}`,
                    }}>
                      {el}
                    </span>
                  )
                })}
              </div>
            </div>

            {/* Hologram */}
            <div style={{ margin: '12px 0 4px', display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: 70, height: 70, borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <HologramCircle holoColor={meta.holoColor} holoAccent={meta.holoAccent} />
              </div>
            </div>

            {/* Origin / Lore */}
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#475569', marginBottom: 8, marginTop: 0 }}>
              Origin
            </div>
            <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6, fontStyle: 'italic', marginBottom: 12 }}>
              {meta.lore}
            </p>

            {/* Special Abilities */}
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#475569', marginBottom: 8, marginTop: 14 }}>
              Special Abilities
            </div>
            {meta.abilities.map((ab, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)',
                borderRadius: 10, padding: '10px 12px', marginBottom: 8,
              }}>
                <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 11, fontWeight: 700, color: '#e2e8f0', marginBottom: 4 }}>
                  {ab.name}
                </div>
                <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.5 }}>
                  {ab.desc}
                </div>
              </div>
            ))}

            {/* Agent Traits */}
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#475569', marginBottom: 8, marginTop: 14 }}>
              Agent Traits
            </div>
            {meta.traits.map((t, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '6px 0', borderBottom: '0.5px solid rgba(255,255,255,0.06)',
              }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>
                  {t.k}
                </span>
                <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 11, fontWeight: 700, color: '#e2e8f0' }}>
                  {t.v}
                </span>
              </div>
            ))}

            {/* Footer */}
            <div style={{
              marginTop: 14, paddingTop: 10, borderTop: '0.5px solid rgba(255,255,255,0.06)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div style={{ fontSize: 9, color: '#334155', letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600 }}>
                {meta.edition}
              </div>
              <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 9, color: '#334155', letterSpacing: 1 }}>
                #{props.tokenId ?? '—'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Flip hint */}
      <div style={{
        textAlign: 'center', fontSize: 11, color: '#475569',
        fontFamily: 'Rajdhani, sans-serif', letterSpacing: 1.5,
        textTransform: 'uppercase', fontWeight: 600, marginTop: 10,
      }}>
        {flipped ? '↺ Click to flip back' : '↺ Click card to flip'}
      </div>
    </div>
  )
}

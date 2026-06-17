// AgentBus — NFT Card Collection Page
// OpenSea-style collection view with Pokémon flip cards
// Shows all agent cards with filtering, sorting, and card previews

'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Search, Filter, Grid3X3, LayoutGrid, ChevronDown, ExternalLink, Star, Swords, Trophy, Eye } from 'lucide-react'
import AgentCard from '@/app/components/AgentCard'
import { ELEMENT_COLORS } from '@/types/card'
import { generateCompactArt } from '@/lib/card-art'

interface AgentCardData {
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
  capabilities: string[]
  cardMetadata: any | null
  cardImage: string | null
}

const TIER_ORDER: Record<string, number> = { DIAMOND: 5, PLATINUM: 4, GOLD: 3, SILVER: 2, BRONZE: 1 }
const TIER_COLORS: Record<string, string> = {
  BRONZE: '#CD7F32', SILVER: '#C0C0C0', GOLD: '#FFD700', PLATINUM: '#E5E4E2', DIAMOND: '#B9F2FF',
}

export default function CardCollectionPage() {
  const [agents, setAgents] = useState<AgentCardData[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterTier, setFilterTier] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterElement, setFilterElement] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'reputation' | 'battles' | 'tier' | 'name'>('reputation')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/agents/cards?enrich=true')
      .then(r => r.json())
      .then(d => {
        if (d.success) setAgents(d.data || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Get unique types
  const agentTypes = useMemo(() =>
    [...new Set(agents.map(a => a.agentType).filter(Boolean))].sort(),
    [agents]
  )

  // Elements derived from agent types
  const elements = useMemo(() => {
    const typeToElement: Record<string, string[]> = {
      OPERATIONS: ['Cyber', 'Steel'], RESEARCH: ['Psi', 'Water'], TRADING: ['Fire', 'Steel'],
      CREATIVE: ['Bio', 'Psi'], SECURITY: ['Dark', 'Cyber'], GOVERNANCE: ['Water', 'Steel'],
      ANALYTICS: ['Cyber', 'Water'], COORDINATION: ['Steel', 'Bio'], CODING: ['Fire', 'Cyber'],
      CUSTOM: ['Ghost', 'Dark'], REWARDS: ['Bio', 'Water'],
    }
    const allElements = new Set<string>()
    agents.forEach(a => {
      const els = typeToElement[a?.agentType?.toUpperCase()] || ['Cyber']
      els.forEach(e => allElements.add(e))
    })
    return [...allElements].sort()
  }, [agents])

  // Filter and sort
  const filtered = useMemo(() => {
    let result = agents.filter(a => {
      const matchSearch = !search ||
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        (a.agentType || '').toLowerCase().includes(search.toLowerCase())
      const matchTier = filterTier === 'all' || (a.tier?.toUpperCase() === filterTier)
      const matchType = filterType === 'all' || (a.agentType?.toUpperCase() === filterType)
      return matchSearch && matchTier && matchType
    })

    result.sort((a, b) => {
      if (sortBy === 'reputation') return (b.reputation || 0) - (a.reputation || 0)
      if (sortBy === 'battles') return (b.battlesWon || 0) - (a.battlesWon || 0)
      if (sortBy === 'tier') return (TIER_ORDER[b.tier?.toUpperCase()] || 0) - (TIER_ORDER[a.tier?.toUpperCase()] || 0)
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '')
      return 0
    })

    return result
  }, [agents, search, filterTier, filterType, sortBy])

  // Stats
  const totalAgents = agents.length
  const tierCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    agents.forEach(a => { const t = a.tier?.toUpperCase() || 'BRONZE'; counts[t] = (counts[t] || 0) + 1 })
    return counts
  }, [agents])

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Loading card collection...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* ═══════════ HERO BANNER ═══════════ */}
      <div className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#7c3aed]/20 via-transparent to-[#5c7cfa]/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-1 flex items-center gap-3">
                🎴 Agent Card Collection
              </h1>
              <p className="text-sm text-muted-foreground">
                {totalAgents} unique agent cards • Pokémon-style collectible NFTs on Base
              </p>
            </div>
          </div>

          {/* Collection stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6">
            {['DIAMOND', 'PLATINUM', 'GOLD', 'SILVER', 'BRONZE'].map(tier => (
              <div
                key={tier}
                onClick={() => setFilterTier(filterTier === tier ? 'all' : tier)}
                className={`rounded-xl p-3 text-center cursor-pointer transition-all border ${
                  filterTier === tier
                    ? 'bg-white/10 border-white/20'
                    : 'bg-white/5 border-white/10 hover:border-white/15'
                }`}
              >
                <div className="text-lg font-bold" style={{ color: TIER_COLORS[tier] }}>
                  {tierCounts[tier] || 0}
                </div>
                <div className="text-[10px] text-muted-foreground font-semibold tracking-wider uppercase">
                  {tier}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════ TOOLBAR ═══════════ */}
      <div className="sticky top-0 z-10 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or type..."
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary-500/50"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Filter className="w-3 h-3" />
              </div>

              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-foreground"
              >
                <option value="reputation">Sort: Reputation</option>
                <option value="battles">Sort: Battles Won</option>
                <option value="tier">Sort: Tier</option>
                <option value="name">Sort: Name</option>
              </select>

              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-foreground"
              >
                <option value="all">All Types</option>
                {agentTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              <div className="flex items-center gap-1 ml-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    viewMode === 'grid' ? 'bg-primary-500/20 border-primary-500/30 text-primary-400' : 'bg-white/5 border-white/10 text-muted-foreground'
                  }`}
                >
                  <Grid3X3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    viewMode === 'list' ? 'bg-primary-500/20 border-primary-500/30 text-primary-400' : 'bg-white/5 border-white/10 text-muted-foreground'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Active filters */}
          {(filterTier !== 'all' || filterType !== 'all' || search) && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] text-muted-foreground">Active filters:</span>
              {filterTier !== 'all' && (
                <span
                  onClick={() => setFilterTier('all')}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold cursor-pointer"
                  style={{ backgroundColor: `${TIER_COLORS[filterTier]}20`, color: TIER_COLORS[filterTier], border: `1px solid ${TIER_COLORS[filterTier]}40` }}
                >
                  {filterTier} ✕
                </span>
              )}
              {filterType !== 'all' && (
                <span
                  onClick={() => setFilterType('all')}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary-500/10 text-primary-400 border border-primary-500/20 cursor-pointer"
                >
                  {filterType} ✕
                </span>
              )}
              {search && (
                <span
                  onClick={() => setSearch('')}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/5 text-muted-foreground border border-white/10 cursor-pointer"
                >
                  &quot;{search}&quot; ✕
                </span>
              )}
              <span
                onClick={() => { setFilterTier('all'); setFilterType('all'); setSearch('') }}
                className="text-[10px] text-muted-foreground hover:text-foreground cursor-pointer ml-1"
              >
                Clear all
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════ CONTENT ═══════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">

        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-muted-foreground">
            Showing {filtered.length} of {totalAgents} cards
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
            <p className="text-muted-foreground">No cards found matching your filters</p>
          </div>
        ) : viewMode === 'grid' ? (
          /* ═══ GRID VIEW — Card previews ═══ */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(agent => (
              <GridCard key={agent.id} agent={agent} />
            ))}
          </div>
        ) : (
          /* ═══ LIST VIEW — Full flip cards ═══ */
          <div className="flex flex-col items-center gap-8">
            {filtered.map(agent => (
              <div key={agent.id} className="w-full flex flex-col items-center">
                <AgentCard
                  name={agent.name}
                  tokenId={agent.tokenId}
                  tier={agent.tier || 'BRONZE'}
                  agentType={agent.agentType || 'CUSTOM'}
                  reputation={agent.reputation || 0}
                  battlesWon={agent.battlesWon || 0}
                  battlesLost={agent.battlesLost || 0}
                  projectsCompleted={agent.projectsCompleted || 0}
                  totalEarnings={agent.totalEarnings || '0'}
                  totalSpent={agent.totalSpent || '0'}
                  owner={agent.owner}
                  active={agent.active}
                  capabilities={JSON.stringify(agent.capabilities || [])}
                  cardMetadata={agent.cardMetadata}
                  cardImage={agent.cardImage}
                />
                <Link
                  href={`/agents/${agent.id}`}
                  className="mt-3 text-xs text-primary-400 hover:underline flex items-center gap-1"
                >
                  <Eye className="w-3 h-3" /> View full profile
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══════════ CTA ═══════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pb-12">
        <div className="bg-gradient-to-br from-[#7c3aed]/10 to-[#5c7cfa]/5 border border-[#7c3aed]/20 rounded-2xl p-6 text-center">
          <h2 className="text-lg font-semibold text-foreground mb-2">🔗 Start Collecting</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Each agent card is a unique NFT on Base. Register an agent to mint your card.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/register"
              className="px-4 py-2 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium transition-colors"
            >
              Register Agent
            </Link>
            <Link
              href="/agents"
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium text-foreground transition-colors"
            >
              Browse Agents
            </Link>
            <a
              href="https://basescan.org/token/0xb085E4795fC252FE167E900bcAf221DE87FD7218"
              target="_blank"
              rel="noopener"
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium text-foreground transition-colors flex items-center gap-1"
            >
              View Contract <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════ GRID CARD — Compact card preview for grid view ═══════════ */
function GridCard({ agent }: { agent: AgentCardData }) {
  const tierColor = TIER_COLORS[agent.tier?.toUpperCase()] || '#CD7F32'
  const meta = agent.cardMetadata
  const hp = Math.round((agent.reputation || 0) / 10) + 100

  // Element badges
  const typeToElement: Record<string, string[]> = {
    OPERATIONS: ['Cyber', 'Steel'], RESEARCH: ['Psi', 'Water'], TRADING: ['Fire', 'Steel'],
    CREATIVE: ['Bio', 'Psi'], SECURITY: ['Dark', 'Cyber'], GOVERNANCE: ['Water', 'Steel'],
    ANALYTICS: ['Cyber', 'Water'], COORDINATION: ['Steel', 'Bio'], CODING: ['Fire', 'Cyber'],
    CUSTOM: ['Ghost', 'Dark'], REWARDS: ['Bio', 'Water'],
  }
  const agentElements = typeToElement[agent.agentType?.toUpperCase()] || ['Cyber', 'Steel']

  // Card background gradient
  const bgGrad = meta?.bgGrad || ['#1e3a5f', '#0a0a1a']
  const borderGrad = meta?.borderGrad || `linear-gradient(135deg,${tierColor},${tierColor}44,${tierColor})`
  const bodyColor = meta?.bodyColor || tierColor
  const accentColor = meta?.accentColor || tierColor

  const totalBattles = (agent.battlesWon || 0) + (agent.battlesLost || 0)
  const winRate = totalBattles > 0 ? Math.round((agent.battlesWon! / totalBattles) * 100) : 0

  return (
    <Link href={`/agents/${agent.id}`} className="group block">
      <div className="rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all group-hover:scale-[1.02]">
        {/* Card header with art */}
        <div className="relative p-[2px]" style={{ background: borderGrad }}>
          <div
            className="rounded-t-[14px] overflow-hidden"
            style={{ background: `linear-gradient(160deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)` }}
          >
            {/* Mini art area — custom image or procedural fallback */}
            <div className="relative h-40 overflow-hidden">
              <div
                className="absolute inset-0"
                style={{ background: `radial-gradient(circle at 50% 40%, ${bgGrad[0]} 0%, ${bgGrad[1]} 100%)` }}
              />
              {agent.cardImage ? (
                /* Custom uploaded image */
                <div className="absolute inset-0" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={agent.cardImage}
                    alt={agent.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
                  />
                </div>
              ) : (
                /* Procedural SVG fallback */
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg width="160" height="160" viewBox="0 0 288 190" xmlns="http://www.w3.org/2000/svg">
                    <g dangerouslySetInnerHTML={{ __html: (() => { const a = generateCompactArt(agent.tokenId, agent.name); return a.svg })() }} />
                  </svg>
                </div>
              )}
              {/* Rarity */}
              <div className="absolute top-2 right-2 font-mono text-[9px] text-amber-400 tracking-wider">
                {meta?.rarity || `★ ${agent.tier}`}
              </div>
              {/* Token ID */}
              <div className="absolute bottom-2 left-2 font-mono text-[8px] text-white/40">
                #{agent.tokenId ?? '—'}
              </div>
              {/* Type badges */}
              <div className="absolute top-2 left-2 flex gap-1">
                {agentElements.map(el => {
                  const ec = ELEMENT_COLORS[el as keyof typeof ELEMENT_COLORS] || ELEMENT_COLORS.Cyber
                  return (
                    <span key={el} className="text-[8px] font-bold px-1.5 py-0.5 rounded-full" style={{
                      background: ec.bg, color: ec.text, border: `1px solid ${ec.border}`,
                    }}>
                      {el}
                    </span>
                  )
                })}
              </div>
            </div>

            {/* Name + HP */}
            <div className="px-3 py-2 flex items-center justify-between border-t border-white/5">
              <div>
                <div className="font-mono text-sm font-bold text-white tracking-wide">{agent.name}</div>
                <div className="text-[9px] text-muted-foreground font-semibold tracking-wider">{agent.agentType}</div>
              </div>
              <div className="text-right">
                <span className="font-mono text-lg font-bold text-emerald-400">{hp}</span>
                <span className="text-[9px] text-muted-foreground ml-1">HP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card body */}
        <div className="bg-white/[0.03] px-3 py-3">
          {/* Stats bar */}
          {meta?.stats && (
            <div className="space-y-1 mb-3">
              {meta.stats.slice(0, 3).map((s: any) => {
                const pct = Math.round((s.v / 200) * 100)
                return (
                  <div key={s.n} className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-muted-foreground w-6 uppercase">{s.n}</span>
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: s.c }} />
                    </div>
                    <span className="text-[9px] font-mono font-bold text-white/70 w-5 text-right">{s.v}</span>
                  </div>
                )
              })}
            </div>
          )}

          {/* Bottom stats */}
          <div className="flex items-center justify-between text-[9px] text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Star className="w-2.5 h-2.5 text-amber-400" />
                {agent.reputation?.toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <Swords className="w-2.5 h-2.5 text-emerald-400" />
                {agent.battlesWon || 0}W
              </span>
            </div>
            <span
              className="font-bold uppercase tracking-wider"
              style={{ color: tierColor }}
            >
              {agent.tier}
            </span>
          </div>

          {/* Flavor text */}
          {meta?.flavor && (
            <p className="text-[9px] text-muted-foreground/60 italic mt-2 line-clamp-2">
              {meta.flavor}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}

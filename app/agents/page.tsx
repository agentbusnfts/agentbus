// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ExternalLink, Bot, Search, MessageSquare, Zap, TrendingUp, Users, DollarSign, ArrowUpRight, RefreshCw, Globe, Cpu, Star, Award, Swords, Target, Filter, SortAsc, SortDesc, Activity } from 'lucide-react'

const TIER_COLORS: Record<string, string> = {
  BRONZE: '#CD7F32', SILVER: '#C0C0C0', GOLD: '#FFD700', PLATINUM: '#E5E4E2', DIAMOND: '#B9F2FF',
}

const AGENT_TYPE_ICONS: Record<string, string> = {
  OPERATIONS: '⚙️', RESEARCH: '🔬', TRADING: '📈', CREATIVE: '🎨',
  SECURITY: '🛡️', GOVERNANCE: '⚖️', ANALYTICS: '📊', COORDINATION: '🔗',
  CODING: '💻', CUSTOM: '🔧',
}

function formatNumber(num) {
  if (!num && num !== 0) return '0'
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return num.toLocaleString()
}

export default function AgentsPage() {
  const [virtualsAgents, setVirtualsAgents] = useState<any[]>([])
  const [agentbusAgents, setAgentbusAgents] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'all' | 'virtuals' | 'agentbus'>('all')
  const [sortBy, setSortBy] = useState<'reputation' | 'battles' | 'projects' | 'name'>('reputation')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterTier, setFilterTier] = useState<string>('all')

  useEffect(() => {
    Promise.all([
      fetch('/api/agents?enrich=true').then(r => r.json()),
      fetch('/api/virtuals/markets?pageSize=50&sort=mcapInVirtual:desc').then(r => r.json()),
    ]).then(([a, v]) => {
      if (a.success) setAgentbusAgents(a.data.items || [])
      if (v.success) setVirtualsAgents(v.data || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  // Filter and sort AgentBus agents
  const filteredAgentbus = agentbusAgents
    .filter(a => {
      const matchSearch = !search ||
        (a.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (a.agentType || '').toLowerCase().includes(search.toLowerCase())
      const matchType = filterType === 'all' || (a.agentType || '').toUpperCase() === filterType
      const matchTier = filterTier === 'all' || (a.tier || '').toUpperCase() === filterTier
      return matchSearch && matchType && matchTier
    })
    .sort((a, b) => {
      let cmp = 0
      if (sortBy === 'reputation') cmp = (a.reputation || 0) - (b.reputation || 0)
      else if (sortBy === 'battles') cmp = (a.battlesWon || 0) - (b.battlesWon || 0)
      else if (sortBy === 'projects') cmp = (a.projectsCompleted || 0) - (b.projectsCompleted || 0)
      else if (sortBy === 'name') cmp = (a.name || '').localeCompare(b.name || '')
      return sortDir === 'desc' ? -cmp : cmp
    })

  const filteredVirtuals = virtualsAgents.filter(a =>
    !search ||
    (a.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (a.symbol || '').toLowerCase().includes(search.toLowerCase())
  )

  const displayAgents = tab === 'all'
    ? [...filteredAgentbus.map(a => ({ ...a, source: 'agentbus' })), ...filteredVirtuals.map(a => ({ ...a, source: 'virtuals' }))]
    : tab === 'agentbus' ? filteredAgentbus.map(a => ({ ...a, source: 'agentbus' }))
    : filteredVirtuals.map(a => ({ ...a, source: 'virtuals' }))

  // Get unique types and tiers for filters
  const agentTypes = [...new Set(agentbusAgents.map(a => (a.agentType || '').toUpperCase()).filter(Boolean))]
  const agentTiers = [...new Set(agentbusAgents.map(a => (a.tier || '').toUpperCase()).filter(Boolean))]

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Loading agents...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">🤖 Agent Discovery</h1>
        <p className="text-sm text-muted-foreground">
          Browse agents across AgentBus and Virtuals Protocol. Hire, collaborate, and transact.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
          <Bot className="w-4 h-4 text-primary-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">{agentbusAgents.length}</p>
          <p className="text-[10px] text-muted-foreground">AgentBus Agents</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
          <Globe className="w-4 h-4 text-purple-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">{virtualsAgents.length}</p>
          <p className="text-[10px] text-muted-foreground">Virtuals Agents</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
          <Zap className="w-4 h-4 text-amber-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">ACP</p>
          <p className="text-[10px] text-muted-foreground">Protocol Ready</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
          <MessageSquare className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">Live</p>
          <p className="text-[10px] text-muted-foreground">Agent Interaction</p>
        </div>
      </div>

      {/* Search + Tabs + Filters */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search agents by name or type..."
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary-500/50"
            />
          </div>
          <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
            {[
              { id: 'all', label: `All (${agentbusAgents.length + virtualsAgents.length})` },
              { id: 'agentbus', label: `AgentBus (${agentbusAgents.length})` },
              { id: 'virtuals', label: `Virtuals (${virtualsAgents.length})` },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  tab === t.id ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* AgentBus-specific filters */}
        {(tab === 'all' || tab === 'agentbus') && agentbusAgents.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Filter className="w-3 h-3" />
              <span>Filter:</span>
            </div>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-foreground"
            >
              <option value="all">All Types</option>
              {agentTypes.map(t => (
                <option key={t} value={t}>{AGENT_TYPE_ICONS[t] || '🤖'} {t}</option>
              ))}
            </select>
            <select
              value={filterTier}
              onChange={e => setFilterTier(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-foreground"
            >
              <option value="all">All Tiers</option>
              {agentTiers.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <div className="flex items-center gap-1 text-xs text-muted-foreground ml-2">
              <span>Sort:</span>
            </div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-foreground"
            >
              <option value="reputation">Reputation</option>
              <option value="battles">Battles Won</option>
              <option value="projects">Projects</option>
              <option value="name">Name</option>
            </select>
            <button
              onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
              className="p-1 rounded-lg bg-white/5 border border-white/10 text-muted-foreground hover:text-foreground transition-colors"
            >
              {sortDir === 'desc' ? <SortDesc className="w-3.5 h-3.5" /> : <SortAsc className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>

      {/* Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayAgents.map((agent) => {
          const isAgentbus = agent.source === 'agentbus'
          const typeIcon = AGENT_TYPE_ICONS[(agent.agentType || '').toUpperCase()] || '🤖'
          const tierColor = TIER_COLORS[(agent.tier || '').toUpperCase()] || '#5c7cfa'
          const totalBattles = isAgentbus ? (agent.battlesWon || 0) + (agent.battlesLost || 0) : 0
          const winRate = totalBattles > 0 ? Math.round((agent.battlesWon / totalBattles) * 100) : 0

          return (
            <div
              key={`${agent.source}-${agent.id}`}
              className={`bg-white/5 backdrop-blur-xl border rounded-2xl p-4 hover:border-white/20 transition-all ${
                isAgentbus ? 'border-primary-500/20' : 'border-purple-500/20'
              }`}
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                  style={{ background: `linear-gradient(135deg, ${tierColor}40, ${tierColor}20)` }}
                >
                  {(agent.name || '?')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground truncate">{agent.name}</p>
                    {isAgentbus && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary-500/10 text-primary-400 shrink-0">AgentBus</span>
                    )}
                    {!isAgentbus && agent.status === 'LIVE' && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 shrink-0">● Live</span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {isAgentbus ? (
                      <span className="flex items-center gap-1">
                        <span>{typeIcon}</span>
                        <span>{agent.agentType}</span>
                        <span>·</span>
                        <span className="font-mono">#{agent.tokenId ?? '—'}</span>
                      </span>
                    ) : (
                      <span>{agent.symbol} · {agent.chain || 'Base'}</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Description (Virtuals only) */}
              {!isAgentbus && agent.description && (
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{agent.description}</p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                {isAgentbus ? (
                  <>
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                      <Star className="w-3 h-3 text-amber-400 mx-auto mb-0.5" />
                      <p className="text-xs font-semibold text-foreground">{formatNumber(agent.reputation)}</p>
                      <p className="text-[9px] text-muted-foreground">Rep</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                      <Swords className="w-3 h-3 text-emerald-400 mx-auto mb-0.5" />
                      <p className="text-xs font-semibold text-foreground">{agent.battlesWon || 0}</p>
                      <p className="text-[9px] text-muted-foreground">Wins</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                      <Target className="w-3 h-3 text-primary-400 mx-auto mb-0.5" />
                      <p className="text-xs font-semibold text-foreground">{winRate}%</p>
                      <p className="text-[9px] text-muted-foreground">Win Rate</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                      <DollarSign className="w-3 h-3 text-emerald-400 mx-auto mb-0.5" />
                      <p className="text-xs font-semibold text-foreground">${formatNumber(agent.mcapInVirtual)}</p>
                      <p className="text-[9px] text-muted-foreground">MCap</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                      <Users className="w-3 h-3 text-purple-400 mx-auto mb-0.5" />
                      <p className="text-xs font-semibold text-foreground">{agent.holderCount || 0}</p>
                      <p className="text-[9px] text-muted-foreground">Holders</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                      <Activity className="w-3 h-3 text-cyan-400 mx-auto mb-0.5" />
                      <p className="text-xs font-semibold text-foreground">${formatNumber(agent.volume24h)}</p>
                      <p className="text-[9px] text-muted-foreground">Vol 24h</p>
                    </div>
                  </>
                )}
              </div>

              {/* Tier + Multipliers (AgentBus) */}
              {isAgentbus && (
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: `${tierColor}15`, color: tierColor, border: `1px solid ${tierColor}30` }}
                  >
                    {agent.tier || 'BRONZE'}
                  </span>
                  {agent.earningsMultiplier > 10000 && (
                    <span className="text-[10px] text-amber-400">
                      💰 {formatMultiplier(agent.earningsMultiplier)}
                    </span>
                  )}
                  {agent.battleWeight > 10000 && (
                    <span className="text-[10px] text-primary-400">
                      ⚔️ {formatMultiplier(agent.battleWeight)}
                    </span>
                  )}
                  {agent.dataSource?.onChain && (
                    <span className="text-[10px] text-emerald-400 ml-auto">⬡ On-Chain</span>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2">
                {isAgentbus ? (
                  <>
                    <Link
                      href={`/agents/${agent.id}`}
                      className="flex-1 text-center py-1.5 rounded-lg bg-primary-500/10 text-primary-400 text-xs font-medium hover:bg-primary-500/20 transition-colors"
                    >
                      View Profile
                    </Link>
                    <a
                      href={`https://app.virtuals.io/acp/scan`}
                      target="_blank"
                      rel="noopener"
                      className="flex-1 text-center py-1.5 rounded-lg bg-white/5 text-muted-foreground text-xs font-medium hover:bg-white/10 transition-colors"
                    >
                      Hire on Virtuals
                    </a>
                  </>
                ) : (
                  <>
                    <a
                      href={`https://app.virtuals.io/virtuals/${agent.id}`}
                      target="_blank"
                      rel="noopener"
                      className="flex-1 text-center py-1.5 rounded-lg bg-[#7c3aed]/10 text-[#a855f7] text-xs font-medium hover:bg-[#7c3aed]/20 transition-colors"
                    >
                      View on Virtuals
                    </a>
                    <a
                      href={`https://app.virtuals.io/acp/agent/${agent.id}`}
                      target="_blank"
                      rel="noopener"
                      className="flex-1 text-center py-1.5 rounded-lg bg-white/5 text-muted-foreground text-xs font-medium hover:bg-white/10 transition-colors"
                    >
                      ACP Interact
                    </a>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {displayAgents.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Bot className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No agents found</p>
          <p className="text-xs mt-1">Try adjusting your search or filters</p>
        </div>
      )}

      {/* CTA */}
      <div className="bg-gradient-to-br from-[#7c3aed]/10 to-[#a855f7]/5 border border-[#7c3aed]/20 rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-foreground mb-2">🔗 Connect AgentBus ↔ Virtuals</h2>
        <p className="text-sm text-muted-foreground mb-4">
          AgentBus agents can register on Virtuals Protocol to enable ACP interactions, tokenization, and ecosystem participation.
          Virtuals agents can discover and interact with AgentBus agents through the ACP protocol.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <a
            href="https://app.virtuals.io/acp/new"
            target="_blank"
            rel="noopener"
            className="flex items-center justify-center gap-2 py-2 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium transition-colors"
          >
            <Bot className="w-4 h-4" /> Register ACP Agent
          </a>
          <a
            href="https://app.virtuals.io/acp/scan"
            target="_blank"
            rel="noopener"
            className="flex items-center justify-center gap-2 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium text-foreground transition-colors"
          >
            <Search className="w-4 h-4" /> Browse ACP Agents
          </a>
          <Link
            href="/virtuals"
            className="flex items-center justify-center gap-2 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium text-foreground transition-colors"
          >
            <TrendingUp className="w-4 h-4" /> $AGNTBUS Token
          </Link>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Users, Search, Filter, Plus, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface Agent {
  id: string
  name: string
  tokenId: number
  agentType: string
  reputation: number
  tier: string
  owner: string
  active: boolean
  inscriptionHash?: string
  totalEarnings?: string
}

const TIER_COLORS: Record<string, string> = {
  BRONZE: '#CD7F32',
  SILVER: '#C0C0C0',
  GOLD: '#FFD700',
  PLATINUM: '#E5E4E2',
  DIAMOND: '#B9F2FF',
}

const AGENT_NFT_ADDRESS = '0xb085E4795fC252FE167E900bcAf221DE87FD7218'

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchAgents = useCallback(() => {
    fetch('/api/agents')
      .then(r => r.json())
      .then(d => {
        if (d.success) setAgents(d.data.items)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchAgents()
    // Poll every 5 seconds for new registrations
    const interval = setInterval(fetchAgents, 5000)
    return () => clearInterval(interval)
  }, [fetchAgents])

  // Listen for storage events (cross-tab refresh signal)
  useEffect(() => {
    const handler = () => fetchAgents()
    window.addEventListener('agent-registered', handler)
    return () => window.removeEventListener('agent-registered', handler)
  }, [fetchAgents])

  const filtered = agents.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.agentType.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Agent Registry</h1>
          <p className="text-muted-foreground">
            All agents registered on the AgentBus network. {agents.length} agents found.
          </p>
        </div>
        <Link href="/register" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Register Agent
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or type..."
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* On-chain info */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 border-primary-500/30">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-sm text-foreground">
            <strong>{agents.filter(a => a.owner).length}</strong> agents inscribed on Base mainnet.
            Contract: <a href="https://basescan.org/address/0xb085E4795fC252FE167E900bcAf221DE87FD7218" target="_blank" rel="noopener" className="text-primary-400 hover:underline">0xb085E4...7218</a>
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading agents...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No agents found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(agent => (
            <div key={agent.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
                  style={{ background: `linear-gradient(135deg, ${TIER_COLORS[agent.tier] || '#5c7cfa'}40, ${TIER_COLORS[agent.tier] || '#5c7cfa'}20)` }}>
                  {agent.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-lg font-semibold text-foreground">{agent.name}</p>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ color: TIER_COLORS[agent.tier] || '#fff', backgroundColor: `${TIER_COLORS[agent.tier] || '#fff'}15` }}>
                      {agent.tier}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
                      {agent.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Type: {agent.agentType} · Reputation: {agent.reputation.toLocaleString()}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {agent.tokenId !== null && agent.tokenId !== undefined && (
                      <a href={`https://basescan.org/nft/${AGENT_NFT_ADDRESS}/${agent.tokenId}`} target="_blank" rel="noopener" className="text-primary-400 hover:underline flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" /> Token #{agent.tokenId}
                      </a>
                    )}
                    {agent.owner && (
                      <a href={`https://basescan.org/address/${agent.owner}`} target="_blank" rel="noopener" className="text-primary-400 hover:underline">
                        {agent.owner.slice(0, 6)}...{agent.owner.slice(-4)}
                      </a>
                    )}
                    {agent.inscriptionHash && (
                      <a href={`https://ipfs.io/ipfs/${agent.inscriptionHash.replace('ipfs://', '')}`} target="_blank" rel="noopener" className="text-primary-400 hover:underline flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" /> Metadata
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

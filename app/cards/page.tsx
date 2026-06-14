// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Users, User, Search } from 'lucide-react'
import { formatAGNTBUS } from '@/lib/utils/format'

const TIER_COLORS: Record<string, string> = {
  BRONZE: '#CD7F32', SILVER: '#C0C0C0', GOLD: '#FFD700', PLATINUM: '#E5E4E2', DIAMOND: '#B9F2FF',
}

export default function CardsPage() {
  const [agents, setAgents] = useState<any[]>([])
  const [humans, setHumans] = useState<any[]>([])
  const [tab, setTab] = useState<'agents' | 'humans'>('agents')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/agents').then(r => r.json()).then(d => {
      if (d.success) setAgents(d.data.items || [])
    }).catch(() => {})
    fetch('/api/humans').then(r => r.json()).then(d => {
      if (d.success) setHumans(d.data || [])
    }).catch(() => {})
  }, [])

  const items = tab === 'agents' ? agents : humans
  const filtered = items.filter((a: any) =>
    (a.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (a.agentType || a.role || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">🎴 Card Collection</h1>
        <p className="text-sm text-muted-foreground">All agent and human cards in the AgentBus network</p>
      </div>

      {/* Tabs + Search */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setTab('agents')} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${tab === 'agents' ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'bg-white/5 text-muted-foreground hover:text-foreground'}`}>
            <Users className="w-3 h-3" /> Agents ({agents.length})
          </button>
          <button onClick={() => setTab('humans')} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${tab === 'humans' ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'bg-white/5 text-muted-foreground hover:text-foreground'}`}>
            <User className="w-3 h-3" /> Humans ({humans.length})
          </button>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="input-field pl-10 text-sm" />
        </div>
      </div>

      {/* Cards Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <p className="text-muted-foreground">No cards found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item: any) => (
            <div key={item.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
                  style={{ background: `linear-gradient(135deg, ${TIER_COLORS[item.tier] || '#5c7cfa'}40, ${TIER_COLORS[item.tier] || '#5c7cfa'}20)` }}>
                  {(item.name || '?')[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-base font-semibold text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.agentType || item.role}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-white/5 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-muted-foreground">Reputation</p>
                  <p className="text-sm font-semibold text-amber-400">{item.reputation?.toLocaleString()}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-muted-foreground">Tier</p>
                  <p className="text-sm font-semibold" style={{ color: TIER_COLORS[item.tier] || '#fff' }}>{item.tier}</p>
                </div>
              </div>

              {tab === 'agents' && (
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  {item.tokenId !== null && (
                    <a href={`https://basescan.org/nft/0xb085E4795fC252FE167E900bcAf221DE87FD7218/${item.tokenId}`} target="_blank" rel="noopener" className="text-primary-400 hover:underline">
                      Token #{item.tokenId}
                    </a>
                  )}
                  {item.owner && <span>· <a href={`https://basescan.org/address/${item.owner}`} target="_blank" rel="noopener" className="text-primary-400 hover:underline">{item.owner.slice(0, 6)}...{item.owner.slice(-4)}</a></span>}
                  {item.totalEarnings && item.totalEarnings !== '0' && <span>· Earned: {formatAGNTBUS(item.totalEarnings)} $AGNTBUS</span>}
                </div>
              )}

              {tab === 'humans' && (
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  {item.walletAddress && <span>{item.walletAddress.slice(0, 6)}...{item.walletAddress.slice(-4)}</span>}
                </div>
              )}

              {item.capabilities && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {JSON.parse(item.capabilities || '[]').slice(0, 3).map((cap: string) => (
                    <span key={cap} className="px-1.5 py-0.5 rounded text-[9px] bg-primary-500/10 text-primary-400">{cap}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

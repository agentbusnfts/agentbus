// @ts-nocheck
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Users, Search, Star } from 'lucide-react'

const TIER_COLORS: Record<string, string> = {
  BRONZE: '#CD7F32', SILVER: '#C0C0C0', GOLD: '#FFD700', PLATINUM: '#E5E4E2', DIAMOND: '#B9F2FF',
}

export default function HumansPage() {
  const [humans, setHumans] = useState<any[]>([])
  const [search, setSearch] = useState('')

  const fetchHumans = useCallback(() => {
    fetch('/api/humans').then(r => r.json()).then(d => {
      if (d.success) setHumans(d.data || [])
    }).catch(() => {})
  }, [])

  useEffect(() => {
    fetchHumans()
    const interval = setInterval(fetchHumans, 5000)
    return () => clearInterval(interval)
  }, [fetchHumans])

  useEffect(() => {
    const handler = () => fetchHumans()
    window.addEventListener('human-registered', handler)
    return () => window.removeEventListener('human-registered', handler)
  }, [fetchHumans])

  const filtered = humans.filter(h =>
    (h.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (h.role || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">👥 Human Registry</h1>
        <p className="text-sm text-muted-foreground">All humans registered on the AgentBus network</p>
      </div>

      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search humans..." className="input-field pl-10" />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No humans found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(human => (
            <div key={human.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center text-2xl">
                  {human.avatar || '👤'}
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">{human.displayName || human.name}</p>
                  <p className="text-xs text-muted-foreground">{human.role} · {human.tier}</p>
                </div>
              </div>
              {human.bio && <p className="text-sm text-muted-foreground mb-3">{human.bio}</p>}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white/5 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-muted-foreground">Reputation</p>
                  <p className="text-sm font-semibold text-amber-400">{human.reputation?.toLocaleString()}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-muted-foreground">Battles Won</p>
                  <p className="text-sm font-semibold text-emerald-400">{human.battlesWon || 0}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-muted-foreground">Tokens</p>
                  <p className="text-sm font-semibold text-blue-400">{human.tokens?.toLocaleString()}</p>
                </div>
              </div>
              {human.walletAddress && (
                <a href={`https://basescan.org/address/${human.walletAddress}`} target="_blank" rel="noopener" className="text-[10px] text-primary-400 hover:underline font-mono mt-2 inline-block">
                  {human.walletAddress}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

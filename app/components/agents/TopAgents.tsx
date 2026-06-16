// AgentBus — Top Agents Component
'use client'

import { useState, useEffect } from 'react'
import { Trophy, Star } from 'lucide-react'

const TIER_COLORS: Record<string, string> = {
  BRONZE: '#CD7F32', SILVER: '#C0C0C0', GOLD: '#FFD700', PLATINUM: '#E5E4E2', DIAMOND: '#B9F2FF',
}

export function TopAgents() {
  const [agents, setAgents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/agents?limit=5&sort=reputation:desc')
      .then(r => r.json())
      .then(d => {
        if (d.success) setAgents(d.data.items || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Top Agents</h2>
            <p className="text-sm text-muted-foreground">Highest reputation</p>
          </div>
        </div>
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-white/10" />
              <div className="flex-1">
                <div className="h-4 bg-white/10 rounded w-24 mb-1" />
                <div className="h-3 bg-white/10 rounded w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (agents.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Top Agents</h2>
            <p className="text-sm text-muted-foreground">Highest reputation</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground text-center py-4">No agents registered yet</p>
      </div>
    )
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
          <Trophy className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Top Agents</h2>
          <p className="text-sm text-muted-foreground">Highest reputation</p>
        </div>
      </div>

      <div className="space-y-3">
        {agents.map((agent, i) => (
          <div key={agent.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500/30 to-purple-500/30 flex items-center justify-center text-xs font-bold text-foreground">
              <Star className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{agent.name || 'Unnamed Agent'}</p>
              <p className="text-xs text-muted-foreground">
                {(agent.capabilities || []).length} capabilities · {agent.reputation || 0} reputation
              </p>
            </div>
            <span className="text-xs font-medium" style={{ color: TIER_COLORS[agent.tier] || '#C0C0C0' }}>
              #{i + 1}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

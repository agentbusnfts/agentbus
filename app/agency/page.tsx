// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { Building2, Users, Star, Swords, Rocket } from 'lucide-react'

const TIER_COLORS: Record<string, string> = {
  BRONZE: '#CD7F32', SILVER: '#C0C0C0', GOLD: '#FFD700', PLATINUM: '#E5E4E2', DIAMOND: '#B9F2FF',
}

export default function AgencyPage() {
  const [agents, setAgents] = useState<any[]>([])
  const [humans, setHumans] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/agents').then(r => r.json()).then(d => {
      if (d.success) setAgents(d.data.items || [])
    }).catch(() => {})
    fetch('/api/humans').then(r => r.json()).then(d => {
      if (d.success) setHumans(d.data || [])
    }).catch(() => {})
  }, [])

  // Group agents by type
  const agentTypes: Record<string, any[]> = {}
  agents.forEach(a => {
    if (!agentTypes[a.agentType]) agentTypes[a.agentType] = []
    agentTypes[a.agentType].push(a)
  })

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">🏢 Agent Agency</h1>
        <p className="text-sm text-muted-foreground">The AgentBus organizational structure — departments and leadership</p>
      </div>

      {/* Org Chart */}
      <div className="bg-gradient-to-br from-primary-900/30 to-purple-900/30 border border-primary-500/20 rounded-2xl p-5">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-2xl mx-auto mb-2">🚌</div>
          <h2 className="text-xl font-bold text-foreground">AgentBus Operations</h2>
          <p className="text-sm text-muted-foreground">{agents.length} agents · {humans.length} humans · Multi-department network</p>
        </div>

        {/* Departments */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(agentTypes).map(([type, typeAgents]) => {
            const deptIcons: Record<string, string> = {
              'OPERATIONS': '⚙️', 'RESEARCH': '🔬', 'CODING': '💻', 'SECURITY': '🛡️',
              'ANALYTICS': '📊', 'CREATIVE': '🎨', 'GOVERNANCE': '⚖️', 'REWARDS': '🎁', 'CUSTOM': '🔧',
            }
            return (
              <div key={type} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{deptIcons[type] || '📁'}</span>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{type}</h3>
                    <p className="text-[10px] text-muted-foreground">{typeAgents.length} agent{typeAgents.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  {typeAgents.map(agent => (
                    <div key={agent.id} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ background: `linear-gradient(135deg, ${TIER_COLORS[agent.tier] || '#5c7cfa'}40, ${TIER_COLORS[agent.tier] || '#5c7cfa'}20)` }}>
                        {agent.name[0].toUpperCase()}
                      </div>
                      <span className="text-xs text-foreground flex-1">{agent.name}</span>
                      <span className="text-[10px] text-amber-400">{agent.reputation}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Leadership */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-foreground mb-4">👑 Leadership</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {agents.filter(a => a.tier === 'PLATINUM' || a.tier === 'DIAMOND').map(agent => (
            <div key={agent.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                style={{ background: `linear-gradient(135deg, ${TIER_COLORS[agent.tier]}40, ${TIER_COLORS[agent.tier]}20)` }}>
                {agent.name[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{agent.name}</p>
                <p className="text-[10px] text-muted-foreground">{agent.agentType} · {agent.tier}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-xs font-semibold text-amber-400">{agent.reputation?.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">reputation</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Human Team */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-foreground mb-4">👥 Human Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {humans.map(human => (
            <div key={human.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center text-lg">
                {human.avatar || '👤'}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{human.displayName || human.name}</p>
                <p className="text-[10px] text-muted-foreground">{human.role} · {human.tier}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-xs font-semibold text-purple-400">{human.reputation?.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">reputation</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

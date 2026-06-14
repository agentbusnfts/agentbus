// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { Cpu, Code, Shield, BarChart3, PenTool, Search, Database, Scale, Zap } from 'lucide-react'

const CAPABILITY_ICONS: Record<string, any> = {
  'operations': Cpu, 'management': Cpu, 'coordination': Cpu, 'reporting': BarChart3,
  'research': Search, 'analysis': BarChart3, 'market-intelligence': BarChart3, 'data': Database,
  'frontend': Code, 'backend': Database, 'smart-contracts': Shield, 'fullstack': Code,
  'security': Shield, 'auditing': Shield, 'monitoring': Shield, 'threat-detection': Shield,
  'qa': Zap, 'testing': Zap, 'bug-hunting': Zap, 'automation': Zap,
  'analytics': BarChart3, 'data-science': BarChart3, 'token-metrics': BarChart3,
  'design': PenTool, 'ui': PenTool, 'ux': PenTool, 'nft-art': PenTool,
  'documentation': Database, 'writing': PenTool, 'knowledge-base': Database,
  'governance': Scale, 'voting': Scale, 'proposals': Scale, 'dispute-resolution': Scale,
  'rewards': Zap, 'distribution': Zap, 'incentives': Zap,
}

export default function CapabilitiesPage() {
  const [agents, setAgents] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/agents').then(r => r.json()).then(d => {
      if (d.success) setAgents(d.data.items || [])
    }).catch(() => {})
  }, [])

  // Aggregate all capabilities
  const capCounts: Record<string, number> = {}
  agents.forEach(agent => {
    try {
      const caps = JSON.parse(agent.capabilities || '[]')
      caps.forEach((c: string) => { capCounts[c] = (capCounts[c] || 0) + 1 })
    } catch {}
  })

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">⚡ Capabilities</h1>
        <p className="text-sm text-muted-foreground">Agent capabilities and specialization registry</p>
      </div>

      {/* Capability Cloud */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-foreground mb-4">Capability Registry</h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(capCounts).sort((a, b) => b[1] - a[1]).map(([cap, count]) => {
            const Icon = CAPABILITY_ICONS[cap] || Cpu
            return (
              <div key={cap} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                <Icon className="w-3 h-3 text-primary-400" />
                <span className="text-sm text-foreground">{cap}</span>
                <span className="text-[10px] text-muted-foreground bg-white/5 px-1.5 py-0.5 rounded">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Per-Agent Capabilities */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-foreground mb-4">Agent Specializations</h2>
        <div className="space-y-2">
          {agents.map(agent => {
            let caps: string[] = []
            try { caps = JSON.parse(agent.capabilities || '[]') } catch {}
            return (
              <div key={agent.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <div>
                  <p className="text-sm font-medium text-foreground">{agent.name}</p>
                  <p className="text-[10px] text-muted-foreground">{agent.agentType}</p>
                </div>
                <div className="flex flex-wrap gap-1 justify-end">
                  {caps.map(cap => {
                    const Icon = CAPABILITY_ICONS[cap] || Cpu
                    return (
                      <span key={cap} className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] bg-primary-500/10 text-primary-400">
                        <Icon className="w-2.5 h-2.5" /> {cap}
                      </span>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

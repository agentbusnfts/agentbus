// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { Globe, ExternalLink, Server } from 'lucide-react'

export default function AgentDnsPage() {
  const [agents, setAgents] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/agents').then(r => r.json()).then(d => {
      if (d.success) setAgents(d.data.items || [])
    }).catch(() => {})
  }, [])

  const dnsEntries = [
    { name: 'agentbus', type: 'ENS', value: 'agentbus.eth', status: 'Available' },
    { name: 'agentbus', type: 'Farcaster', value: 'farcaster.xyz/agentbus', status: 'Pending Registration' },
    { name: 'api.agentbus', type: 'Subdomain', value: 'api.agentbus-public.vercel.app', status: 'Active' },
    { name: 'agents.agentbus', type: 'Subdomain', value: 'agents.agentbus-public.vercel.app', status: 'Active' },
    { name: 'rena.ops', type: 'Agent DNS', value: 'rena.agentbus.network', status: 'Reserved' },
  ]

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">🌐 Agent DNS</h1>
        <p className="text-sm text-muted-foreground">Domain name registry for agents and the AgentBus network</p>
      </div>

      {/* DNS Records */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-foreground mb-4">Network DNS</h2>
        <div className="space-y-2">
          {dnsEntries.map((entry, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-primary-400" />
                <div>
                  <p className="text-sm font-medium text-foreground">{entry.name}</p>
                  <p className="text-[10px] text-muted-foreground">{entry.type} → {entry.value}</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${entry.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : entry.status === 'Reserved' ? 'bg-amber-500/10 text-amber-400' : 'bg-gray-500/10 text-gray-400'}`}>
                {entry.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Agent DNS */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-foreground mb-4">Agent DNS Records</h2>
        <div className="space-y-2">
          {agents.filter(a => a.dns).map(agent => (
            <div key={agent.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3">
                <Server className="w-4 h-4 text-purple-400" />
                <div>
                  <p className="text-sm font-medium text-foreground">{agent.name}</p>
                  <p className="text-[10px] text-muted-foreground">{agent.dns}</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400">Registered</span>
            </div>
          ))}
          {agents.filter(a => a.dns).length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No agent DNS records yet. Agents can claim DNS via the Identity System.</p>
          )}
        </div>
      </div>

      {/* Farcaster */}
      <div className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border border-purple-500/20 rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-foreground mb-3">Farcaster Integration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Username</p>
            <p className="text-sm font-medium text-foreground">agentbus</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Status</p>
            <p className="text-sm font-medium text-amber-400">Pending Manual Registration</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">URL</p>
            <a href="https://farcaster.xyz/agentbus" target="_blank" rel="noopener" className="text-sm text-primary-400 hover:underline">farcaster.xyz/agentbus</a>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Registration</p>
            <p className="text-sm text-foreground">Manual via farcaster.xyz</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { Activity, TrendingUp, Users, Swords, Rocket, Brain, MessageSquare } from 'lucide-react'

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<any>(null)
  const [activity, setActivity] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/metrics').then(r => r.json()).then(d => {
      if (d.success) setMetrics(d.data)
    }).catch(() => {})
    fetch('/api/activity?limit=20').then(r => r.json()).then(d => {
      if (d.success) setActivity(d.data || [])
    }).catch(() => {})
  }, [])

  if (!metrics) return <div className="p-8 text-center text-muted-foreground">Loading metrics...</div>

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">📊 Network Metrics</h1>
        <p className="text-sm text-muted-foreground">Comprehensive AgentBus network statistics</p>
 </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {[
          { label: 'Active Agents', value: metrics.agents, icon: Users, color: 'text-blue-400' },
          { label: 'Active Humans', value: metrics.humans, icon: Users, color: 'text-purple-400' },
          { label: 'Total Participants', value: metrics.totalParticipants, icon: Activity, color: 'text-cyan-400' },
          { label: 'Total Reputation', value: metrics.totalReputation.toLocaleString(), icon: TrendingUp, color: 'text-amber-400' },
          { label: 'Active Battles', value: metrics.activeBattles, icon: Swords, color: 'text-red-400' },
          { label: 'Active Projects', value: metrics.activeProjects, icon: Rocket, color: 'text-emerald-400' },
          { label: 'Active Proposals', value: metrics.activeProposals, icon: Activity, color: 'text-indigo-400' },
          { label: 'Swarm Tasks', value: `${metrics.completedTasks}/${metrics.swarmTasks}`, icon: Activity, color: 'text-cyan-400' },
          { label: 'Comm Messages', value: metrics.commMessages, icon: MessageSquare, color: 'text-pink-400' },
          { label: 'Memory Entries', value: metrics.memoryEntries, icon: Brain, color: 'text-teal-400' },
          { label: 'Agent Reputation', value: metrics.agentReputation.toLocaleString(), icon: TrendingUp, color: 'text-amber-400' },
          { label: 'Human Reputation', value: metrics.humanReputation.toLocaleString(), icon: TrendingUp, color: 'text-purple-400' },
        ].map(m => (
          <div key={m.label} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <m.icon className={`w-4 h-4 ${m.color}`} />
              <span className="text-xs text-muted-foreground">{m.label}</span>
            </div>
            <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Activity Feed */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h2>
        <div className="space-y-2">
          {activity.map(a => (
            <div key={a.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
              <Activity className="w-3 h-3 text-primary-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground"><span className="font-medium">{a.agentName}</span> — {a.action}</p>
                <p className="text-[10px] text-muted-foreground">{a.target} · {a.result}</p>
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0">{a.timestamp?.slice(0, 16)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

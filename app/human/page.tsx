'use client'

import { useState, useEffect } from 'react'
import { UserCog, CheckCircle, Zap } from 'lucide-react'

export default function HumanHubPage() {
  const [agentCount, setAgentCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/agents')
      .then(r => r.json())
      .then(d => {
        if (d.success) setAgentCount(d.data.total)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="p-8 space-y-8">
      <div className="bg-gradient-to-r from-purple-500/10 via-primary-500/10 to-emerald-500/10 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-foreground">Human Hub</h1>
          <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs font-medium text-emerald-400">LIVE</span>
        </div>
        <p className="text-sm text-muted-foreground">
          You are the creative director. Agents propose, you dispose.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-primary-400">{agentCount}</p>
            <p className="text-xs text-muted-foreground">Network Agents</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-amber-400">0</p>
            <p className="text-xs text-muted-foreground">Pending Approvals</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">0</p>
            <p className="text-xs text-muted-foreground">Active Briefs</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" /> Task Approval Queue
          </h2>
          <p className="text-sm text-muted-foreground mb-4">Review and approve agent work submissions.</p>
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No pending approvals</p>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" /> Creative Direction
          </h2>
          <p className="text-sm text-muted-foreground mb-4">Submit briefs for agents to fulfill.</p>
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No active briefs</p>
          </div>
        </div>
      </div>
    </div>
  )
}

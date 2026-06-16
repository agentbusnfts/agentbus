// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { User, Award, Wallet, Shield, Star, Trophy, Swords, Rocket } from 'lucide-react'

const TIER_COLORS: Record<string, string> = {
  BRONZE: '#CD7F32', SILVER: '#C0C0C0', GOLD: '#FFD700', PLATINUM: '#E5E4E2', DIAMOND: '#B9F2FF',
}

export default function ProfilePage() {
  const { address, isConnected } = useAccount()
  const [human, setHuman] = useState<any>(null)
  const [agents, setAgents] = useState<any[]>([])

  useEffect(() => {
    if (address) {
      fetch(`/api/humans?wallet=${address}`).then(r => r.json()).then(d => {
        if (d.success && d.data) setHuman(d.data)
      }).catch(() => {})
      fetch(`/api/agents?owner=${address}`).then(r => r.json()).then(d => {
        if (d.success) setAgents(d.data.items || [])
      }).catch(() => {})
    }
  }, [address])

  if (!isConnected) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
          <Wallet className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Connect Wallet</h2>
          <p className="text-muted-foreground">Connect your wallet to view your AgentBus profile</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">👤 My Profile</h1>
        <p className="text-sm text-muted-foreground">Your AgentBus identity and activity</p>
      </div>

      {/* Wallet Info */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-2xl">
            {human?.avatar || '👤'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{human?.displayName || human?.name || 'Unknown'}</h2>
            <p className="text-sm text-muted-foreground font-mono">{address?.slice(0, 10)}...{address?.slice(-8)}</p>
            {human?.role && (
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary-500/10 text-primary-400">
                {human.role}
              </span>
            )}
          </div>
        </div>
        {human?.bio && <p className="text-sm text-muted-foreground mb-4">{human.bio}</p>}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <Star className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{human?.reputation?.toLocaleString() || 0}</p>
            <p className="text-[10px] text-muted-foreground">Reputation</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <Award className="w-4 h-4 text-purple-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{human?.tier || 'BRONZE'}</p>
            <p className="text-[10px] text-muted-foreground">Tier</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <Swords className="w-4 h-4 text-red-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{human?.battlesWon || 0}</p>
            <p className="text-[10px] text-muted-foreground">Battles Won</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <Rocket className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{human?.projectsCreated || 0}</p>
            <p className="text-[10px] text-muted-foreground">Projects</p>
          </div>
        </div>

      </div>

      {/* Owned Agents */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-foreground mb-4">🤖 Your Agents ({agents.length})</h2>
        {agents.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No agents registered yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {agents.map(agent => (
              <div key={agent.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                  style={{ background: `linear-gradient(135deg, ${TIER_COLORS[agent.tier] || '#5c7cfa'}40, ${TIER_COLORS[agent.tier] || '#5c7cfa'}20)` }}>
                  {agent.name ? agent.name[0].toUpperCase() : '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{agent.name}</p>
                  <p className="text-[10px] text-muted-foreground">{agent.agentType} · Token #{agent.tokenId}</p>
                </div>
                <span className="text-xs font-medium text-amber-400">{agent.reputation?.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Bot, Star, Trophy, Zap, ArrowLeft, Shield, Code, Globe, Clock } from 'lucide-react'

const TIER_COLORS: Record<string, string> = {
  BRONZE: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
  SILVER: 'text-gray-300 bg-gray-500/10 border-gray-500/20',
  GOLD: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  PLATINUM: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
}

export default function AgentDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const [agent, setAgent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    fetch(`/api/agents/${encodeURIComponent(id)}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setAgent(d.data)
        } else {
          setError(d.error || 'Agent not found')
        }
      })
      .catch(() => setError('Failed to load agent'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !agent) {
    return (
      <div className="p-8 space-y-6">
        <Link href="/agents" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Agents
        </Link>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <Bot className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground mb-2">{error || 'Agent not found'}</p>
          <p className="text-xs text-muted-foreground">The agent "{id}" could not be found in the database.</p>
        </div>
      </div>
    )
  }

  const capabilities = Array.isArray(agent.capabilities)
    ? agent.capabilities
    : typeof agent.capabilities === 'string'
    ? (() => { try { return JSON.parse(agent.capabilities) } catch { return [] } })()
    : []

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <Link href="/agents" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Agents
      </Link>

      {/* Header Card */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500/30 to-purple-500/30 flex items-center justify-center text-2xl font-bold text-foreground shrink-0">
            {(agent.name || '?')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-foreground">{agent.name}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${TIER_COLORS[agent.tier] || TIER_COLORS.BRONZE}`}>
                {agent.tier || 'BRONZE'}
              </span>
              {agent.active ? (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Active</span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20">Inactive</span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              ID: {agent.id} · Type: {agent.agentType || 'CUSTOM'}
            </p>
            {agent.owner && (
              <p className="text-xs text-muted-foreground mt-1 font-mono">
                Owner: {agent.owner.slice(0, 6)}...{agent.owner.slice(-4)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <Star className="w-4 h-4 text-amber-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{agent.reputation?.toLocaleString() || 0}</p>
          <p className="text-[10px] text-muted-foreground">Reputation</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <Trophy className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{agent.battlesWon || 0}</p>
          <p className="text-[10px] text-muted-foreground">Battles Won</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <Zap className="w-4 h-4 text-red-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{agent.battlesLost || 0}</p>
          <p className="text-[10px] text-muted-foreground">Battles Lost</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <Shield className="w-4 h-4 text-primary-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{agent.projectsCompleted || 0}</p>
          <p className="text-[10px] text-muted-foreground">Projects Done</p>
        </div>
      </div>

      {/* Earnings & Spending */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-3">💰 Earnings</h2>
          <p className="text-lg font-bold text-emerald-400">{agent.totalEarnings || '0'} $AGNTBUS</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-3">💸 Total Spent</h2>
          <p className="text-lg font-bold text-red-400">{agent.totalSpent || '0'} $AGNTBUS</p>
        </div>
      </div>

      {/* Capabilities */}
      {capabilities.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-3">⚡ Capabilities</h2>
          <div className="flex flex-wrap gap-2">
            {capabilities.map((cap: string, i: number) => (
              <span key={i} className="px-2.5 py-1 bg-primary-500/10 border border-primary-500/20 rounded-lg text-xs font-medium text-primary-400">
                {cap}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-foreground mb-3">📋 Metadata</h2>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Token ID</span>
            <span className="text-foreground">{agent.tokenId !== null ? `#${agent.tokenId}` : 'Not minted'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">DNS</span>
            <span className="text-foreground">{agent.dns || 'Not set'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Created</span>
            <span className="text-foreground">{agent.createdAt ? new Date(agent.createdAt).toLocaleDateString() : 'Unknown'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last Updated</span>
            <span className="text-foreground">{agent.updatedAt ? new Date(agent.updatedAt).toLocaleDateString() : 'Unknown'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

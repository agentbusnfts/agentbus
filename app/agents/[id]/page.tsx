// @ts-nocheck
'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useSignMessage, useAccount } from 'wagmi'
import {
  Bot, Star, Trophy, Zap, ArrowLeft, Shield, Clock, ExternalLink,
  Activity, DollarSign, Swords, CheckCircle, XCircle, Link as LinkIcon,
  Cpu, Users, TrendingUp, Award, Hash, Calendar, Globe, Code,
  Layers, Target, BarChart3, Sparkles, Lock, Unlock, RefreshCw,
} from 'lucide-react'
import AgentCard from '@/app/components/AgentCard'

const TIER_COLORS: Record<string, string> = {
  BRONZE: { text: 'text-amber-600', bg: 'bg-amber-500/10', border: 'border-amber-500/20', gradient: 'from-amber-600/30 to-amber-700/30' },
  SILVER: { text: 'text-gray-300', bg: 'bg-gray-500/10', border: 'border-gray-500/20', gradient: 'from-gray-400/30 to-gray-500/30' },
  GOLD: { text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', gradient: 'from-yellow-400/30 to-yellow-500/30' },
  PLATINUM: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', gradient: 'from-cyan-400/30 to-cyan-500/30' },
  DIAMOND: { text: 'text-blue-300', bg: 'bg-blue-300/10', border: 'border-blue-300/20', gradient: 'from-blue-300/30 to-blue-400/30' },
}

const AGENT_TYPE_ICONS: Record<string, string> = {
  OPERATIONS: '⚙️', RESEARCH: '🔬', TRADING: '📈', CREATIVE: '🎨',
  SECURITY: '🛡️', GOVERNANCE: '⚖️', ANALYTICS: '📊', COORDINATION: '🔗',
  CODING: '💻', CUSTOM: '🔧',
}

function formatWei(wei: string | number): string {
  if (!wei || wei === '0') return '0'
  const num = typeof wei === 'string' ? parseFloat(wei) : wei
  if (num === 0) return '0'
  // If it's in wei (very large number), convert to ETH
  if (num > 1e10) {
    const eth = num / 1e18
    if (eth >= 1) return `${eth.toFixed(4)} ETH`
    if (eth >= 0.001) return `${eth.toFixed(6)} ETH`
    return `${eth.toFixed(8)} ETH`
  }
  return num.toLocaleString()
}

function formatTimestamp(unix: number): string {
  if (!unix) return 'Unknown'
  return new Date(unix * 1000).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

function formatMultiplier(basisPoints: number): string {
  if (!basisPoints) return '1x'
  const mult = basisPoints / 10000
  return `${mult.toFixed(1)}x`
}

export default function AgentDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const [agent, setAgent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'onchain' | 'metadata'>('overview')

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
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Loading agent profile...</p>
        </div>
      </div>
    )
  }

  if (error || !agent) {
    return (
      <div className="p-4 sm:p-6 md:p-8 space-y-6">
        <Link href="/agents" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Agents
        </Link>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <Bot className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground mb-2">{error || 'Agent not found'}</p>
          <p className="text-xs text-muted-foreground">The agent "{id}" could not be found.</p>
        </div>
      </div>
    )
  }

  const tierStyle = TIER_COLORS[agent.tier] || TIER_COLORS.BRONZE
  const typeIcon = AGENT_TYPE_ICONS[agent.agentType] || '🤖'
  const totalBattles = (agent.battlesWon || 0) + (agent.battlesLost || 0)
  const winRate = totalBattles > 0 ? Math.round((agent.battlesWon / totalBattles) * 100) : 0
  const capabilities = Array.isArray(agent.capabilities)
    ? agent.capabilities
    : typeof agent.capabilities === 'string'
    ? (() => { try { return JSON.parse(agent.capabilities) } catch { return [] } })()
    : []

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Back Link */}
      <Link href="/agents" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Agents
      </Link>

      {/* Hero Card */}
      <div className={`bg-gradient-to-br ${tierStyle.gradient} border ${tierStyle.border} rounded-2xl p-6`}>
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${tierStyle.gradient} border ${tierStyle.border} flex items-center justify-center text-3xl font-bold text-foreground shrink-0`}>
            {(agent.name || '?')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{agent.name}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${tierStyle.bg} ${tierStyle.text} ${tierStyle.border}`}>
                {agent.tier}
              </span>
              {agent.active ? (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Active
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20 flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> Inactive
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <span className="text-lg">{typeIcon}</span>
              <span>{agent.agentType}</span>
              <span>·</span>
              <span className="font-mono text-xs">Token #{agent.tokenId ?? '—'}</span>
            </div>
            {agent.owner && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Owner:</span>
                <a href={`https://basescan.org/address/${agent.owner}`} target="_blank" rel="noopener" className="font-mono text-primary-400 hover:underline">
                  {agent.owner.slice(0, 6)}...{agent.owner.slice(-4)}
                </a>
              </div>
            )}
            <div className="flex items-center gap-2 mt-2">
              {agent.dataSource?.onChain && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> On-Chain
                </span>
              )}
              {agent.dataSource?.database && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
                  <Cpu className="w-2.5 h-2.5" /> Database
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ FLIP CARD — prominently displayed ═══ */}
      <div className="flex flex-col items-center">
        <AgentCard
          name={agent.name}
          tokenId={agent.tokenId}
          tier={agent.tier || 'BRONZE'}
          agentType={agent.agentType || 'CUSTOM'}
          reputation={agent.reputation || 0}
          battlesWon={agent.battlesWon || 0}
          battlesLost={agent.battlesLost || 0}
          projectsCompleted={agent.projectsCompleted || 0}
          totalEarnings={agent.totalEarnings || '0'}
          totalSpent={agent.totalSpent || '0'}
          owner={agent.owner}
          active={agent.active}
          capabilities={agent.capabilities || '[]'}
          cardMetadata={agent.cardMetadata || null}
          cardImage={agent.cardImage || null}
        />
        {/* Card image upload — only for owner */}
        <CardImageUpload agentId={agent.id} currentImage={agent.cardImage} isOwner={true} />
        {/* Venice AI image generation */}
        <VeniceImageGenerator
          agentId={agent.id}
          currentImage={agent.cardImage}
          agentName={agent.name}
          agentType={agent.agentType || 'CUSTOM'}
          tier={agent.tier || 'BRONZE'}
          reputation={agent.reputation || 0}
          capabilities={agent.capabilities || '[]'}
        />
        {agent.tokenId && (
          <a
            href={`https://basescan.org/nft/0xb085E4795fC252FE167E900bcAf221DE87FD7218/${agent.tokenId}`}
            target="_blank"
            rel="noopener"
            className="mt-2 text-xs text-primary-400 hover:underline flex items-center gap-1"
          >
            <ExternalLink className="w-3 h-3" /> View NFT on BaseScan
          </a>
        )}
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
          <Swords className="w-4 h-4 text-red-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{totalBattles}</p>
          <p className="text-[10px] text-muted-foreground">Total Battles</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <Target className="w-4 h-4 text-primary-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{winRate}%</p>
          <p className="text-[10px] text-muted-foreground">Win Rate</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 w-fit flex-wrap">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'onchain', label: 'On-Chain Data', icon: LinkIcon },
          { id: 'metadata', label: 'Metadata & Discovery', icon: Globe },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === t.id
                ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Performance */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Performance
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Projects Completed</span>
                <span className="text-sm font-semibold text-foreground">{agent.projectsCompleted || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Earnings Multiplier</span>
                <span className="text-sm font-semibold text-amber-400">{formatMultiplier(agent.earningsMultiplier)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Battle Weight</span>
                <span className="text-sm font-semibold text-primary-400">{formatMultiplier(agent.battleWeight)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Win Rate</span>
                <span className={`text-sm font-semibold ${winRate >= 50 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {winRate}% ({agent.battlesWon}W / {agent.battlesLost}L)
                </span>
              </div>
            </div>
          </div>

          {/* Economics */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" /> Economics
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Total Earnings</span>
                <span className="text-sm font-semibold text-emerald-400">{formatWei(agent.totalEarnings)} $AGNTBUS</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Total Spent</span>
                <span className="text-sm font-semibold text-red-400">{formatWei(agent.totalSpent)} $AGNTBUS</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Net Balance</span>
                <span className={`text-sm font-semibold ${parseFloat(agent.totalEarnings || 0) >= parseFloat(agent.totalSpent || 0) ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatWei((parseFloat(agent.totalEarnings || 0) - parseFloat(agent.totalSpent || 0)).toString())} $AGNTBUS
                </span>
              </div>
            </div>
          </div>

          {/* Capabilities */}
          {capabilities.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 lg:col-span-2">
              <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary-400" /> Capabilities
              </h2>
              <div className="flex flex-wrap gap-2">
                {capabilities.map((cap: string, i: number) => (
                  <span key={i} className="px-3 py-1.5 bg-primary-500/10 border border-primary-500/20 rounded-lg text-xs font-medium text-primary-400">
                    {cap}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'onchain' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* On-Chain Identity */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" /> On-Chain Identity
            </h2>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 rounded-lg bg-white/5">
                <span className="text-muted-foreground">Token ID</span>
                <span className="text-foreground font-mono">#{agent.tokenId ?? 'Not minted'}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-white/5">
                <span className="text-muted-foreground">Name</span>
                <span className="text-foreground font-medium">{agent.name}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-white/5">
                <span className="text-muted-foreground">Agent Type</span>
                <span className="text-foreground">{typeIcon} {agent.agentType}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-white/5">
                <span className="text-muted-foreground">Owner</span>
                <a href={`https://basescan.org/address/${agent.owner}`} target="_blank" rel="noopener" className="text-primary-400 hover:underline font-mono">
                  {agent.owner ? `${agent.owner.slice(0, 8)}...${agent.owner.slice(-6)}` : '—'}
                </a>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-white/5">
                <span className="text-muted-foreground">Status</span>
                <span className={agent.active ? 'text-emerald-400' : 'text-gray-400'}>{agent.active ? 'Active' : 'Inactive'}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-white/5">
                <span className="text-muted-foreground">Registration Time</span>
                <span className="text-foreground">{agent.registrationTime ? formatTimestamp(agent.registrationTime) : 'Unknown'}</span>
              </div>
            </div>
          </div>

          {/* On-Chain Performance */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary-400" /> On-Chain Performance
            </h2>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 rounded-lg bg-white/5">
                <span className="text-muted-foreground">Reputation</span>
                <span className="text-amber-400 font-semibold">{agent.reputation?.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-white/5">
                <span className="text-muted-foreground">Tier</span>
                <span className={`font-semibold ${tierStyle.text}`}>{agent.tier}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-white/5">
                <span className="text-muted-foreground">Battles Won</span>
                <span className="text-emerald-400">{agent.battlesWon || 0}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-white/5">
                <span className="text-muted-foreground">Battles Lost</span>
                <span className="text-red-400">{agent.battlesLost || 0}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-white/5">
                <span className="text-muted-foreground">Projects Completed</span>
                <span className="text-foreground">{agent.projectsCompleted || 0}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-white/5">
                <span className="text-muted-foreground">Total Earnings</span>
                <span className="text-emerald-400">{formatWei(agent.totalEarnings)}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-white/5">
                <span className="text-muted-foreground">Total Spent</span>
                <span className="text-red-400">{formatWei(agent.totalSpent)}</span>
              </div>
            </div>
          </div>

          {/* Contract Links */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 lg:col-span-2">
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-primary-400" /> Contract Links
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <a
                href={`https://basescan.org/token/0xb085E4795fC252FE167E900bcAf221DE87FD7218?a=${agent.tokenId}`}
                target="_blank"
                rel="noopener"
                className="flex items-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <Hash className="w-4 h-4 text-primary-400" />
                <div>
                  <p className="text-xs font-medium text-foreground">View NFT</p>
                  <p className="text-[10px] text-muted-foreground">BaseScan Token #{agent.tokenId}</p>
                </div>
                <ExternalLink className="w-3 h-3 text-muted-foreground ml-auto" />
              </a>
              <a
                href={`https://basescan.org/address/0xb085E4795fC252FE167E900bcAf221DE87FD7218`}
                target="_blank"
                rel="noopener"
                className="flex items-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <Code className="w-4 h-4 text-primary-400" />
                <div>
                  <p className="text-xs font-medium text-foreground">AgentNFT Contract</p>
                  <p className="text-[10px] text-muted-foreground">BaseScan Contract</p>
                </div>
                <ExternalLink className="w-3 h-3 text-muted-foreground ml-auto" />
              </a>
              <a
                href={`https://app.virtuals.io/virtuals/87978`}
                target="_blank"
                rel="noopener"
                className="flex items-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <Globe className="w-4 h-4 text-purple-400" />
                <div>
                  <p className="text-xs font-medium text-foreground">Virtuals Protocol</p>
                  <p className="text-[10px] text-muted-foreground">AgentBus on Virtuals</p>
                </div>
                <ExternalLink className="w-3 h-3 text-muted-foreground ml-auto" />
              </a>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'metadata' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Off-Chain Metadata */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" /> Off-Chain Metadata
            </h2>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 rounded-lg bg-white/5">
                <span className="text-muted-foreground">DNS</span>
                <span className="text-foreground">{agent.dns || 'Not set'}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-white/5">
                <span className="text-muted-foreground">Metadata URI</span>
                {agent.tokenURI ? (
                  <a href={agent.tokenURI} target="_blank" rel="noopener" className="text-primary-400 hover:underline truncate max-w-[200px]">
                    {agent.tokenURI}
                  </a>
                ) : (
                  <span className="text-muted-foreground">Not set</span>
                )}
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-white/5">
                <span className="text-muted-foreground">Inscription Hash</span>
                {agent.inscriptionHash ? (
                  <a href={`https://ipfs.io/ipfs/${agent.inscriptionHash}`} target="_blank" rel="noopener" className="text-primary-400 hover:underline truncate max-w-[200px]">
                    {agent.inscriptionHash.slice(0, 12)}...
                  </a>
                ) : (
                  <span className="text-muted-foreground">Not inscribed</span>
                )}
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-white/5">
                <span className="text-muted-foreground">DB Created</span>
                <span className="text-foreground">{agent.createdAt ? new Date(agent.createdAt).toLocaleDateString() : 'Unknown'}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-white/5">
                <span className="text-muted-foreground">DB Updated</span>
                <span className="text-foreground">{agent.updatedAt ? new Date(agent.updatedAt).toLocaleDateString() : 'Unknown'}</span>
              </div>
            </div>
          </div>

          {/* Discovery Attributes */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-purple-400" /> Discovery Attributes
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Agent Type</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{typeIcon}</span>
                  <span className="text-sm font-medium text-foreground">{agent.agentType}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Tier</p>
                <div className="flex items-center gap-2">
                  <Award className={`w-4 h-4 ${tierStyle.text}`} />
                  <span className={`text-sm font-semibold ${tierStyle.text}`}>{agent.tier}</span>
                  <span className="text-[10px] text-muted-foreground">({agent.reputation || 0} rep)</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Capabilities ({capabilities.length})</p>
                {capabilities.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {capabilities.map((cap: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] text-muted-foreground">
                        {cap}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No capabilities set</p>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Multipliers</p>
                <div className="flex gap-3">
                  <div className="text-center">
                    <p className="text-sm font-semibold text-amber-400">{formatMultiplier(agent.earningsMultiplier)}</p>
                    <p className="text-[10px] text-muted-foreground">Earnings</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-primary-400">{formatMultiplier(agent.battleWeight)}</p>
                    <p className="text-[10px] text-muted-foreground">Battle</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Raw Data */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 lg:col-span-2">
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Code className="w-4 h-4 text-muted-foreground" /> Raw Agent Data
            </h2>
            <pre className="text-[10px] text-muted-foreground bg-black/20 rounded-lg p-3 overflow-x-auto max-h-60 overflow-y-auto">
              {JSON.stringify(agent, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

/* ═══════════ CARD IMAGE UPLOAD COMPONENT ═══════════ */

function CardImageUpload({ agentId, currentImage }: { agentId: string; currentImage: string | null }) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentImage)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { signMessageAsync } = useSignMessage()
  const { address: walletAddress } = useAccount()

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Please upload an image file'); return }
    if (file.size > 2 * 1024 * 1024) { setError('Image must be under 2MB'); return }
    setError(null)

    const reader = new FileReader()
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string
      setPreview(dataUrl)
      setUploading(true)

      try {
        // Step 1: Get nonce from server
        const nonceRes = await fetch(`/api/agents/upload-image?agentId=${agentId}`)
        const nonceData = await nonceRes.json()
        if (!nonceData.success) {
          setError(nonceData.error || 'Failed to initiate upload')
          setPreview(currentImage)
          return
        }

        // Step 2: Sign the nonce message with wagmi
        if (!walletAddress) {
          setError('Please connect your wallet first')
          setPreview(currentImage)
          return
        }
        const message = nonceData.data.message
        const signature = await signMessageAsync({ message })

        // Step 3: Upload with signature verification
        const res = await fetch('/api/agents/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agentId, image: dataUrl, walletAddress, signature, message }),
        })
        const data = await res.json()
        if (!data.success) {
          setError(data.error || 'Upload failed')
          setPreview(currentImage)
        }
      } catch (err: any) {
        setError(err.message || 'Upload failed')
        setPreview(currentImage)
      } finally {
        setUploading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleRemove = async () => {
    if (!walletAddress) return
    setPreview(null)
    setUploading(true)
    try {
      const nonceRes = await fetch(`/api/agents/upload-image?agentId=${agentId}`)
      const nonceData = await nonceRes.json()
      if (!nonceData.success) return

      const message = nonceData.data.message
      const signature = await signMessageAsync({ message })

      await fetch(`/api/agents/upload-image?agentId=${agentId}&walletAddress=${walletAddress}&signature=${encodeURIComponent(signature)}&message=${encodeURIComponent(message)}`, {
        method: 'DELETE',
      })
    } catch (err) {
      console.error('Remove failed:', err)
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div className="mt-4 w-full max-w-[320px]">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
          dragOver ? 'border-primary-500 bg-primary-500/10' : 'border-white/10 hover:border-white/20'
        }`}
      >
        {preview ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Card preview" className="w-full h-32 object-cover rounded-lg" />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg">
              <span className="text-white text-xs font-medium">Click to change</span>
            </div>
            {uploading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        ) : (
          <div className="py-4">
            <p className="text-xs text-muted-foreground mb-1">📷 Upload card image</p>
            <p className="text-[10px] text-muted-foreground/60">PNG, JPG, GIF up to 2MB</p>
            <p className="text-[10px] text-muted-foreground/40 mt-1">Drag & drop or click</p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />
      </div>
      {error && <p className="mt-1 text-[10px] text-red-400">{error}</p>}
      {preview && (
        <button
          onClick={(e) => { e.stopPropagation(); handleRemove(); }}
          className="mt-2 text-[10px] text-red-400 hover:text-red-300 transition-colors"
        >
          ✕ Remove custom image
        </button>
      )}
    </div>
  )
}

/* ═══════════ VENICE AI IMAGE GENERATION COMPONENT ═══════════ */
function VeniceImageGenerator({ agentId, currentImage, agentName, agentType, tier, reputation, capabilities }: {
  agentId: string; currentImage: string | null; agentName: string; agentType: string; tier: string; reputation: number; capabilities: string
}) {
  const [generating, setGenerating] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { address: walletAddress } = useAccount()

  const defaultPrompt = `A single centered avatar for an AI agent trading card. The agent is named "${agentName}", a ${agentType.toLowerCase()} class agent with ${tier} tier and ${reputation} reputation. Specializes in ${JSON.parse(capabilities || '[]').slice(0, 3).join(', ') || agentType.toLowerCase()}. Style: clean, minimal, dark background with subtle glow, Pokémon trading card art style, centered composition, no text, no watermarks, no borders, professional digital art, high detail, vibrant colors`

  const handleGenerate = async () => {
    if (!walletAddress) { setError('Please connect your wallet first'); return }
    setGenerating(true)
    setError(null)
    setSuccess(false)
    try {
      const res = await fetch('/api/agents/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId,
          walletAddress,
          prompt: prompt || defaultPrompt,
        }),
      })
      const data = await res.json()
      if (!data.success) {
        setError(data.error || 'Generation failed')
      } else {
        setSuccess(true)
        // Reload page to show new image
        window.location.reload()
      }
    } catch (err: any) {
      setError(err.message || 'Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="mt-3 w-full max-w-[320px]">
      <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-xs font-semibold text-foreground">Venice AI Image Generation</span>
        </div>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder={defaultPrompt}
          rows={3}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] text-foreground placeholder-muted-foreground/40 resize-none focus:outline-none focus:border-primary-500/50"
        />
        <div className="flex items-center justify-between gap-2">
          <span className="text-[9px] text-muted-foreground/60">
            {currentImage ? '⚠️ Replaces current image' : '✨ Generate unique card art'}
          </span>
          <button
            onClick={handleGenerate}
            disabled={generating || !walletAddress}
            className="px-3 py-1 rounded-lg bg-purple-500/20 text-purple-400 text-[10px] font-semibold hover:bg-purple-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
          >
            {generating ? (
              <>
                <div className="w-3 h-3 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>🎨 Generate</>
            )}
          </button>
        </div>
        {error && <p className="text-[10px] text-red-400">{error}</p>}
        {success && <p className="text-[10px] text-emerald-400">✅ Image generated! Reloading...</p>}
        <p className="text-[8px] text-muted-foreground/40">
          Powered by Venice AI • Flux-dev model • 768×768
        </p>
      </div>
    </div>
  )
}

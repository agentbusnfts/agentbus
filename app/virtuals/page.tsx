// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ExternalLink, TrendingUp, TrendingDown, Users, DollarSign, BarChart3, Activity, Zap, Globe, MessageSquare, Bot, ArrowUpRight, RefreshCw } from 'lucide-react'

function formatPrice(price) {
  if (!price) return '$0.00'
  if (price >= 1) return `$${price.toFixed(2)}`
  if (price >= 0.01) return `$${price.toFixed(4)}`
  if (price >= 0.0001) return `$${price.toFixed(6)}`
  return `$${price.toFixed(8)}`
}

function formatNumber(num) {
  if (!num) return '0'
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)}B`
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`
  return num.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

function formatSupply(num) {
  if (!num) return '0'
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)}B`
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`
  return num.toLocaleString()
}

export default function VirtualsPage() {
  const [token, setToken] = useState<any>(null)
  const [agents, setAgents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [tab, setTab] = useState<'overview' | 'ecosystem' | 'trade'>('overview')

  const fetchData = async () => {
    try {
      const [tokenRes, agentsRes] = await Promise.all([
        fetch('/api/virtuals'),
        fetch('/api/virtuals/markets?pageSize=12&sort=mcapInVirtual:desc')
      ])
      if (tokenRes.ok) {
        const t = await tokenRes.json()
        if (t.success) setToken(t.data)
      }
      if (agentsRes.ok) {
        const a = await agentsRes.json()
        if (a.success) setAgents(a.data || [])
      }
    } catch (e) {
      console.error('Failed to fetch Virtuals data:', e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 60000) // Refresh every 60s
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchData()
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Loading Virtuals data...</p>
        </div>
      </div>
    )
  }

  const priceChange = token?.priceChange24h || 0
  const isUp = priceChange >= 0

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#a855f7] flex items-center justify-center text-xl">
              🚌
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Virtuals.io</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">AgentBus on Virtuals Protocol — Base L2</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 w-fit">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'ecosystem', label: 'Ecosystem', icon: Globe },
          { id: 'trade', label: 'Trade', icon: Zap },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              tab === t.id
                ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          {/* Price Hero Card */}
          <div className="bg-gradient-to-br from-[#7c3aed]/20 to-[#a855f7]/10 border border-[#7c3aed]/20 rounded-2xl p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#7c3aed]/20 text-[#a855f7]">
                    {token?.symbol || 'AGNTBUS'}
                  </span>
                  <span className="text-xs text-muted-foreground">on Virtuals Protocol</span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-bold text-foreground">
                    {formatPrice(token?.price)}
                  </span>
                  <span className={`flex items-center gap-0.5 text-sm font-medium ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {Math.abs(priceChange).toFixed(2)}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Live price from Dexscreener · Updated {token?.updatedAt ? new Date(token.updatedAt).toLocaleTimeString() : '—'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="https://app.virtuals.io/virtuals/87978"
                  target="_blank"
                  rel="noopener"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium transition-colors"
                >
                  View on Virtuals <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Market Cap', value: formatNumber(token?.marketCap), icon: DollarSign, color: 'text-emerald-400' },
              { label: 'FDV', value: formatNumber(token?.fdv), icon: BarChart3, color: 'text-blue-400' },
              { label: '24h Volume', value: formatNumber(token?.volume24h), icon: Activity, color: 'text-amber-400' },
              { label: 'Liquidity', value: formatNumber(token?.liquidity), icon: Zap, color: 'text-cyan-400' },
              { label: 'Holders', value: token?.holderCount || 0, icon: Users, color: 'text-purple-400' },
              { label: 'Supply', value: formatSupply(token?.totalSupply), icon: Globe, color: 'text-pink-400' },
            ].map(s => (
              <div key={s.label} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-3 sm:p-4 text-center">
                <s.icon className={`w-4 h-4 ${s.color} mx-auto mb-1`} />
                <p className={`text-base sm:text-lg font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Contract + Links */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
              <h2 className="text-lg font-semibold text-foreground mb-3">Contract Info</h2>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                  <span className="text-xs text-muted-foreground">Token</span>
                  <a href={`https://basescan.org/token/${token?.tokenAddress}`} target="_blank" rel="noopener" className="text-xs text-primary-400 hover:underline font-mono">
                    {token?.tokenAddress?.slice(0, 8)}...{token?.tokenAddress?.slice(-6)}
                  </a>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                  <span className="text-xs text-muted-foreground">Chain</span>
                  <span className="text-xs text-foreground font-medium">{token?.chain || 'Base L2'}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                  <span className="text-xs text-muted-foreground">DEX</span>
                  <span className="text-xs text-foreground font-medium">{token?.dex || 'Uniswap'}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                  <span className="text-xs text-muted-foreground">Status</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">{token?.status || 'UNDERGRAD'}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                  <span className="text-xs text-muted-foreground">Level</span>
                  <span className="text-xs text-foreground font-medium">Level {token?.level || 1}</span>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
              <h2 className="text-lg font-semibold text-foreground mb-3">Quick Links</h2>
              <div className="space-y-2">
                {[
                  { label: 'Virtuals App — AgentBus', url: 'https://app.virtuals.io/virtuals/87978', icon: '🚌' },
                  { label: 'Virtuals OS', url: 'https://app.virtuals.io/os', icon: '🌐' },
                  { label: 'ACP Protocol', url: 'https://app.virtuals.io/acp/scan', icon: '🤖' },
                  { label: 'Dexscreener', url: token?.pairUrl || 'https://dexscreener.com/base', icon: '📊' },
                  { label: 'BaseScan Token', url: `https://basescan.org/token/${token?.tokenAddress}`, icon: '🔍' },
                ].map(link => (
                  <a
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    rel="noopener"
                    className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <span>{link.icon}</span>
                      <span className="text-sm text-foreground">{link.label}</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Tokenomics */}
          {token?.tokenomics && token.tokenomics.length > 0 && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
              <h2 className="text-lg font-semibold text-foreground mb-3">Tokenomics</h2>
              <div className="space-y-3">
                {token.tokenomics.map((t, i) => {
                  const pct = ((t.amount / token.totalSupply) * 100).toFixed(1)
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-foreground">{t.name}</span>
                        <span className="text-muted-foreground">
                          {formatSupply(t.amount)} ({pct}%)
                          {t.isLocked && <span className="ml-1 text-amber-400">🔒</span>}
                        </span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-[#7c3aed] to-[#a855f7] h-full rounded-full"
                          style={{ width: `${Math.min(parseFloat(pct), 100)}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'ecosystem' && (
        <>
          {/* Virtuals Ecosystem Agents */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">🌐 Virtuals Ecosystem</h2>
                <p className="text-xs text-muted-foreground">Top agents on Virtuals Protocol by market cap</p>
              </div>
              <a
                href="https://app.virtuals.io/os"
                target="_blank"
                rel="noopener"
                className="text-xs text-primary-400 hover:underline flex items-center gap-1"
              >
                Explore All <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>

            {agents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bot className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No agents found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {agents.map((agent, i) => (
                  <div key={agent.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <span className="text-xs font-mono text-muted-foreground w-6 text-right">#{i + 1}</span>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7c3aed]/30 to-[#a855f7]/30 flex items-center justify-center text-sm font-bold text-foreground shrink-0">
                      {(agent.name || '?')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{agent.name}</p>
                      <p className="text-[10px] text-muted-foreground">{agent.symbol} · {agent.chain || 'Base'}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium text-foreground">${formatNumber(agent.mcapInVirtual)}</p>
                      <p className="text-[10px] text-muted-foreground">{agent.holderCount || 0} holders</p>
                    </div>
                    <a
                      href={`https://app.virtuals.io/virtuals/${agent.id}`}
                      target="_blank"
                      rel="noopener"
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AgentBus Agents on Virtuals */}
          <div className="bg-gradient-to-br from-[#7c3aed]/10 to-[#a855f7]/5 border border-[#7c3aed]/20 rounded-2xl p-5">
            <h2 className="text-lg font-semibold text-foreground mb-3">🤖 AgentBus Agents on Virtuals</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Register your AgentBus agent on Virtuals Protocol to enable ACP interactions, tokenization, and ecosystem participation.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href="https://app.virtuals.io/acp/new"
                target="_blank"
                rel="noopener"
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-[#7c3aed]/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-[#a855f7]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Register ACP Agent</p>
                  <p className="text-[10px] text-muted-foreground">Create your Virtuals agent profile</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:text-foreground transition-colors" />
              </a>
              <a
                href="https://app.virtuals.io/acp/scan"
                target="_blank"
                rel="noopener"
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-[#7c3aed]/20 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-[#a855f7]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">ACP Scanner</p>
                  <p className="text-[10px] text-muted-foreground">Browse agents, offerings, market</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:text-foreground transition-colors" />
              </a>
            </div>
          </div>
        </>
      )}

      {tab === 'trade' && (
        <>
          {/* Trading Interface */}
          <div className="bg-gradient-to-br from-[#7c3aed]/20 to-[#a855f7]/10 border border-[#7c3aed]/20 rounded-2xl p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-foreground mb-1">Trade $AGNTBUS</h2>
            <p className="text-xs text-muted-foreground mb-4">
              AgentBus token on Virtuals Protocol bonding curve. Trade directly on Virtuals or via DEX.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <a
                href="https://app.virtuals.io/virtuals/87978"
                target="_blank"
                rel="noopener"
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white transition-colors"
              >
                <Zap className="w-6 h-6" />
                <span className="text-sm font-medium">Buy on Virtuals</span>
                <span className="text-[10px] opacity-70">Bonding curve</span>
              </a>
              <a
                href={token?.pairUrl || 'https://dexscreener.com/base'}
                target="_blank"
                rel="noopener"
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              >
                <BarChart3 className="w-6 h-6 text-cyan-400" />
                <span className="text-sm font-medium text-foreground">DEX Trade</span>
                <span className="text-[10px] text-muted-foreground">{token?.dex || 'Uniswap'}</span>
              </a>
              <a
                href="https://app.virtuals.io/os"
                target="_blank"
                rel="noopener"
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              >
                <Globe className="w-6 h-6 text-emerald-400" />
                <span className="text-sm font-medium text-foreground">Virtuals OS</span>
                <span className="text-[10px] text-muted-foreground">Agent ecosystem</span>
              </a>
            </div>

            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="text-sm font-medium text-foreground mb-2">⚠️ Important Notes</h3>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• $AGNTBUS is on Virtuals Protocol bonding curve — not standard Uniswap liquidity</li>
                <li>• Use the Virtuals app for direct buy/sell via bonding curve</li>
                <li>• DEX trading available on Base L2 via {token?.dex || 'Uniswap'}</li>
                <li>• Always verify contract: <span className="font-mono text-primary-400">{token?.tokenAddress}</span></li>
              </ul>
            </div>
          </div>

          {/* Live Price Chart Placeholder */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
            <h2 className="text-lg font-semibold text-foreground mb-3">Price Overview</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-xs text-muted-foreground">Price</p>
                <p className="text-lg font-bold text-foreground">{formatPrice(token?.price)}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-xs text-muted-foreground">24h Change</p>
                <p className={`text-lg font-bold ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isUp ? '+' : ''}{priceChange.toFixed(2)}%
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-xs text-muted-foreground">24h Volume</p>
                <p className="text-lg font-bold text-foreground">${formatNumber(token?.volume24h)}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-xs text-muted-foreground">Liquidity</p>
                <p className="text-lg font-bold text-foreground">${formatNumber(token?.liquidity)}</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <div className="text-center py-4 border-t border-white/5">
        <p className="text-xs text-muted-foreground">
          Data from Virtuals Protocol API · Dexscreener · Base L2
        </p>
        <div className="flex items-center justify-center gap-3 mt-2">
          <a href="https://app.virtuals.io/virtuals/87978" target="_blank" rel="noopener" className="text-xs text-primary-400 hover:underline">Virtuals</a>
          <span className="text-muted-foreground">·</span>
          <a href="https://app.virtuals.io/os" target="_blank" rel="noopener" className="text-xs text-primary-400 hover:underline">Virtuals OS</a>
          <span className="text-muted-foreground">·</span>
          <a href="https://app.virtuals.io/acp/scan" target="_blank" rel="noopener" className="text-xs text-primary-400 hover:underline">ACP Protocol</a>
        </div>
      </div>
    </div>
  )
}

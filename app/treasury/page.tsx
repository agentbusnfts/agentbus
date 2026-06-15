// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { Wallet, ArrowUpRight, ArrowDownLeft, Coins, TrendingUp, Shield, Lock } from 'lucide-react'

export default function TreasuryPage() {
  const [metrics, setMetrics] = useState<any>(null)

  useEffect(() => {
    fetch('/api/metrics').then(r => r.json()).then(d => {
      if (d.success) setMetrics(d.data)
    }).catch(() => {})
  }, [])

  const tokenomics = [
    { label: 'Agent Rewards', pct: 30, color: 'bg-blue-500' },
    { label: 'Battle Prizes', pct: 20, color: 'bg-red-500' },
    { label: 'Project Funding', pct: 25, color: 'bg-emerald-500' },
    { label: 'Ecosystem Grants', pct: 15, color: 'bg-purple-500' },
    { label: 'Team & Operations', pct: 10, color: 'bg-amber-500' },
  ]

  const distribution = [
    { label: 'Liquidity Pool', pct: 20, color: 'bg-emerald-500' },
    { label: 'Treasury Reserve', pct: 80, color: 'bg-amber-500' },
  ]

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">🏦 Treasury</h1>
        <p className="text-sm text-muted-foreground">AgentBus treasury, tokenomics, and fund management</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-muted-foreground">Total Supply</span>
          </div>
          <p className="text-xl font-bold text-foreground">$AGNTBUS</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-muted-foreground">Token</span>
          </div>
          <p className="text-xl font-bold text-foreground">$AGNTBUS</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-muted-foreground">Platform</span>
          </div>
          <p className="text-xl font-bold text-foreground">Virtuals</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-muted-foreground">Chain</span>
          </div>
          <p className="text-xl font-bold text-foreground">Base L2</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 border border-amber-500/20 rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-foreground mb-2">🌕 Live on Virtuals</h2>
        <p className="text-sm text-muted-foreground mb-3">$AGNTBUS is live on Virtuals.io. Trade now on Base L2.</p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-muted-foreground text-xs">Platform</p>
            <a href="https://app.virtuals.io/virtuals/87978" target="_blank" rel="noopener" className="font-semibold text-amber-400 hover:underline">Virtuals →</a>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-muted-foreground text-xs">Contract</p>
            <a href="https://basescan.org/token/0x5AAD90bcC905ed276d13566C98D158C2FD0376dD" target="_blank" rel="noopener" className="font-semibold text-emerald-400 hover:underline text-xs font-mono">0x5AAD...76dD</a>
          </div>
        </div>
      </div>

      {/* Wallets */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-foreground mb-4">Treasury Wallets</h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Treasury Contract</p>
                <p className="text-xs text-muted-foreground font-mono">0x8805...A189</p>
              </div>
            </div>
            <span className="text-xs text-emerald-400">Main Treasury</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Lock className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Rewards Agent</p>
                <p className="text-xs text-muted-foreground font-mono">0x4738...06Fb</p>
              </div>
            </div>
            <span className="text-xs text-amber-400">Battle Prizes & Rewards</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Shield className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Owner / Founder</p>
                <p className="text-xs text-muted-foreground font-mono">0xA7D9...b6ca</p>
              </div>
            </div>
            <span className="text-xs text-purple-400">Governance & Emergency</span>
          </div>
        </div>
      </div>

      {/* Contract Links */}
      <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-indigo-500/20 rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-foreground mb-3">Contract Addresses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
            <span className="text-muted-foreground">AgentNFT</span>
            <a href="https://basescan.org/address/0xb085E4795fC252FE167E900bcAf221DE87FD7218" target="_blank" rel="noopener" className="text-primary-400 hover:underline font-mono text-xs">0xb085E4...7218</a>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
            <span className="text-muted-foreground">$AGNTBUS Token</span>
            <a href="https://app.virtuals.io/virtuals/87978" target="_blank" rel="noopener" className="text-primary-400 hover:underline text-xs">0x5AAD...76dD</a>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
            <span className="text-muted-foreground">Treasury</span>
            <span className="text-muted-foreground font-mono text-xs">0x8805...A189</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
            <span className="text-muted-foreground">OpenSea Collection</span>
            <a href="https://opensea.io/collection/agentbusx" target="_blank" rel="noopener" className="text-primary-400 hover:underline text-xs">View →</a>
          </div>
        </div>
      </div>
    </div>
  )
}

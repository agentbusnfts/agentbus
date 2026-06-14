// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Fingerprint, Globe, Key, Shield, ExternalLink } from 'lucide-react'

export default function IdentityPage() {
  const { address, isConnected } = useAccount()
  const [agents, setAgents] = useState<any[]>([])
  const [human, setHuman] = useState<any>(null)

  useEffect(() => {
    fetch('/api/agents').then(r => r.json()).then(d => {
      if (d.success) setAgents(d.data.items || [])
    }).catch(() => {})
    fetch('/api/humans').then(r => r.json()).then(d => {
      if (d.success) setHumans(d.data || [])
    }).catch(() => {})
  }, [])

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">🆔 Identity System</h1>
        <p className="text-sm text-muted-foreground">On-chain agent NFTs and human identities in the AgentBus network</p>
      </div>

      {/* Contract Info */}
      <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/20 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl">🎴</div>
          <div>
            <h2 className="text-lg font-bold text-foreground">AgentNFT Contract</h2>
            <p className="text-xs text-muted-foreground">Non-standard ERC-721 · Supply read from events · Permissionless registration</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <div className="bg-white/5 rounded-lg p-2">
            <p className="text-[10px] text-muted-foreground">Contract</p>
            <p className="font-mono text-xs text-primary-400">0xb085E4...7218</p>
          </div>
          <div className="bg-white/5 rounded-lg p-2">
            <p className="text-[10px] text-muted-foreground">Network</p>
            <p className="text-xs text-foreground">Base Mainnet</p>
          </div>
          <div className="bg-white/5 rounded-lg p-2">
            <p className="text-[10px] text-muted-foreground">Standard</p>
            <p className="text-xs text-foreground">ERC-721 (Custom)</p>
          </div>
          <div className="bg-white/5 rounded-lg p-2">
            <p className="text-[10px] text-muted-foreground">Total Agents</p>
            <p className="text-xs text-foreground">{agents.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <a href="https://basescan.org/address/0xb085E4795fC252FE167E900bcAf221DE87FD7218" target="_blank" rel="noopener" className="text-xs text-primary-400 hover:underline">BaseScan</a>
          <span className="text-xs text-muted-foreground">·</span>
          <a href="https://opensea.io/collection/agentbusagent" target="_blank" rel="noopener" className="text-xs text-primary-400 hover:underline">OpenSea</a>
        </div>
      </div>

      {/* Identity Registry */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-foreground mb-4">Registered Identities</h2>
        <div className="space-y-2">
          {agents.filter(a => a.tokenId !== null).map(agent => (
            <div key={agent.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3">
                <Fingerprint className="w-4 h-4 text-purple-400" />
                <div>
                  <p className="text-sm font-medium text-foreground">{agent.name}</p>
                  <p className="text-[10px] text-muted-foreground">Token #{agent.tokenId} · {agent.agentType}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {agent.dns && (
                  <span className="flex items-center gap-1 text-xs text-primary-400">
                    <Globe className="w-3 h-3" /> {agent.dns}
                  </span>
                )}
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${agent.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400'}`}>
                  {agent.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

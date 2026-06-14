// AgentBus — Connect Wallet Button
'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { base } from 'wagmi/chains'

export function ConnectButton() {
  const { address, isConnected, chain } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  if (isConnected && address) {
    const isWrongChain = chain?.id !== base.id
    return (
      <div className="flex items-center gap-2">
        {isWrongChain && (
          <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
            Wrong Network
          </span>
        )}
        <button
          onClick={() => disconnect()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-muted-foreground">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => connect({ connector: connectors[0], chainId: base.id })}
      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500/10 border border-primary-500/20 hover:bg-primary-500/20 transition-all text-sm text-primary-400 font-medium"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      Connect Wallet
    </button>
  )
}

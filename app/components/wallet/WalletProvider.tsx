// AgentBus — Wallet Provider wrapper
'use client'

import { WagmiProvider, createConfig, http } from 'wagmi'
import { base } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { injected } from 'wagmi/connectors'
import { type ReactNode } from 'react'

const config = createConfig({
  chains: [base],
  connectors: [injected({ target: 'metaMask' })],
  transports: {
    [base.id]: http('https://mainnet.base.org'),
  },
  ssr: true,
})

const queryClient = new QueryClient()

export function WalletProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}

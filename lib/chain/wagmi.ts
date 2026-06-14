// AgentBus — wagmi configuration
import { http, createConfig } from 'wagmi'
import { base } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ''

export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    injected({ target: 'metaMask' }),
    ...(projectId ? [walletConnect({ projectId })] : []),
  ],
  transports: {
    [base.id]: http('https://mainnet.base.org'),
  },
  ssr: true,
})

// Contract addresses — Base mainnet
export const CONTRACTS = {
  agentNFT: {
    address: (process.env.NEXT_PUBLIC_AGENT_NFT_ADDRESS || '0xb085E4795fC252FE167E900bcAf221DE87FD7218') as `0x${string}`,
    chainId: 8453,
  },
} as const

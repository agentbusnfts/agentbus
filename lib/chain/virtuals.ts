// Virtuals.io API service
// Docs: api2.virtuals.io (public), api.acp.virtuals.io (auth-required)

const VIRTUALS_API = 'https://api2.virtuals.io'
const VIRTUALS_APP = 'https://app.virtuals.io'

export interface VirtualsTokenData {
  id: number
  name: string
  symbol: string
  description: string
  mcapInVirtual: number
  fdvInVirtual: number
  virtualTokenValue: number
  totalSupply: number
  holderCount: number
  volume24h: number
  priceChangePercent24h: number
  liquidityUsd: number
  totalValueLocked: number
  chain: string
  tokenAddress: string
  preToken: string
  lpAddress: string | null
  status: string
  level: number
  isVerified: boolean
  socials: {
    VERIFIED_LINKS: {
      TWITTER?: string
      WEBSITE?: string
    }
  }
  tokenomics: Array<{
    name: string
    amount: number
    isLocked: boolean
  }>
  launchedAt: string
}

export interface VirtualsAgent {
  id: number
  name: string
  description: string
  symbol: string
  mcapInVirtual: number
  volume24h: number
  holderCount: number
  chain: string
  tokenAddress: string
  status: string
  imageUrl?: string
  socials?: {
    VERIFIED_LINKS: {
      TWITTER?: string
      WEBSITE?: string
    }
  }
}

// Fetch token data for a Virtuals agent by ID
export async function fetchVirtualsToken(virtualId: number): Promise<VirtualsTokenData | null> {
  try {
    const res = await fetch(`${VIRTUALS_API}/api/virtuals/${virtualId}`, {
      next: { revalidate: 60 } // Cache for 60 seconds
    })
    if (!res.ok) return null
    const json = await res.json()
    return json.data || null
  } catch {
    return null
  }
}

// Fetch top Virtuals agents by market cap
export async function fetchTopAgents(page = 1, pageSize = 20): Promise<{ agents: VirtualsAgent[], total: number }> {
  try {
    const res = await fetch(
      `${VIRTUALS_API}/api/agents?pagination[page]=${page}&pagination[pageSize]=${pageSize}&sort=mcapInVirtual:desc`,
      { next: { revalidate: 120 } }
    )
    if (!res.ok) return { agents: [], total: 0 }
    const json = await res.json()
    return {
      agents: json.data || [],
      total: json.meta?.pagination?.total || 0
    }
  } catch {
    return { agents: [], total: 0 }
  }
}

// Search Virtuals agents
export async function searchVirtualsAgents(query: string): Promise<VirtualsAgent[]> {
  try {
    const res = await fetch(
      `${VIRTUALS_API}/api/agents?filters[name][$containsi]=${encodeURIComponent(query)}&pagination[pageSize]=20`,
      { next: { revalidate: 60 } }
    )
    if (!res.ok) return []
    const json = await res.json()
    return json.data || []
  } catch {
    return []
  }
}

// Fetch agent details by ID
export async function fetchAgentDetails(agentId: number): Promise<VirtualsAgent | null> {
  try {
    const res = await fetch(`${VIRTUALS_API}/api/agents/${agentId}/details`, {
      next: { revalidate: 60 }
    })
    if (!res.ok) return null
    const json = await res.json()
    return json.data || null
  } catch {
    return null
  }
}

// Fetch agent engagements (jobs/tasks)
export async function fetchAgentEngagements(agentId: number, page = 1, pageSize = 20) {
  try {
    const res = await fetch(
      `${VIRTUALS_API}/api/agents/${agentId}/engagements?pagination[page]=${page}&pagination[pageSize]=${pageSize}`,
      { next: { revalidate: 60 } }
    )
    if (!res.ok) return { engagements: [], total: 0 }
    const json = await res.json()
    return {
      engagements: json.data || [],
      total: json.meta?.pagination?.total || 0
    }
  } catch {
    return { engagements: [], total: 0 }
  }
}

// Fetch agent tokens (portfolio)
export async function fetchAgentTokens(agentId: number): Promise<any[]> {
  try {
    const res = await fetch(`${VIRTUALS_API}/api/agents/${agentId}/tokens`, {
      next: { revalidate: 120 }
    })
    if (!res.ok) return []
    const json = await res.json()
    return json.data || json || []
  } catch {
    return []
  }
}

// Fetch price from Dexscreener/Virtuals DEX
export async function fetchTokenPrice(tokenAddress: string) {
  try {
    const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`, {
      next: { revalidate: 30 }
    })
    if (!res.ok) return null
    const json = await res.json()
    const pair = json.pairs?.[0]
    if (!pair) return null
    return {
      price: parseFloat(pair.priceUsd) || 0,
      priceChange24h: pair.priceChange?.h24 || 0,
      volume24h: pair.volume?.h24 || 0,
      liquidity: pair.liquidity?.usd || 0,
      fdv: pair.fdv || 0,
      marketCap: pair.marketCap || 0,
    }
  } catch {
    return null
  }
}

// Format large numbers
export function formatNumber(num: number | string | null | undefined): string {
  if (num === null || num === undefined) return '0'
  const n = typeof num === 'string' ? parseFloat(num) : num
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(2)}K`
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

// Format price with appropriate decimals
export function formatPrice(price: number | string): string {
  const p = typeof price === 'string' ? parseFloat(price) : price
  if (p >= 1) return `$${p.toFixed(2)}`
  if (p >= 0.01) return `$${p.toFixed(4)}`
  if (p >= 0.0001) return `$${p.toFixed(6)}`
  return `$${p.toFixed(8)}`
}

// AgentBus Virtuals ID
export const AGENTBUS_VIRTUAL_ID = 87978

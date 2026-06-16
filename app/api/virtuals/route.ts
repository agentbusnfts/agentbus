import { NextResponse } from 'next/server'
import { getNetworkMetrics } from '@/lib/db/database'

// Cache token data in-memory (avoid hammering API)
let tokenCache: any = { data: null, ts: 0 }
const CACHE_TTL = 60_000 // 60 seconds

export async function GET() {
  try {
    // Check cache
    if (tokenCache.data && Date.now() - tokenCache.ts < CACHE_TTL) {
      return NextResponse.json({ success: true, data: tokenCache.data })
    }

    // Fetch from Virtuals API
    const res = await fetch('https://api2.virtuals.io/api/virtuals/87978', {
      signal: AbortSignal.timeout(10000)
    })

    if (!res.ok) {
      // Fallback to DB metrics
      const metrics = await getNetworkMetrics()
      return NextResponse.json({
        success: true,
        data: {
          ...metrics,
          source: 'cache',
          note: 'Virtuals API unavailable, using cached data'
        }
      })
    }

    const json = await res.json()
    const v = json.data

    // Calculate price from market cap / supply
    // Virtuals doesn't return a direct price field
    const totalSupply = parseFloat(v.totalSupply) || 1_000_000_000
    const mcapInVirtual = parseFloat(v.mcapInVirtual) || 0
    const fdvInVirtual = parseFloat(v.fdvInVirtual) || 0
    const liquidityUsd = parseFloat(v.liquidityUsd) || 0
    const holderCount = parseInt(v.holderCount) || 0

    // Price = market cap / total supply
    const price = totalSupply > 0 ? mcapInVirtual / totalSupply : 0

    // Virtuals API returns volume24hVirtual in the root but it may be 0 for new tokens
    // No Dexscreener pair exists yet (Virtuals bonding curve only)
    const volume24hVirtual = parseFloat(v.volume24h) || 0

    const data = {
      // Virtuals native data
      virtualId: v.id,
      name: v.name,
      symbol: v.symbol,
      description: v.description,
      status: v.status,
      level: v.level,
      isVerified: v.isVerified,
      launchedAt: v.launchedAt,

      // Market data
      price,
      mcapInVirtual,
      fdvInVirtual,
      liquidityUsd,
      holderCount,
      volume24h: volume24hVirtual,
      totalSupply,

      // Aliases for dashboard
      marketCap: mcapInVirtual,
      fdv: fdvInVirtual,
      liquidity: liquidityUsd,

      // Contract addresses
      tokenAddress: v.preToken,
      lpAddress: v.lpAddress,
      chain: v.chain,

      // Socials
      socials: v.socials,
      roadmap: v.roadmap,
      tokenUtility: v.tokenUtility,

      // Tokenomics summary
      tokenomics: v.tokenomics?.map((t: any) => ({
        name: t.name,
        amount: t.amount,
        isLocked: t.isLocked
      })),

      // Source tracking
      source: 'live',
      updatedAt: new Date().toISOString()
    }

    tokenCache = { data, ts: Date.now() }
    return NextResponse.json({ success: true, data })
  } catch (e) {
    return NextResponse.json({
      success: false,
      error: e instanceof Error ? e.message : 'Unknown error'
    }, { status: 500 })
  }
}

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
      const metrics = getNetworkMetrics()
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

    // Also fetch live price from Dexscreener
    let priceData = null
    try {
      const priceRes = await fetch(
        `https://api.dexscreener.com/latest/dex/tokens/${v.preToken}`,
        { signal: AbortSignal.timeout(5000) }
      )
      if (priceRes.ok) {
        const priceJson = await priceRes.json()
        const pair = priceJson.pairs?.[0]
        if (pair) {
          priceData = {
            price: parseFloat(pair.priceUsd) || 0,
            priceChange24h: pair.priceChange?.h24 || 0,
            volume24h: pair.volume?.h24 || 0,
            liquidity: pair.liquidity?.usd || 0,
            fdv: pair.fdv || 0,
            marketCap: pair.marketCap || 0,
            dex: pair.dexId || '',
            pairUrl: pair.url || ''
          }
        }
      }
    } catch { /* price fetch failed, continue without it */ }

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

      // Market data (Virtuals)
      mcapInVirtual: parseFloat(v.mcapInVirtual) || 0,
      fdvInVirtual: parseFloat(v.fdvInVirtual) || 0,
      virtualTokenValue: parseFloat(v.virtualTokenValue) || 0,
      totalSupply: v.totalSupply,
      holderCount: v.holderCount || 0,
      volume24hVirtual: parseFloat(v.volume24h) || 0,
      liquidityUsd: parseFloat(v.liquidityUsd) || 0,

      // Price data (Dexscreener)
      price: priceData?.price || 0,
      priceChange24h: priceData?.priceChange24h || 0,
      volume24h: priceData?.volume24h || parseFloat(v.volume24h) || 0,
      liquidity: priceData?.liquidity || parseFloat(v.liquidityUsd) || 0,
      fdv: priceData?.fdv || parseFloat(v.fdvInVirtual) || 0,
      marketCap: priceData?.marketCap || parseFloat(v.mcapInVirtual) || 0,
      dex: priceData?.dex || '',
      pairUrl: priceData?.pairUrl || '',

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

// AgentBus — Cards API
// Returns all agents with enriched card metadata for the NFT collection page

import { NextRequest, NextResponse } from 'next/server'
import { getAgentsWithCards } from '@/lib/db/database'
import { AGENT_CARD_SEEDS } from '@/lib/db/card-seeds'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const enrich = searchParams.get('enrich') !== 'false' // default: true

    let agents = await getAgentsWithCards()

    // Parse cardMetadata from JSON string and fill from seeds if missing
    const enriched = agents.map((agent: any) => {
      let cardMetadata = null
      if (agent.cardMetadata) {
        try {
          cardMetadata = typeof agent.cardMetadata === 'string'
            ? JSON.parse(agent.cardMetadata)
            : agent.cardMetadata
        } catch { /* ignore parse errors */ }
      }

      // Fall back to seed data if DB has no card metadata
      if (!cardMetadata && AGENT_CARD_SEEDS[agent.id]) {
        cardMetadata = AGENT_CARD_SEEDS[agent.id]
      }

      // Parse capabilities
      let capabilities: string[] = []
      if (agent.capabilities) {
        try {
          capabilities = typeof agent.capabilities === 'string'
            ? JSON.parse(agent.capabilities)
            : agent.capabilities
        } catch { /* ignore */ }
      }

      return {
        ...agent,
        cardMetadata,
        capabilities,
      }
    })

    return NextResponse.json({
      success: true,
      data: enriched,
      total: enriched.length,
    })
  } catch (error: any) {
    console.error('Cards API error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch cards' },
      { status: 500 }
    )
  }
}

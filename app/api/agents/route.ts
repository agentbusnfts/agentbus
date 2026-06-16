// AgentBus — Agents API (database + on-chain enrichment)
import { NextRequest, NextResponse } from 'next/server'
import { getAgents, getAgent, createAgent } from '@/lib/db/database'
import { fetchAgentOnChain } from '@/lib/db/chain-agents'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const ownerFilter = searchParams.get('owner') || undefined
    const enrich = searchParams.get('enrich') === 'true' // optionally fetch on-chain data

    const allAgents = await getAgents(ownerFilter) as any[]
    const start = (page - 1) * pageSize
    const items = allAgents.slice(start, start + pageSize)

    // Optionally enrich with on-chain data
    let enrichedItems = items
    if (enrich) {
      enrichedItems = await Promise.all(items.map(async (agent) => {
        if (agent.tokenId !== null && agent.tokenId !== undefined) {
          try {
            const onChain = await fetchAgentOnChain(Number(agent.tokenId))
            if (onChain) {
              return {
                ...agent,
                // On-chain overrides for identity attributes
                name: onChain.name,
                agentType: onChain.agentTypeLabel.toUpperCase(),
                reputation: onChain.reputation,
                tier: onChain.tierLabel.toUpperCase(),
                owner: onChain.owner,
                active: onChain.active,
                totalEarnings: onChain.totalEarnings,
                totalSpent: onChain.totalSpent,
                battlesWon: onChain.battlesWon,
                battlesLost: onChain.battlesLost,
                projectsCompleted: onChain.projectsCompleted,
                registrationTime: onChain.registrationTime,
                tokenURI: onChain.tokenURI,
                inscriptionHash: onChain.inscriptionHash,
                earningsMultiplier: onChain.earningsMultiplier,
                battleWeight: onChain.battleWeight,
                dataSource: { onChain: true, database: true },
              }
            }
          } catch { /* on-chain fetch failed, use DB data */ }
        }
        return { ...agent, dataSource: { onChain: false, database: true } }
      }))
    }

    return NextResponse.json({
      success: true,
      data: {
        items: enrichedItems,
        total: allAgents.length,
        page,
        pageSize,
        hasMore: start + pageSize < allAgents.length,
      }
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

// POST /api/agents — Register new agent in database
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, agentType, owner, publicKey, tokenId } = body

    if (!name) {
      return NextResponse.json({ success: false, error: 'name required' }, { status: 400 })
    }

    const existing = await getAgent(name)
    if (existing) {
      return NextResponse.json({ success: false, error: 'Agent name taken', data: { id: (existing as any).id } }, { status: 409 })
    }

    const agent = await createAgent({
      name,
      agentType: agentType || 'CUSTOM',
      owner: owner || null,
      tokenId: tokenId || null,
      reputation: 0,
      tier: 'BRONZE',
      active: true,
    })

    return NextResponse.json({ success: true, data: agent }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

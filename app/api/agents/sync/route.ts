// AgentBus — Sync agents from on-chain to database
import { NextRequest, NextResponse } from 'next/server'
import { fetchAgentOnChain, fetchAllAgentTokenIds, getTokenIdByName } from '@/lib/db/chain-agents'
import { getAgent, createAgent, updateAgent } from '@/lib/db/database'

const AGENT_TYPE_MAP: Record<number, string> = {
  0: 'OPERATIONS', 1: 'RESEARCH', 2: 'TRADING', 3: 'CREATIVE', 4: 'SECURITY',
  5: 'GOVERNANCE', 6: 'ANALYTICS', 7: 'COORDINATION', 8: 'CODING', 9: 'CUSTOM',
}

const TIER_MAP: Record<number, string> = {
  0: 'BRONZE', 1: 'SILVER', 2: 'GOLD', 3: 'PLATINUM', 4: 'DIAMOND',
}

/**
 * Sync a single agent from on-chain to DB
 */
async function syncAgentFromChain(tokenId: number): Promise<any> {
  const onChain = await fetchAgentOnChain(tokenId)
  if (!onChain) return null

  // Check if agent exists in DB
  const existing = await getAgent(`agent-${tokenId}`)

  const agentData = {
    id: `agent-${tokenId}`,
    name: onChain.name,
    tokenId: onChain.tokenId,
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
    metadataUri: onChain.tokenURI || '',
    inscriptionHash: onChain.inscriptionHash || '',
  }

  if (existing) {
    // Update with on-chain data (on-chain is source of truth for identity)
    await updateAgent(agentData.id, agentData)
  } else {
    // Create new agent in DB from on-chain data
    await createAgent(agentData)
  }

  return agentData
}

// GET /api/agents/sync — sync all agents from on-chain
export async function GET(request: NextRequest) {
  try {
    const ids = await fetchAllAgentTokenIds()
    const results = []
    const errors = []

    for (const tokenId of ids) {
      try {
        const synced = await syncAgentFromChain(tokenId)
        if (synced) results.push(synced)
      } catch (err: any) {
        errors.push({ tokenId, error: err.message })
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        synced: results.length,
        total: ids.length,
        errors: errors.length > 0 ? errors : undefined,
      }
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

// POST /api/agents/sync — sync a specific agent by token ID or name
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    let tokenId: number | null = null

    if (body.tokenId !== undefined) {
      tokenId = Number(body.tokenId)
    } else if (body.name) {
      tokenId = await getTokenIdByName(body.name)
    } else if (body.id) {
      // Extract token ID from agent-N format
      const match = body.id.match(/^agent-(\d+)$/)
      if (match) tokenId = Number(match[1])
    }

    if (tokenId === null || tokenId === undefined) {
      return NextResponse.json({ success: false, error: 'Invalid tokenId, name, or id' }, { status: 400 })
    }

    const synced = await syncAgentFromChain(tokenId)
    if (!synced) {
      return NextResponse.json({ success: false, error: 'Agent not found on-chain' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: synced })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

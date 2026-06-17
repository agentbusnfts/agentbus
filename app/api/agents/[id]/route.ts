// AgentBus — Single Agent API (merged on-chain + off-chain data)
import { NextRequest, NextResponse } from 'next/server'
import { getAgent } from '@/lib/db/database'
import { fetchAgentOnChain, getTokenIdByName } from '@/lib/db/chain-agents'

interface Params {
  id: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params

    // Try to resolve token ID from the identifier
    let tokenId: number | null = null

    // Check if it's a numeric token ID or agent-N format
    const numMatch = id.match(/^agent-(\d+)$/)
    if (numMatch) {
      tokenId = Number(numMatch[1])
    } else if (/^\d+$/.test(id)) {
      tokenId = Number(id)
    } else {
      // Try to look up by name on-chain
      tokenId = await getTokenIdByName(id)
    }

    // Fetch DB data (off-chain metadata: capabilities, DNS, etc.)
    const dbAgent = await getAgent(id)

    // Fetch on-chain data (source of truth for identity attributes)
    let onChainAgent = null
    if (tokenId !== null) {
      onChainAgent = await fetchAgentOnChain(tokenId)
    }

    // If we have neither, agent not found
    if (!dbAgent && !onChainAgent) {
      return NextResponse.json({ success: false, error: 'Agent not found' }, { status: 404 })
    }

    // Merge: on-chain is source of truth for identity, DB adds extended metadata
    const merged = {
      // Identity (from on-chain if available, else DB)
      id: onChainAgent ? `agent-${onChainAgent.tokenId}` : dbAgent?.id,
      tokenId: onChainAgent?.tokenId ?? dbAgent?.tokenId ?? null,
      name: onChainAgent?.name ?? dbAgent?.name ?? 'Unknown',
      agentType: onChainAgent?.agentTypeLabel ?? dbAgent?.agentType ?? 'CUSTOM',
      agentTypeRaw: onChainAgent?.agentType ?? null,
      reputation: onChainAgent?.reputation ?? dbAgent?.reputation ?? 0,
      tier: onChainAgent?.tierLabel ?? dbAgent?.tier ?? 'BRONZE',
      tierRaw: onChainAgent?.tier ?? null,
      owner: onChainAgent?.owner ?? dbAgent?.owner ?? null,
      active: onChainAgent?.active ?? dbAgent?.active ?? true,

      // Performance (from on-chain)
      totalEarnings: onChainAgent?.totalEarnings ?? dbAgent?.totalEarnings ?? '0',
      totalSpent: onChainAgent?.totalSpent ?? dbAgent?.totalSpent ?? '0',
      battlesWon: onChainAgent?.battlesWon ?? dbAgent?.battlesWon ?? 0,
      battlesLost: onChainAgent?.battlesLost ?? dbAgent?.battlesLost ?? 0,
      projectsCompleted: onChainAgent?.projectsCompleted ?? dbAgent?.projectsCompleted ?? 0,
      registrationTime: onChainAgent?.registrationTime ?? null,

      // On-chain extras
      tokenURI: onChainAgent?.tokenURI ?? dbAgent?.metadataUri ?? null,
      inscriptionHash: onChainAgent?.inscriptionHash ?? dbAgent?.inscriptionHash ?? null,
      earningsMultiplier: onChainAgent?.earningsMultiplier ?? 10000,
      battleWeight: onChainAgent?.battleWeight ?? 10000,

      // Off-chain metadata (from DB only)
      capabilities: dbAgent?.capabilities ?? [],
      dns: dbAgent?.dns ?? null,
      metadataUri: dbAgent?.metadataUri ?? null,
      cardMetadata: (() => {
        if (!dbAgent?.cardMetadata) return null
        try {
          return typeof dbAgent.cardMetadata === 'string'
            ? JSON.parse(dbAgent.cardMetadata)
            : dbAgent.cardMetadata
        } catch { return null }
      })(),

      // Timestamps
      createdAt: dbAgent?.createdAt ?? null,
      updatedAt: dbAgent?.updatedAt ?? null,

      // Source tracking
      dataSource: {
        onChain: !!onChainAgent,
        database: !!dbAgent,
      }
    }

    return NextResponse.json({ success: true, data: merged })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'

// GET /api/virtuals/interact/[agentId] — Get agent interaction data
// This endpoint prepares data for interacting with Virtuals agents via ACP
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ agentId: string }> } | any
) {
  try {
    const resolved = await params
    const agentId = resolved?.agentId
    if (!agentId) {
      return NextResponse.json({ success: false, error: 'Missing agent ID' }, { status: 400 })
    }

    // Fetch agent details from Virtuals (try virtuals endpoint first, it's more reliable)
    let raw = ''
    try {
      const vRes = await fetch(`https://api2.virtuals.io/api/virtuals/${agentId}`, {
        signal: AbortSignal.timeout(15000),
        headers: { 'Accept': 'application/json' },
      })
      if (vRes.ok) raw = await vRes.text()
    } catch { /* timeout or network error */ }

    if (!raw || raw.trim().length === 0) {
      // Fallback to agents endpoint
      try {
        const aRes = await fetch(`https://api2.virtuals.io/api/agents/${agentId}/details`, {
          signal: AbortSignal.timeout(15000),
          headers: { 'Accept': 'application/json' },
        })
        if (aRes.ok) raw = await aRes.text()
      } catch { /* timeout or network error */ }
    }

    // Fetch engagements separately
    let engagements: any[] = []
    try {
      const eRes = await fetch(`https://api2.virtuals.io/api/agents/${agentId}/engagements?pagination[page]=1&pagination[pageSize]=10`, {
        signal: AbortSignal.timeout(10000),
      })
      if (eRes.ok) {
        const eText = await eRes.text()
        if (eText && eText.trim().length > 0) {
          const eJson = JSON.parse(eText)
          engagements = eJson.data || []
        }
      }
    } catch { /* ignore engagement errors */ }

    if (!raw || raw.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Agent not found (upstream unavailable)' }, { status: 503 })
    }

    const details = JSON.parse(raw).data || JSON.parse(raw)

    if (!details) {
      return NextResponse.json({ success: false, error: 'Agent not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        id: details.id,
        name: details.name,
        symbol: details.symbol,
        description: details.description,
        chain: details.chain || 'BASE',
        walletAddress: details.walletAddress,
        mcapInVirtual: parseFloat(details.mcapInVirtual) || 0,
        volume24h: parseFloat(details.volume24h) || 0,
        holderCount: details.holderCount || 0,
        status: details.status,
        acpAgentId: details.acpAgentId,
        v3AcpAgentId: details.v3AcpAgentId,
        socials: details.socials,
        // Interaction endpoints
        interactionUrls: {
          virtualsProfile: `https://app.virtuals.io/virtuals/${agentId}`,
          acpProfile: details.acpAgentId ? `https://app.virtuals.io/acp/agent/${details.acpAgentId}` : null,
          acpInteract: details.acpAgentId ? `https://app.virtuals.io/acp/agent/${details.acpAgentId}` : null,
        },
        // Recent engagements (jobs/tasks)
        recentEngagements: engagements.slice(0, 5).map((e: any) => ({
          id: e.id,
          title: e.title || e.description?.slice(0, 60),
          status: e.status,
          createdAt: e.createdAt,
        })),
      }
    })
  } catch (e) {
    return NextResponse.json({
      success: false,
      error: e instanceof Error ? e.message : 'Unknown error'
    }, { status: 500 })
  }
}

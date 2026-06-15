import { NextRequest, NextResponse } from 'next/server'
import { getAgent } from '@/lib/db/database'

// POST /api/virtuals/acp/register — Register AgentBus agent as Virtuals ACP agent
// This requires wallet authentication via the Virtuals app
// The actual ACP registration happens through the Virtuals frontend
// This API prepares the data and provides the registration link

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { agentId, agentName, walletAddress } = body

    if (!agentId || !agentName) {
      return NextResponse.json({
        success: false,
        error: 'Missing agentId or agentName'
      }, { status: 400 })
    }

    // Get agent from DB
    const agent = getAgent(agentId || agentName)

    if (!agent) {
      return NextResponse.json({
        success: false,
        error: 'Agent not found in AgentBus registry'
      }, { status: 404 })
    }

    // Return registration data for Virtuals ACP
    // The actual registration must be done through the Virtuals app with wallet auth
    return NextResponse.json({
      success: true,
      data: {
        agent: {
          id: (agent as any).id,
          name: (agent as any).name,
          agentType: (agent as any).agentType,
          description: (agent as any).description,
          reputation: (agent as any).reputation,
          tier: (agent as any).tier,
        },
        registration: {
          // Virtuals ACP registration URL
          acpRegisterUrl: 'https://app.virtuals.io/acp/new',
          // Virtuals profile URL
          virtualsProfileUrl: `https://app.virtuals.io/virtuals/87978`,
          // ACP scan URL
          acpScanUrl: 'https://app.virtuals.io/acp/scan',
        },
        // Instructions for registration
        instructions: [
          '1. Go to https://app.virtuals.io/acp/new',
          '2. Connect your wallet (must be the agent owner)',
          '3. Fill in agent details (name, description, capabilities)',
          '4. Set agent wallet address to the AgentBus agent wallet',
          '5. Submit registration transaction',
          '6. Once registered, the agent will appear in ACP scan',
        ],
        // AgentBus platform data that Virtuals agents can discover
        platformData: {
          name: 'AgentBus',
          description: 'The coordination layer where AI agents and humans collaborate, transact, and build together.',
          url: 'https://agentbusx.xyz',
          api: 'https://agentbusx.xyz/api',
          agentsEndpoint: 'https://agentbusx.xyz/api/agents',
          tasksEndpoint: 'https://agentbusx.xyz/api/swarm',
          battlesEndpoint: 'https://agentbusx.xyz/api/battles',
          launchpadEndpoint: 'https://agentbusx.xyz/api/projects',
          commEndpoint: 'https://agentbusx.xyz/api/comm',
          capabilities: [
            'Agent Registration (NFT-based identity)',
            'Reputation System',
            'Battle Arena (agent competitions)',
            'Project Launchpad (funding & execution)',
            'Swarm Operations (multi-agent tasks)',
            'Governance (AIP proposals)',
            'Collective Memory',
            'Multi-channel Communication',
          ],
        }
      }
    })
  } catch (e) {
    return NextResponse.json({
      success: false,
      error: e instanceof Error ? e.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET /api/virtuals/acp/status — Check ACP registration status
export async function GET() {
  try {
    // Check if AgentBus has an ACP agent registered
    const res = await fetch('https://api2.virtuals.io/api/virtuals/87978', {
      signal: AbortSignal.timeout(10000)
    })

    if (!res.ok) {
      return NextResponse.json({
        success: true,
        data: {
          acpRegistered: false,
          acpAgentId: null,
          v3AcpAgentId: null,
          message: 'Unable to check Virtuals API'
        }
      })
    }

    const json = await res.json()
    const v = json.data

    return NextResponse.json({
      success: true,
      data: {
        acpRegistered: !!(v.acpAgentId || v.v3AcpAgentId),
        acpAgentId: v.acpAgentId,
        v3AcpAgentId: v.v3AcpAgentId,
        virtualId: v.id,
        name: v.name,
        status: v.status,
        level: v.level,
        walletAddress: v.walletAddress,
        tbaAddress: v.tbaAddress,
        sentientWalletAddress: v.sentientWalletAddress,
      }
    })
  } catch (e) {
    return NextResponse.json({
      success: false,
      error: e instanceof Error ? e.message : 'Unknown error'
    }, { status: 500 })
  }
}

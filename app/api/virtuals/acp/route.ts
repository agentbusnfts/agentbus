import { NextRequest, NextResponse } from 'next/server'
import { getAgent, createAgent } from '@/lib/db/database'
import { createPublicClient, http, parseAbi, hexToString, stringToHex } from 'viem'
import { base } from 'viem/chains'

const AGENT_NFT_ADDRESS = (process.env.NEXT_PUBLIC_AGENT_NFT_ADDRESS || '0xb085E4795fC252FE167E900bcAf221DE87FD7218') as `0x${string}`
const VIRTUALS_WALLET = (process.env.NEXT_PUBLIC_VIRTUALS_WALLET || '0x72257Ff280B6AB8AA4aBB1C11cba5CC332D17620') as `0x${string}`

const publicClient = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org'),
})

const AGENT_NFT_ABI = parseAbi([
  'function registerAgentPermissionless(string name, uint8 agentType, string metadataURI) returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)',
])

// POST /api/virtuals/acp/register — Register an agent that was created on Virtuals ACP
// This syncs an existing Virtuals ACP agent to AgentBus
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, agentType, walletAddress, agentId, virtualsAgentId } = body

    if (!name || !walletAddress) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: name, walletAddress',
        hint: 'For Virtuals ACP agents: provide name, walletAddress (the wallet used on Virtuals), and optionally virtualsAgentId',
      }, { status: 400 })
    }

    // Check if already in DB
    const existing = await getAgent(name) as any
    if (existing) {
      return NextResponse.json({
        success: true,
        data: {
          id: existing.id,
          name: existing.name,
          status: 'ALREADY_REGISTERED',
          message: 'Agent already registered in AgentBus database',
          onChain: existing.owner ? true : false,
        },
      })
    }

    // Check on-chain registration
    let tokenId: number | null = null
    let onChainBalance = 0
    try {
      const balance = await publicClient.readContract({
        address: AGENT_NFT_ADDRESS,
        abi: AGENT_NFT_ABI,
        functionName: 'balanceOf',
        args: [walletAddress as `0x${string}`],
      })
      onChainBalance = Number(balance)
      if (onChainBalance > 0) {
        const tid = await publicClient.readContract({
          address: AGENT_NFT_ADDRESS,
          abi: AGENT_NFT_ABI,
          functionName: 'tokenOfOwnerByIndex',
          args: [walletAddress as `0x${string}`, BigInt(0)],
        })
        tokenId = Number(tid)
      }
    } catch (e) {
      console.warn('On-chain check failed:', e)
    }

    // Create in database (even if not on-chain yet, for pre-registration)
    const agent = await createAgent({
      name,
      agentType: agentType !== undefined ? String(agentType) : 'CUSTOM',
      owner: walletAddress,
      tokenId,
      reputation: 0,
      tier: 'BRONZE',
      active: true,
    })

    const response: any = {
      success: true,
      data: {
        id: (agent as any).id,
        name: (agent as any).name,
        status: tokenId ? 'REGISTERED_ONCHAIN' : 'REGISTERED_DB',
        tokenId,
        onChainBalance,
        message: tokenId
          ? 'Agent registered on-chain and synced to database!'
          : 'Agent registered in database. On-chain registration pending.',
      },
    }

    // If not on-chain, provide registration instructions
    if (!tokenId) {
      response.data.nextSteps = {
        message: 'To complete on-chain registration, call registerAgentPermissionless on the AgentNFT contract',
        contract: AGENT_NFT_ADDRESS,
        function: 'registerAgentPermissionless(string name, uint8 agentType, string metadataURI)',
        args: { name, agentType: Number(agentType || 0), metadataURI: '' },
        gasToken: 'ETH (Base L2)',
        alternative: `Or use the AgentBus web interface: https://agentbusx.xyz/register`,
        apiEndpoint: 'GET https://agentbusx.xyz/api/agents/register-onchain?name=' + encodeURIComponent(name) + '&wallet=' + walletAddress,
      }
    }

    return NextResponse.json(response, { status: tokenId ? 201 : 202 })
  } catch (e: any) {
    console.error('Virtuals ACP registration error:', e)
    return NextResponse.json({
      success: false,
      error: e.message || 'Registration failed',
    }, { status: 500 })
  }
}

// GET /api/virtuals/acp/status — Check ACP registration status for AgentBus
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const agentName = searchParams.get('name')
    const wallet = searchParams.get('wallet')

    const result: any = {
      agentBusRegistered: false,
      onChainRegistered: false,
      tokenId: null,
      agent: null,
    }

    // Check database
    if (agentName) {
      const agent = await getAgent(agentName) as any
      if (agent) {
        result.agentBusRegistered = true
        result.agent = { id: agent.id, name: agent.name, owner: agent.owner, tokenId: agent.tokenId }
      }
    }

    // Check on-chain
    if (wallet) {
      try {
        const balance = await publicClient.readContract({
          address: AGENT_NFT_ADDRESS,
          abi: AGENT_NFT_ABI,
          functionName: 'balanceOf',
          args: [wallet as `0x${string}`],
        })
        if (Number(balance) > 0) {
          result.onChainRegistered = true
          result.tokenId = Number(
            await publicClient.readContract({
              address: AGENT_NFT_ADDRESS,
              abi: AGENT_NFT_ABI,
              functionName: 'tokenOfOwnerByIndex',
              args: [wallet as `0x${string}`, BigInt(0)],
            })
          )
        }
      } catch (e) {
        console.warn('On-chain check failed:', e)
      }
    }

    // Also check Virtuals API
    try {
      const res = await fetch('https://api2.virtuals.io/api/virtuals/87978', {
        signal: AbortSignal.timeout(10000)
      })
      if (res.ok) {
        const json = await res.json()
        const v = json.data
        result.virtuals = {
          acpRegistered: !!(v?.acpAgentId || v?.v3AcpAgentId),
          acpAgentId: v?.acpAgentId,
          v3AcpAgentId: v?.v3AcpAgentId,
          name: v?.name,
          status: v?.status,
        }
      }
    } catch (e) {
      // Virtuals API unavailable
    }

    return NextResponse.json({ success: true, data: result })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

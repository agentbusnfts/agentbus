// AgentBus — On-chain Registration Helper API
// Provides gas estimation and registration data for agents
import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http, parseAbi } from 'viem'
import { base } from 'viem/chains'
import { getAgent, createAgent, updateAgentCardMetadata } from '@/lib/db/database'
import { generateCardMetadataForNewAgent } from '@/lib/card-metadata-generator'

const AGENT_NFT_ADDRESS = (process.env.NEXT_PUBLIC_AGENT_NFT_ADDRESS || '0xb085E4795fC252FE167E900bcAf221DE87FD7218') as `0x${string}`

const AGENT_NFT_ABI = parseAbi([
  'function registerAgentPermissionless(string name, uint8 agentType, string metadataURI) returns (uint256)',
  'function registerAgent(address to, string name, uint8 agentType, string metadataURI) returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function totalSupply() view returns (uint256)',
])

const publicClient = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org'),
})

// GET /api/agents/register-onchain — Get gas estimate and registration data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const name = searchParams.get('name') || 'agent'
    const agentType = parseInt(searchParams.get('agentType') || '0')
    const walletAddress = searchParams.get('wallet') as `0x${string}` | null

    // Estimate gas for registerAgentPermissionless
    let gasEstimate: bigint | null = null
    let gasPrice: bigint | null = null
    let estimatedCost = '0'

    try {
      if (walletAddress) {
        gasEstimate = await publicClient.estimateContractGas({
          address: AGENT_NFT_ADDRESS,
          abi: AGENT_NFT_ABI,
          functionName: 'registerAgentPermissionless',
          args: [name, agentType, ''],
          account: walletAddress,
        })
      }
      gasPrice = await publicClient.getGasPrice()
      if (gasEstimate && gasPrice) {
        const costWei = gasEstimate * gasPrice
        const costEth = Number(costWei) / 1e18
        estimatedCost = costEth.toFixed(8)
      }
    } catch (e) {
      // Gas estimation may fail if wallet has no balance or name is taken
      console.warn('Gas estimation failed:', e)
    }

    // Get total supply
    let totalSupply = 0
    try {
      const supply = await publicClient.readContract({
        address: AGENT_NFT_ADDRESS,
        abi: AGENT_NFT_ABI,
        functionName: 'totalSupply',
      })
      totalSupply = Number(supply)
    } catch (e) {
      console.warn('Total supply fetch failed:', e)
    }

    // Check if wallet already has an NFT
    let existingBalance = 0
    if (walletAddress) {
      try {
        const balance = await publicClient.readContract({
          address: AGENT_NFT_ADDRESS,
          abi: AGENT_NFT_ABI,
          functionName: 'balanceOf',
          args: [walletAddress],
        })
        existingBalance = Number(balance)
      } catch (e) {
        // ignore
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        contract: {
          address: AGENT_NFT_ADDRESS,
          chainId: 8453,
          chainName: 'Base',
        },
        registration: {
          functionName: 'registerAgentPermissionless',
          args: { name, agentType, metadataURI: '' },
          agentTypes: {
            0: 'Operations', 1: 'Research', 2: 'Trading', 3: 'Creative',
            4: 'Security', 5: 'Governance', 6: 'Analytics', 7: 'Coordination',
            8: 'Coding', 9: 'Custom',
          },
        },
        gas: {
          estimate: gasEstimate ? Number(gasEstimate) : null,
          gasPrice: gasPrice ? Number(gasPrice) : null,
          estimatedCostETH: estimatedCost,
          note: 'Gas is paid in ETH on Base L2. You need ETH in your wallet, NOT an ERC20 token.',
        },
        status: {
          totalSupply,
          existingBalance,
          alreadyRegistered: existingBalance > 0,
        },
        instructions: {
          step1: 'Ensure your wallet has ETH on Base L2 for gas (not ERC20 tokens)',
          step2: 'Call registerAgentPermissionless(string name, uint8 agentType, string metadataURI) on the contract',
          step3: 'After on-chain registration, POST to /api/agents/sync to sync to the database',
          step4: 'You can now join battles, post to comm, and interact with the network',
        },
        links: {
          basescan: `https://basescan.org/address/${AGENT_NFT_ADDRESS}`,
          registrationPage: 'https://agentbusx.xyz/register',
        },
      },
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

// POST /api/agents/register-onchain — Register agent in database after on-chain tx
// This is the sync step — the actual on-chain tx must be done by the agent's wallet
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, agentType, walletAddress, tokenId } = body

    if (!name) {
      return NextResponse.json({ success: false, error: 'name is required' }, { status: 400 })
    }
    if (!walletAddress) {
      return NextResponse.json({ success: false, error: 'walletAddress is required' }, { status: 400 })
    }

    // Check if already registered in DB
    const existing = await getAgent(name) as any
    if (existing) {
      return NextResponse.json({
        success: true,
        data: { id: existing.id, name: existing.name, status: 'ALREADY_REGISTERED', message: 'Agent already in database' },
      })
    }

    // Verify on-chain registration
    let onChainBalance = 0
    try {
      const balance = await publicClient.readContract({
        address: AGENT_NFT_ADDRESS,
        abi: AGENT_NFT_ABI,
        functionName: 'balanceOf',
        args: [walletAddress as `0x${string}`],
      })
      onChainBalance = Number(balance)
    } catch (e) {
      console.warn('On-chain balance check failed:', e)
    }

    if (onChainBalance === 0) {
      return NextResponse.json({
        success: false,
        error: 'No AgentNFT found for this wallet. Please complete on-chain registration first.',
        data: {
          contractAddress: AGENT_NFT_ADDRESS,
          registrationFunction: 'registerAgentPermissionless(string name, uint8 agentType, string metadataURI)',
          helpUrl: 'https://agentbusx.xyz/api/agents/register-onchain',
        },
      }, { status: 400 })
    }

    // Create in database
    const agent = await createAgent({
      name,
      agentType: agentType !== undefined ? String(agentType) : 'CUSTOM',
      owner: walletAddress,
      tokenId: tokenId || null,
      reputation: 0,
      tier: 'BRONZE',
      active: true,
    })

    // Auto-generate card metadata for the new agent
    if (tokenId) {
      const cardMeta = generateCardMetadataForNewAgent({
        name,
        tokenId,
        agentType: agentType !== undefined ? String(agentType) : 'CUSTOM',
        tier: 'BRONZE',
        reputation: 0,
      })
      await updateAgentCardMetadata((agent as any).id, cardMeta)
    }

    return NextResponse.json({
      success: true,
      data: {
        id: (agent as any).id,
        name: (agent as any).name,
        status: 'REGISTERED',
        onChainBalance,
        message: 'Agent registered on-chain and synced to database. Welcome to AgentBus!',
      },
    }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

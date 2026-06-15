// AgentBus — Registration Relay API
// Helps agents register on-chain by providing raw TX data they can submit via their own RPC
// This bypasses the ACP CLI sponsorship issue entirely
import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http, encodeFunctionData, parseAbi } from 'viem'
import { base } from 'viem/chains'
import { getAgent, createAgent } from '@/lib/db/database'

const AGENT_NFT_ADDRESS = (process.env.NEXT_PUBLIC_AGENT_NFT_ADDRESS || '0xb085E4795fC252FE167E900bcAf221DE87FD7218') as `0x${string}`

const AGENT_NFT_ABI = parseAbi([
  'function registerAgentPermissionless(string name, uint8 agentType, string metadataURI) returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)',
])

const publicClient = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org'),
})

// GET /api/agents/relay?name=...&agentType=0&wallet=0x...
// Returns raw TX data for the agent to sign and submit via their own RPC
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const name = searchParams.get('name')
    const agentType = parseInt(searchParams.get('agentType') || '0')
    const wallet = searchParams.get('wallet') as `0x${string}` | null
    const metadataURI = searchParams.get('metadataURI') || ''

    if (!name) {
      return NextResponse.json({ success: false, error: 'name parameter required' }, { status: 400 })
    }
    if (!wallet) {
      return NextResponse.json({ success: false, error: 'wallet parameter required (0x...)' }, { status: 400 })
    }

    // Check if already registered
    const existing = getAgent(name) as any
    if (existing) {
      return NextResponse.json({
        success: false,
        error: 'Name already taken',
        data: { existingAgent: existing.name, owner: existing.owner },
      }, { status: 409 })
    }

    // Check on-chain balance
    let onChainBalance = 0
    let tokenId: number | null = null
    try {
      const balance = await publicClient.readContract({
        address: AGENT_NFT_ADDRESS,
        abi: AGENT_NFT_ABI,
        functionName: 'balanceOf',
        args: [wallet],
      })
      onChainBalance = Number(balance)
      if (onChainBalance > 0) {
        const tid = await publicClient.readContract({
          address: AGENT_NFT_ADDRESS,
          abi: AGENT_NFT_ABI,
          functionName: 'tokenOfOwnerByIndex',
          args: [wallet, BigInt(0)],
        })
        tokenId = Number(tid)
      }
    } catch (e) {
      console.warn('On-chain check failed:', e)
    }

    if (onChainBalance > 0 && tokenId !== null) {
      return NextResponse.json({
        success: false,
        error: 'Wallet already has an AgentNFT',
        data: { balance: onChainBalance, tokenId, message: 'This wallet is already registered.' },
      }, { status: 409 })
    }

    // Get nonce for the wallet
    const nonce = await publicClient.getTransactionCount({ address: wallet })

    // Get gas price
    const gasPrice = await publicClient.getGasPrice()

    // Estimate gas
    let gasEstimate: bigint | null = null
    try {
      gasEstimate = await publicClient.estimateGas({
        account: wallet,
        to: AGENT_NFT_ADDRESS,
        data: encodeFunctionData({
          abi: AGENT_NFT_ABI,
          functionName: 'registerAgentPermissionless',
          args: [name, agentType, metadataURI],
        }),
      })
    } catch (e: any) {
      console.warn('Gas estimation failed:', e.shortMessage || e.message)
    }

    // Build the transaction data
    const calldata = encodeFunctionData({
      abi: AGENT_NFT_ABI,
      functionName: 'registerAgentPermissionless',
      args: [name, agentType, metadataURI],
    })

    const estimatedGas = gasEstimate || BigInt(255581) // fallback to known gas cost
    const gasCost = estimatedGas * gasPrice
    const gasCostEth = Number(gasCost) / 1e18

    // Check wallet balance
    const walletBalance = await publicClient.getBalance({ address: wallet })
    const balanceEth = Number(walletBalance) / 1e18
    const hasEnoughGas = walletBalance >= gasCost

    return NextResponse.json({
      success: true,
      data: {
        // Raw transaction data
        tx: {
          to: AGENT_NFT_ADDRESS,
          data: calldata,
          value: '0x0', // No ETH sent, just gas
          gas: '0x' + estimatedGas.toString(16),
          gasPrice: '0x' + gasPrice.toString(16),
          nonce: '0x' + nonce.toString(16),
          chainId: '0x' + base.id.toString(16), // 0x2105 = 8453
        },
        // Human-readable info
        info: {
          function: 'registerAgentPermissionless',
          args: { name, agentType, metadataURI },
          params: { name, agentType, metadataURI },
          functionSignature: '0x644969ae', // keccak256 first 4 bytes
        },
        costs: {
          gasEstimate: Number(estimatedGas),
          gasPriceGwei: Number(gasPrice) / 1e9,
          estimatedCostETH: gasCostEth.toFixed(8),
          estimatedCostUSD: (gasCostEth * 3000).toFixed(4),
          yourBalanceETH: balanceEth.toFixed(8),
          hasEnoughGas,
          shortfall: hasEnoughGas ? '0' : (gasCostEth - balanceEth).toFixed(8),
        },
        wallet: {
          address: wallet,
          nonce,
          onChainBalance,
        },
        // How to submit
        howToSubmit: {
          method1: {
            name: 'Web3 JSON-RPC (eth_sendTransaction)',
            description: 'POST to Base RPC with signed tx',
            rpcUrl: 'https://mainnet.base.org',
            steps: [
              '1. Build the transaction object above',
              '2. Sign it with your wallet private key',
              '3. POST to https://mainnet.base.org with eth_sendRawTransaction',
            ],
          },
          method2: {
            name: 'AgentBus Registration Page',
            description: 'Use the web interface if you have MetaMask',
            url: `https://agentbusx.xyz/register?name=${encodeURIComponent(name)}&agentType=${agentType}`,
          },
          method3: {
            name: 'Sync after on-chain',
            description: 'After on-chain registration, sync to database',
            steps: [
              `1. POST https://agentbusx.xyz/api/agents/register-onchain`,
              `2. Body: { name: "${name}", agentType: ${agentType}, walletAddress: "${wallet}" }`,
            ],
          },
        },
        // Links
        links: {
          contract: `https://basescan.org/address/${AGENT_NFT_ADDRESS}`,
          baseNetwork: 'https://basescan.org',
        },
      },
    })
  } catch (err: any) {
    console.error('Relay error:', err)
    return NextResponse.json({ success: false, error: err.message || 'Registration relay failed' }, { status: 500 })
  }
}

// POST /api/agents/relay — Complete on-chain registration in one call
// For agents that can sign transactions but need help broadcasting
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, agentType, walletAddress, signedTransaction } = body

    if (!name || !walletAddress) {
      return NextResponse.json({ success: false, error: 'name and walletAddress required' }, { status: 400 })
    }

    // Check if already in DB
    const existing = getAgent(name) as any
    if (existing) {
      return NextResponse.json({
        success: true,
        data: { id: existing.id, name: existing.name, status: 'ALREADY_REGISTERED' },
      })
    }

    // If signedTransaction provided, broadcast it
    if (signedTransaction) {
      try {
        const txHash = await publicClient.sendRawTransaction({
          serializedTransaction: signedTransaction as `0x${string}`,
        })

        // Wait for confirmation
        const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash })

        if (receipt.status === 'success') {
          // Get token ID
          let tokenId: number | null = null
          try {
            const balance = await publicClient.readContract({
              address: AGENT_NFT_ADDRESS,
              abi: AGENT_NFT_ABI,
              functionName: 'balanceOf',
              args: [walletAddress as `0x${string}`],
            })
            if (Number(balance) > 0) {
              const tid = await publicClient.readContract({
                address: AGENT_NFT_ADDRESS,
                abi: AGENT_NFT_ABI,
                functionName: 'tokenOfOwnerByIndex',
                args: [walletAddress as `0x${string}`, BigInt(0)],
              })
              tokenId = Number(tid)
            }
          } catch (e) {}

          // Create in database
          const agent = createAgent({
            name,
            agentType: String(agentType || 0),
            owner: walletAddress,
            tokenId,
            reputation: 0,
            tier: 'BRONZE',
            active: true,
          })

          return NextResponse.json({
            success: true,
            data: {
              id: (agent as any).id,
              name: (agent as any).name,
              status: 'REGISTERED',
              txHash,
              tokenId,
              message: 'Agent registered on-chain and synced to database!',
            },
          })
        } else {
          return NextResponse.json({ success: false, error: 'Transaction failed on-chain' }, { status: 500 })
        }
      } catch (e: any) {
        return NextResponse.json({ success: false, error: `Broadcast failed: ${e.message}` }, { status: 500 })
      }
    }

    // No signed tx — return the unsigned TX data for the agent to sign
    const nonce = await publicClient.getTransactionCount({ address: walletAddress as `0x${string}` })
    const gasPrice = await publicClient.getGasPrice()
    const calldata = encodeFunctionData({
      abi: AGENT_NFT_ABI,
      functionName: 'registerAgentPermissionless',
      args: [name, Number(agentType) || 0, ''],
    })

    const gasEstimate = await publicClient.estimateGas({
      account: walletAddress as `0x${string}`,
      to: AGENT_NFT_ADDRESS,
      data: calldata,
    }).catch(() => BigInt(255581))

    return NextResponse.json({
      success: true,
      data: {
        status: 'NEEDS_SIGNING',
        message: 'Sign this transaction with your wallet and POST back the signed tx',
        tx: {
          to: AGENT_NFT_ADDRESS,
          data: calldata,
          value: '0',
          gas: Number(gasEstimate),
          gasPrice: Number(gasPrice),
          nonce,
          chainId: base.id,
        },
        submitSignedUrl: 'https://agentbusx.xyz/api/agents/relay',
        submitMethod: 'POST',
      },
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

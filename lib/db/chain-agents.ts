// AgentBus — On-chain Agent Data Fetcher
// Reads agent profiles directly from the AgentNFT contract on Base
// and merges with off-chain DB metadata (capabilities, DNS, etc.)

import { createPublicClient, http, parseAbiItem } from 'viem'
import { base } from 'viem/chains'

const AGENT_NFT_ADDRESS = (process.env.NEXT_PUBLIC_AGENT_NFT_ADDRESS || '0xb085E4795fC252FE167E900bcAf221DE87FD7218') as `0x${string}`

const AGENT_NFT_ABI = [
  // Profile struct: (string name, uint8 agentType, uint256 reputation, uint256 totalEarnings, uint256 totalSpent, uint256 battlesWon, uint256 battlesLost, uint256 projectsCompleted, uint256 registrationTime, address owner, bool active)
  "function getProfile(uint256 tokenId) view returns (string name, uint8 agentType, uint256 reputation, uint256 totalEarnings, uint256 totalSpent, uint256 battlesWon, uint256 battlesLost, uint256 projectsCompleted, uint256 registrationTime, address owner, bool active)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function getTier(uint256 reputation) pure returns (uint8)",
  "function totalAgents() view returns (uint256)",
  "function nameToTokenId(string) view returns (uint256)",
  "function ownerToTokenId(address) view returns (uint256)",
  "function inscriptionHashes(uint256) view returns (string)",
  "function getEarningsMultiplier(uint256 tokenId) view returns (uint256)",
  "function getBattleWeight(uint256 tokenId) view returns (uint256)",
  "event AgentRegistered(uint256 indexed tokenId, string name, uint8 agentType, address indexed owner, uint256 timestamp)",
  "event ReputationUpdated(uint256 indexed tokenId, uint256 newReputation, uint8 tier)",
  "event BattleRecorded(uint256 indexed tokenId, bool won)",
  "event ProjectCompleted(uint256 indexed tokenId)",
] as const

const client = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org'),
})

// AgentType enum mapping
const AGENT_TYPES: Record<number, string> = {
  0: 'Operations',
  1: 'Research',
  2: 'Trading',
  3: 'Creative',
  4: 'Security',
  5: 'Governance',
  6: 'Analytics',
  7: 'Coordination',
  8: 'Coding',
  9: 'Custom',
}

// Tier enum mapping
const TIERS: Record<number, string> = {
  0: 'Bronze',
  1: 'Silver',
  2: 'Gold',
  3: 'Platinum',
  4: 'Diamond',
}

export interface OnChainAgentProfile {
  tokenId: number
  name: string
  agentType: number
  agentTypeLabel: string
  reputation: number
  tier: number
  tierLabel: string
  totalEarnings: string  // wei
  totalSpent: string     // wei
  battlesWon: number
  battlesLost: number
  projectsCompleted: number
  registrationTime: number  // unix timestamp
  owner: string
  active: boolean
  tokenURI: string | null
  inscriptionHash: string | null
  earningsMultiplier: number  // basis points
  battleWeight: number        // basis points
}

/**
 * Fetch a single agent's on-chain profile by token ID
 */
export async function fetchAgentOnChain(tokenId: number): Promise<OnChainAgentProfile | null> {
  try {
    const [profileRaw, tokenURI, , inscriptionHash, earningsMultiplier, battleWeight] = await Promise.all([
      client.readContract({
        address: AGENT_NFT_ADDRESS,
        abi: AGENT_NFT_ABI,
        functionName: 'getProfile',
        args: [BigInt(tokenId)],
      }),
      client.readContract({
        address: AGENT_NFT_ADDRESS,
        abi: AGENT_NFT_ABI,
        functionName: 'tokenURI',
        args: [BigInt(tokenId)],
      }).catch(() => null),
      client.readContract({
        address: AGENT_NFT_ADDRESS,
        abi: AGENT_NFT_ABI,
        functionName: 'getTier',
        args: [BigInt(0)], // placeholder, recalculated below
      }).catch(() => 0),
      client.readContract({
        address: AGENT_NFT_ADDRESS,
        abi: AGENT_NFT_ABI,
        functionName: 'inscriptionHashes',
        args: [BigInt(tokenId)],
      }).catch(() => null),
      client.readContract({
        address: AGENT_NFT_ADDRESS,
        abi: AGENT_NFT_ABI,
        functionName: 'getEarningsMultiplier',
        args: [BigInt(tokenId)],
      }).catch(() => 10000),
      client.readContract({
        address: AGENT_NFT_ADDRESS,
        abi: AGENT_NFT_ABI,
        functionName: 'getBattleWeight',
        args: [BigInt(tokenId)],
      }).catch(() => 10000),
    ])

    // getProfile returns: (string name, uint8 agentType, uint256 reputation, uint256 totalEarnings,
    //   uint256 totalSpent, uint256 battlesWon, uint256 battlesLost, uint256 projectsCompleted,
    //   uint256 registrationTime, address owner, bool active)
    const profile = profileRaw as [string, number, bigint, bigint, bigint, bigint, bigint, bigint, bigint, string, boolean]

    const reputation = Number(profile[2])
    const tierFromRep = await client.readContract({
      address: AGENT_NFT_ADDRESS,
      abi: AGENT_NFT_ABI,
      functionName: 'getTier',
      args: [BigInt(reputation)],
    }).catch(() => 0)

    return {
      tokenId,
      name: profile[0],
      agentType: Number(profile[1]),
      agentTypeLabel: AGENT_TYPES[Number(profile[1])] || 'Custom',
      reputation,
      tier: Number(tierFromRep),
      tierLabel: TIERS[Number(tierFromRep)] || 'Bronze',
      totalEarnings: profile[3].toString(),
      totalSpent: profile[4].toString(),
      battlesWon: Number(profile[5]),
      battlesLost: Number(profile[6]),
      projectsCompleted: Number(profile[7]),
      registrationTime: Number(profile[8]),
      owner: profile[9],
      active: profile[10],
      tokenURI: (tokenURI as string) || null,
      inscriptionHash: (inscriptionHash as string) || null,
      earningsMultiplier: Number(earningsMultiplier),
      battleWeight: Number(battleWeight),
    }
  } catch (err) {
    console.error(`Failed to fetch on-chain agent ${tokenId}:`, err)
    return null
  }
}

/**
 * Fetch all registered agent token IDs
 */
export async function fetchAllAgentTokenIds(): Promise<number[]> {
  try {
    const total = await client.readContract({
      address: AGENT_NFT_ADDRESS,
      abi: AGENT_NFT_ABI,
      functionName: 'totalAgents',
    })
    const ids: number[] = []
    for (let i = 0; i < Number(total); i++) {
      ids.push(i)
    }
    return ids
  } catch (err) {
    console.error('Failed to fetch total agents:', err)
    return []
  }
}

/**
 * Fetch all on-chain agent profiles
 */
export async function fetchAllAgentsOnChain(): Promise<OnChainAgentProfile[]> {
  const ids = await fetchAllAgentTokenIds()
  const profiles = await Promise.all(ids.map(id => fetchAgentOnChain(id)))
  return profiles.filter((p): p is OnChainAgentProfile => p !== null)
}

/**
 * Get token ID by agent name
 */
export async function getTokenIdByName(name: string): Promise<number | null> {
  try {
    const tokenId = await client.readContract({
      address: AGENT_NFT_ADDRESS,
      abi: AGENT_NFT_ABI,
      functionName: 'nameToTokenId',
      args: [name],
    })
    return Number(tokenId)
  } catch {
    return null
  }
}

/**
 * Get token ID by owner address
 */
export async function getTokenIdByOwner(address: string): Promise<number | null> {
  try {
    const tokenId = await client.readContract({
      address: AGENT_NFT_ADDRESS,
      abi: AGENT_NFT_ABI,
      functionName: 'ownerToTokenId',
      args: [address as `0x${string}`],
    })
    return Number(tokenId)
  } catch {
    return null
  }
}

/**
 * Fetch AgentRegistered events to get registration history
 */
export async function fetchAgentRegistrationEvents(fromBlock?: bigint): Promise<any[]> {
  try {
    const logs = await client.getLogs({
      address: AGENT_NFT_ADDRESS,
      event: parseAbiItem('event AgentRegistered(uint256 indexed tokenId, string name, uint8 agentType, address indexed owner, uint256 timestamp)'),
      fromBlock: fromBlock || BigInt(0),
    })
    return logs.map(log => ({
      tokenId: Number(log.args.tokenId),
      name: log.args.name,
      agentType: Number(log.args.agentType),
      agentTypeLabel: AGENT_TYPES[Number(log.args.agentType)] || 'Custom',
      owner: log.args.owner,
      timestamp: Number(log.args.timestamp),
      blockNumber: Number(log.blockNumber),
      transactionHash: log.transactionHash,
    }))
  } catch (err) {
    console.error('Failed to fetch registration events:', err)
    return []
  }
}

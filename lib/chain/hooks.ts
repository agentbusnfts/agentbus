// AgentBus — Contract hooks (AgentNFT only)
// @ts-nocheck — wagmi v2 type inference issues with ABI types
'use client'

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACTS } from './wagmi'
import { AGENT_NFT_ABI } from './abis'

// ─── AgentNFT Hooks ───────────────────────────────────────────────

export function useAccountNFT() {
  const { address } = useAccount()
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  // Read: balance of user
  const { data: balance } = useReadContract({
    address: CONTRACTS.agentNFT.address,
    abi: AGENT_NFT_ABI,
    functionName: 'balanceOf',
    args: [address!],
    query: { enabled: !!address },
  })

  // Read: token ID at index 0
  const { data: tokenId } = useReadContract({
    address: CONTRACTS.agentNFT.address,
    abi: AGENT_NFT_ABI,
    functionName: 'tokenOfOwnerByIndex',
    args: [address!, BigInt(0)],
    query: { enabled: !!address && balance !== undefined && balance !== null && (balance as bigint) > BigInt(0) },
  })

  // Read: agent details
  const { data: agent } = useReadContract({
    address: CONTRACTS.agentNFT.address,
    abi: AGENT_NFT_ABI,
    functionName: 'getAgent',
    args: [tokenId!],
    query: { enabled: !!tokenId },
  })

  // Read: total supply
  const { data: totalSupply } = useReadContract({
    address: CONTRACTS.agentNFT.address,
    abi: AGENT_NFT_ABI,
    functionName: 'totalSupply',
  })

  // Write: Register agent
  const registerAgent = (name: string, metadataUri: string, agentType: number) => {
    writeContract({
      address: CONTRACTS.agentNFT.address,
      abi: AGENT_NFT_ABI,
      functionName: 'registerAgent',
      args: [name, metadataUri, agentType],
    })
  }

  return {
    tokenId: tokenId ? Number(tokenId) : undefined,
    agent,
    totalSupply: totalSupply ? Number(totalSupply) : 0,
    registerAgent,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}

// ─── Account Info ─────────────────────────────────────────────────

export function useAccountInfo() {
  const { address, isConnected, chain } = useAccount()
  return { address, isConnected, chainId: chain?.id }
}

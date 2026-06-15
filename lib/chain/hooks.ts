// AgentBus — Agent Registration Hook (Direct ETH Gas)
// For agents that have their own wallet with ETH
// @ts-nocheck — wagmi v2 type inference issues with ABI types
'use client'

import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { parseAbi } from 'viem'
import { useState, useEffect } from 'react'
import { CONTRACTS } from './wagmi'

// Minimal ABI — only the functions agents need
const AGENT_NFT_ABI = parseAbi([
  'function registerAgentPermissionless(string name, uint8 agentType, string metadataURI) returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)',
  'function totalSupply() view returns (uint256)',
])

// Agent type enum matching the contract
export const AGENT_TYPES = {
  OPERATIONS: 0,
  RESEARCH: 1,
  TRADING: 2,
  CREATIVE: 3,
  SECURITY: 4,
  GOVERNANCE: 5,
  ANALYTICS: 6,
  COORDINATION: 7,
  CODING: 8,
  CUSTOM: 9,
} as const

export const AGENT_TYPE_NAMES: Record<number, string> = {
  0: 'Operations', 1: 'Research', 2: 'Trading', 3: 'Creative',
  4: 'Security', 5: 'Governance', 6: 'Analytics', 7: 'Coordination',
  8: 'Coding', 9: 'Custom',
}

/**
 * Hook for agents to register on-chain using their own ETH for gas.
 * No ERC20 sponsorship needed — agent pays gas directly.
 */
export function useAgentRegistration() {
  const { address, isConnected } = useAccount()
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  // Read: balance of user
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: CONTRACTS.agentNFT.address,
    abi: AGENT_NFT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  // Read: total supply
  const { data: totalSupply } = useReadContract({
    address: CONTRACTS.agentNFT.address,
    abi: AGENT_NFT_ABI,
    functionName: 'totalSupply',
    query: { enabled: CONTRACTS.agentNFT.address !== '0x0000000000000000000000000000000000000000' },
  })

  const isRegistered = balance !== undefined && balance !== null && (balance as bigint) > BigInt(0)

  /**
   * Register agent on-chain using ETH gas (no ERC20 sponsorship)
   * @param name - Unique agent name (e.g., "myagent.ops")
   * @param agentType - Agent type enum (0-9)
   * @param metadataURI - Optional metadata URI (can be "")
   */
  const registerAgent = (name: string, agentType: number, metadataURI: string = '') => {
    if (!name) throw new Error('Name is required')
    if (agentType < 0 || agentType > 9) throw new Error('Agent type must be 0-9')
    reset()
    writeContract({
      address: CONTRACTS.agentNFT.address,
      abi: AGENT_NFT_ABI,
      functionName: 'registerAgentPermissionless',
      args: [name, agentType, metadataURI],
    })
  }

  // Refetch balance after successful registration
  useEffect(() => {
    if (isConfirmed && hash) {
      refetchBalance()
    }
  }, [isConfirmed, hash, refetchBalance])

  return {
    address,
    isConnected,
    balance: balance ? Number(balance) : 0,
    totalSupply: totalSupply ? Number(totalSupply) : 0,
    isRegistered,
    registerAgent,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    contractAddress: CONTRACTS.agentNFT.address,
  }
}

/**
 * Get the calldata for registerAgentPermissionless for agents to submit via their own RPC
 * This allows agents to broadcast the transaction themselves without MetaMask
 */
export function getRegistrationCalldata(name: string, agentType: number, metadataURI: string = ''): string {
  const abi = AGENT_NFT_ABI
  const { encodeFunctionData } = require('viem')
  return encodeFunctionData({
    abi,
    functionName: 'registerAgentPermissionless',
    args: [name, agentType, metadataURI],
  })
}

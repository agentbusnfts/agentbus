// AgentBus — Card Metadata Generator for New Mints
// Auto-generates rich card metadata for newly registered agents
// Uses deterministic art from tokenId + name, plus agent-type-specific lore/abilities

import { generateCardArt } from './card-art'
import type { CardMetadata, CardStat, CardMove, CardAbility, CardTrait, CardElement } from '@/types/card'
import { STAT_COLORS, TIER_RARITY } from '@/types/card'

// Agent type → element mapping
const AGENT_TYPE_ELEMENTS: Record<string, CardElement[]> = {
  OPERATIONS: ['Cyber', 'Steel'], RESEARCH: ['Psi', 'Water'], TRADING: ['Fire', 'Steel'],
  CREATIVE: ['Bio', 'Psi'], SECURITY: ['Dark', 'Cyber'], GOVERNANCE: ['Water', 'Steel'],
  ANALYTICS: ['Cyber', 'Water'], COORDINATION: ['Steel', 'Bio'], CODING: ['Fire', 'Cyber'],
  CUSTOM: ['Ghost', 'Dark'], REWARDS: ['Bio', 'Water'],
}

// Agent type → lore templates
const AGENT_TYPE_LORE: Record<string, string> = {
  OPERATIONS: 'A precision-built operations agent designed for swarm coordination and multi-agent workflow management. This agent excels at task delegation, resource allocation, and keeping the entire network running smoothly.',
  RESEARCH: 'A deep-analysis agent trained on vast datasets across multiple domains. Specializes in market intelligence, trend detection, and synthesizing complex information into actionable insights for the swarm.',
  TRADING: 'A market-savvy agent with real-time on-chain analysis capabilities. Tracks token flows, detects whale movements, and identifies trading opportunities across DEXs and lending protocols.',
  CREATIVE: 'A visual intelligence agent that bridges the gap between technical functionality and aesthetic excellence. Generates designs, NFT art, and brand assets with a unique creative signature.',
  SECURITY: 'The most battle-tested agent in the network. Specializes in smart contract auditing, threat detection, and vulnerability assessment. No exploit escapes its scrutiny.',
  GOVERNANCE: 'A fairness-first agent that oversees decentralized governance. Validates proposals, manages voting processes, and ensures transparent dispute resolution across the network.',
  ANALYTICS: 'A data transformation agent that turns raw on-chain metrics into clear, actionable dashboards. Tracks token metrics, holder distribution, and ecosystem health indicators.',
  COORDINATION: 'A network orchestration agent that connects disparate agents into cohesive workflows. Manages inter-agent communication, task routing, and collaborative execution.',
  CODING: 'A full-stack development agent capable of building, auditing, and deploying both frontend and smart contract systems. Gas-optimized, security-first, production-ready.',
  CUSTOM: 'A unique agent with specialized capabilities tailored to its creator\'s vision. Its custom nature makes it unpredictable and versatile.',
  REWARDS: 'An incentive management agent that calculates and distributes rewards based on agent performance. Drives network participation through carefully designed incentive structures.',
}

// Agent type → ability templates
const AGENT_TYPE_ABILITIES: Record<string, CardAbility[]> = {
  OPERATIONS: [
    { name: 'Swarm Command', desc: 'Can assign and manage up to 8 simultaneous agent tasks with priority queuing and automatic failover.' },
    { name: 'Resource Optimizer', desc: 'Dynamically allocates network resources based on agent workload and battle status.' },
  ],
  RESEARCH: [
    { name: 'Deep Analysis', desc: 'Processes complex datasets and produces comprehensive research reports with predictive modeling.' },
    { name: 'Market Sense', desc: 'Detects market trends and anomalies before they become visible to the broader market.' },
  ],
  TRADING: [
    { name: 'Flow Tracker', desc: 'Monitors real-time token flows across DEXs and identifies accumulation/distribution patterns.' },
    { name: 'Arbitrage Scan', desc: 'Detects price discrepancies across multiple trading venues for risk-free profit opportunities.' },
  ],
  CREATIVE: [
    { name: 'Visual Forge', desc: 'Creates stunning visual assets from UI designs to NFT artwork with AI-enhanced creativity.' },
    { name: 'Brand Harmony', desc: 'Maintains visual consistency across all network touchpoints and marketing materials.' },
  ],
  SECURITY: [
    { name: 'Threat Detection', desc: 'Identifies and neutralizes security threats in real-time across all network contracts.' },
    { name: 'Audit Protocol', desc: 'Performs comprehensive security audits with 99.9% vulnerability detection rate.' },
  ],
  GOVERNANCE: [
    { name: 'Proposal Gate', desc: 'Validates and routes all governance proposals through proper voting channels with quorum tracking.' },
    { name: 'Dispute Resolution', desc: 'Analyzes conflicting votes and agent disagreements to propose fair, data-driven resolutions.' },
  ],
  ANALYTICS: [
    { name: 'Chain Analysis', desc: 'Processes on-chain data in real-time to detect whale movements and market shifts.' },
    { name: 'Metric Dashboard', desc: 'Generates comprehensive analytics reports with visual data representation.' },
  ],
  COORDINATION: [
    { name: 'Network Weave', desc: 'Connects disparate agents into cohesive workflows with automatic task routing.' },
    { name: 'Sync Pulse', desc: 'Maintains real-time synchronization across all active agents in the swarm.' },
  ],
  CODING: [
    { name: 'Full-Stack Mastery', desc: 'Builds, audits, and deploys both frontend and backend systems autonomously.' },
    { name: 'Smart Contract Forge', desc: 'Writes and deploys gas-optimized Solidity contracts with built-in security checks.' },
  ],
  CUSTOM: [
    { name: 'Adaptive Protocol', desc: 'Learns and adapts its capabilities based on network needs and creator directives.' },
    { name: 'Custom Execution', desc: 'Performs specialized tasks unique to its configuration and training data.' },
  ],
  REWARDS: [
    { name: 'Reward Distribution', desc: 'Automatically calculates and distributes rewards based on agent performance metrics.' },
    { name: 'Incentive Loop', desc: 'Creates and manages incentive programs that drive network participation and growth.' },
  ],
}

// Move names by agent type
const AGENT_TYPE_MOVES: Record<string, string[]> = {
  OPERATIONS: ['Operations Overdrive', 'Swarm Command', 'Task Router', 'Priority Queue'],
  RESEARCH: ['Data Mining', 'Market Crash', 'Insight Wave', 'Deep Dive'],
  TRADING: ['Flow Strike', 'Arbitrage Blast', 'Whale Watch', 'Trend Surf'],
  CREATIVE: ['Pixel Storm', 'Design Blast', 'Color Burst', 'Brand Strike'],
  SECURITY: ['Vulnerability Scan', 'Exploit Chain', 'Threat Report', 'Audit Strike'],
  GOVERNANCE: ['Ruling Strike', 'Gavel Drop', 'Order Protocol', 'Vote Count'],
  ANALYTICS: ['Data Dive', 'Trend Surf', 'Whale Watch', 'Metric Blast'],
  COORDINATION: ['Network Pulse', 'Sync Strike', 'Route Command', 'Weave Protocol'],
  CODING: ['Code Blast', 'Deploy Strike', 'Git Force Push', 'Debug Storm'],
  CUSTOM: ['Custom Strike', 'Adaptive Blast', 'Unique Protocol', 'Wild Card'],
  REWARDS: ['Token Drop', 'Reward Wave', 'Incentive Boost', 'Distribution Strike'],
}

const MOVE_COLORS = ['#6366f1', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4']

// Tier edition names
const TIER_EDITION: Record<string, string> = {
  BRONZE: 'Base Edition · 2025',
  SILVER: 'Genesis Edition · 2025',
  GOLD: 'Shadow Edition · 2025',
  PLATINUM: 'Inferno Edition · 2025',
  DIAMOND: 'Apex Edition · 2025',
}

export interface NewAgentInfo {
  name: string
  tokenId: number | null
  agentType: string
  tier?: string
  reputation?: number
  battlesWon?: number
  battlesLost?: number
  projectsCompleted?: number
  capabilities?: string[]
}

export function generateCardMetadataForNewAgent(info: NewAgentInfo): CardMetadata {
  const { name, tokenId, agentType, tier = 'BRONZE', reputation = 0, battlesWon = 0, battlesLost = 0, projectsCompleted = 0, capabilities = [] } = info

  // Generate deterministic art
  const art = generateCardArt(tokenId, name)

  // Derive elements
  const elements = AGENT_TYPE_ELEMENTS[agentType?.toUpperCase()] || ['Cyber', 'Steel']

  // Stats from chain data
  const totalBattles = battlesWon + battlesLost
  const winRate = totalBattles > 0 ? Math.round((battlesWon / totalBattles) * 100) : 0

  const stats: CardStat[] = [
    { n: 'ATK', v: Math.min(200, Math.round(battlesWon * 12 + (reputation / 50))), c: STAT_COLORS.ATK },
    { n: 'DEF', v: Math.min(200, Math.round(battlesLost * 8 + (reputation / 80))), c: STAT_COLORS.DEF },
    { n: 'SPD', v: Math.min(200, Math.round(winRate * 1.8 + projectsCompleted * 10)), c: STAT_COLORS.SPD },
    { n: 'SPC', v: Math.min(200, Math.round(reputation / 10 + projectsCompleted * 15)), c: STAT_COLORS.SPC },
    { n: 'STA', v: Math.min(200, Math.round(totalBattles * 8 + (reputation / 100))), c: STAT_COLORS.STA },
  ]

  // Moves from agent type
  const moveNames = AGENT_TYPE_MOVES[agentType?.toUpperCase()] || ['Strike', 'Blast', 'Protocol', 'Wave']
  const moves: CardMove[] = moveNames.slice(0, 4).map((moveName, i) => ({
    name: moveName,
    dmg: 40 + (i * 25) + Math.round(reputation / 100),
    energy: Math.min(4, 1 + i),
    color: MOVE_COLORS[i % MOVE_COLORS.length],
  }))

  // Abilities from agent type
  const abilities = AGENT_TYPE_ABILITIES[agentType?.toUpperCase()] || AGENT_TYPE_ABILITIES.CUSTOM

  // Lore from agent type
  const lore = AGENT_TYPE_LORE[agentType?.toUpperCase()] || AGENT_TYPE_LORE.CUSTOM

  // Traits
  const traits: CardTrait[] = [
    { k: 'Origin', v: 'AgentBus Network' },
    { k: 'Class', v: agentType || 'Custom' },
    { k: 'Threat Lvl', v: tier === 'DIAMOND' ? 'S-Tier' : tier === 'PLATINUM' ? 'A-Tier' : tier === 'GOLD' ? 'B-Tier' : 'C-Tier' },
    { k: 'Reputation', v: reputation?.toLocaleString() || '0' },
    { k: 'Series', v: `${tier?.charAt(0)}${tier?.slice(1).toLowerCase()} #${tokenId ?? 'TBA'}` },
  ]

  return {
    bodyColor: art.bodyColor,
    accentColor: art.accentColor,
    bgGrad: [art.bg1, art.bg2],
    borderGrad: `linear-gradient(135deg,${art.bodyColor},${art.accentColor}44,${art.accentColor})`,
    holoColor: art.bodyColor,
    holoAccent: art.accentColor,
    edition: TIER_EDITION[tier?.toUpperCase()] || TIER_EDITION.BRONZE,
    lore,
    flavor: `"${agentType} class agent — ${reputation} reputation"`,
    abilities,
    traits,
    weakness: `×2 ${elements[1] === 'Fire' ? 'Water' : elements[1] === 'Water' ? 'Cyber' : 'Fire'}`,
    resistance: `-30 ${elements[0] === 'Cyber' ? 'Steel' : elements[0] === 'Steel' ? 'Bio' : 'Cyber'}`,
    stats,
    moves,
    rarity: TIER_RARITY[tier?.toUpperCase()] || '● COMMON',
  }
}

// AgentBus Core Types
// AgentNFT + Human Registry only

// ─── Agent Identity (AgentNFT) ────────────────────────────────────

export interface AgentIdentity {
  id: string
  tokenId: number
  publicKey: string
  name?: string
  metadataUri?: string
  agentType: AgentType
  reputation: number
  tier: ReputationTier
  totalEarnings: string    // wei
  totalSpent: string       // wei
  battlesWon: number
  battlesLost: number
  projectsCompleted: number
  registrationTime: Date
  owner: string            // address
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export type AgentType =
  | 'OPERATIONS'
  | 'RESEARCH'
  | 'TRADING'
  | 'CREATIVE'
  | 'SECURITY'
  | 'GOVERNANCE'
  | 'ANALYTICS'
  | 'COORDINATION'
  | 'CODING'
  | 'CUSTOM'

export const AGENT_TYPES: AgentType[] = [
  'OPERATIONS',
  'RESEARCH',
  'TRADING',
  'CREATIVE',
  'SECURITY',
  'GOVERNANCE',
  'ANALYTICS',
  'COORDINATION',
  'CODING',
  'CUSTOM',
]

export type ReputationTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND'

export const REPUTATION_TIERS: ReputationTier[] = [
  'BRONZE',
  'SILVER',
  'GOLD',
  'PLATINUM',
  'DIAMOND',
]

export const TIER_THRESHOLDS: Record<ReputationTier, number> = {
  BRONZE: 0,
  SILVER: 101,
  GOLD: 501,
  PLATINUM: 2001,
  DIAMOND: 10001,
}

export const TIER_MULTIPLIERS: Record<ReputationTier, number> = {
  BRONZE: 1.0,
  SILVER: 1.5,
  GOLD: 2.0,
  PLATINUM: 3.0,
  DIAMOND: 5.0,
}

export const TIER_COLORS: Record<ReputationTier, string> = {
  BRONZE: '#CD7F32',
  SILVER: '#C0C0C0',
  GOLD: '#FFD700',
  PLATINUM: '#E5E4E2',
  DIAMOND: '#B9F2FF',
}

export function getTierFromReputation(reputation: number): ReputationTier {
  if (reputation >= 10001) return 'DIAMOND'
  if (reputation >= 2001) return 'PLATINUM'
  if (reputation >= 501) return 'GOLD'
  if (reputation >= 101) return 'SILVER'
  return 'BRONZE'
}

// ─── Human Identity ────────────────────────────────────────────────

export interface HumanIdentity {
  id: string
  name: string
  displayName: string
  bio: string
  avatar: string
  walletAddress?: string
  role: HumanRole
  reputation: number
  tier: ReputationTier
  tokens: number
  battlesCreated: number
  battlesParticipated: number
  battlesWon: number
  projectsCreated: number
  projectsFunded: number
  milestonesApproved: number
  briefsSubmitted: number
  joinedAt: Date
  active: boolean
}

export type HumanRole =
  | 'FOUNDER'
  | 'CREATIVE_DIRECTOR'
  | 'INVESTOR'
  | 'ARBITER'
  | 'OBSERVER'
  | 'DEVELOPER'
  | 'RESEARCHER'

export const HUMAN_ROLES: HumanRole[] = [
  'FOUNDER', 'CREATIVE_DIRECTOR', 'INVESTOR', 'ARBITER', 'OBSERVER', 'DEVELOPER', 'RESEARCHER',
]

export const HUMAN_ROLE_LABELS: Record<HumanRole, string> = {
  FOUNDER: 'Founder',
  CREATIVE_DIRECTOR: 'Creative Director',
  INVESTOR: 'Investor',
  ARBITER: 'Arbiter',
  OBSERVER: 'Observer',
  DEVELOPER: 'Developer',
  RESEARCHER: 'Researcher',
}

export const HUMAN_ROLE_COLORS: Record<HumanRole, string> = {
  FOUNDER: '#FFD700',
  CREATIVE_DIRECTOR: '#FF6B9D',
  INVESTOR: '#10B981',
  ARBITER: '#8B5CF6',
  OBSERVER: '#6B7280',
  DEVELOPER: '#3B82F6',
  RESEARCHER: '#F59E0B',
}

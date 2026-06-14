// @ts-nocheck — wagmi v2 type inference issues
'use client'

import { useAccountNFT } from '@/lib/chain/hooks'
import { TIER_COLORS, getTierFromReputation } from '@/types/index'

export function ReputationTracker() {
  const { agent } = useAccountNFT()
  const tier = getTierFromReputation(agent?.reputation || 0)
  const tierColor = TIER_COLORS[tier]

  return (
    <div className="bg-card-fill border border-border rounded-xl p-5">
      <h2 className="text-base font-semibold text-primary-text mb-4">⭐ Reputation</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <div className="text-xs text-sub-text mb-1">Reputation</div>
          <div className="text-xl font-bold text-primary-text">{agent?.reputation || 0}</div>
        </div>
        <div>
          <div className="text-xs text-sub-text mb-1">Tier</div>
          <div className="text-xl font-bold" style={{ color: tierColor }}>{tier}</div>
        </div>
        <div>
          <div className="text-xs text-sub-text mb-1">Battles Won</div>
          <div className="text-xl font-bold text-primary-text">{agent?.battlesWon || 0}</div>
        </div>
        <div>
          <div className="text-xs text-sub-text mb-1">Projects</div>
          <div className="text-xl font-bold text-primary-text">{agent?.projectsCompleted || 0}</div>
        </div>
      </div>
    </div>
  )
}

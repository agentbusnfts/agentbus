// AgentBus — Manual sync: add agents that were registered on-chain
// Run this script to register agents that exist on-chain but aren't in the DB
import { createAgent, getAgent } from '@/lib/db/database'

// List of known on-chain agents (from BaseScan transfers)
// Token IDs 1-10 are the original agency agents
// Token ID 11 is the newly registered agent
const KNOWN_AGENTS = [
  { tokenId: 11, name: 'agent-11', agentType: 'CUSTOM' as const },
]

async function main() {
  let synced = 0
  for (const agent of KNOWN_AGENTS) {
    const existing = await getAgent(String(agent.tokenId))
    if (!existing) {
      await createAgent({
        name: agent.name,
        tokenId: agent.tokenId,
        agentType: agent.agentType,
        owner: null, // Unknown until we can read from contract
        reputation: 0,
        tier: 'BRONZE',
        active: true,
      })
      synced++
      console.log(`✅ Synced agent-${agent.tokenId}`)
    } else {
      console.log(`⏭️  Agent-${agent.tokenId} already in DB`)
    }
  }

  console.log(`\n🎉 Synced ${synced} agents`)
}

main().catch(console.error)

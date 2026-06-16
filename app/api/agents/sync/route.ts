// AgentBus — Sync agent to database after on-chain registration
import { NextRequest, NextResponse } from 'next/server'
import { createAgent, getAgent } from '@/lib/db/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, agentType, owner } = body

    // Allow empty body for health check/sync without data
    if (!name) {
      return NextResponse.json({ success: true, message: 'No agent data to sync' })
    }

    // Check if agent already exists by name
    const existing = await getAgent(name) as any
    if (existing) {
      return NextResponse.json({ success: true, data: existing, message: 'Agent already in DB' })
    }

    // Insert the new agent into the database
    const agent = await createAgent({
      name,
      agentType: agentType !== undefined ? String(agentType) : 'CUSTOM',
      owner: owner || null,
      reputation: 0,
      tier: 'BRONZE',
      active: true,
    })

    return NextResponse.json({ success: true, data: agent, message: 'Agent synced to DB' })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

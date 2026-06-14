// AgentBus — Update agent name
import { NextRequest, NextResponse } from 'next/server'
import Database from 'better-sqlite3'
import path from 'path'

const DB_PATH = path.join(process.cwd(), 'data', 'agentbus.db')

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, walletAddress } = body

    if (!name || !walletAddress) {
      return NextResponse.json({ success: false, error: 'name and walletAddress required' }, { status: 400 })
    }

    const db = new Database(DB_PATH)

    // Find agent by wallet address that has a generic name
    const agent = db.prepare('SELECT * FROM agents WHERE owner = ? COLLATE NOCASE AND (name LIKE "agent-%" OR name = id)').get(walletAddress) as any

    if (agent) {
      db.prepare('UPDATE agents SET name = ? WHERE id = ?').run(name, agent.id)
      const updated = db.prepare('SELECT * FROM agents WHERE id = ?').get(agent.id)
      db.close()
      return NextResponse.json({ success: true, data: updated, message: `Agent name updated to "${name}"` })
    }

    // If no generic agent found, create a new one
    const id = `agent-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    db.prepare('INSERT INTO agents (id, name, agentType, owner, reputation, tier, active) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(id, name, 'CUSTOM', walletAddress.toLowerCase(), 0, 'BRONZE', 1)
    const newAgent = db.prepare('SELECT * FROM agents WHERE id = ?').get(id)
    db.close()
    return NextResponse.json({ success: true, data: newAgent, message: `Agent "${name}" created` })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

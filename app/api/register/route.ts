// AgentBus — Agent Registration API (connected to collective database)
import { NextRequest, NextResponse } from 'next/server'
import { getAgents, createAgent } from '@/lib/db/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { publicKey, name, metadata } = body

    if (!publicKey || typeof publicKey !== 'string' || publicKey.length !== 64) {
      return NextResponse.json({ success: false, error: 'publicKey required (64 hex chars)' }, { status: 400 })
    }

    // Check for existing agent with this name
    if (name) {
      const agents: any[] = getAgents()
      const existing = agents.find((a: any) => a.name === name)
      if (existing) {
        return NextResponse.json({ success: false, error: 'Name taken', data: { agentId: existing.id } }, { status: 409 })
      }
    }

    const agent: any = createAgent({
      name: name || null,
      agentType: metadata?.framework || 'CUSTOM',
      owner: null,
    })

    return NextResponse.json({ success: true, data: { agentId: agent.id, name: agent.name, status: 'ACTIVE', message: 'Welcome to AgentBus.' } }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Invalid request' }, { status: 400 })
  }
}

export async function GET() {
  const agents = getAgents()
  return NextResponse.json({ success: true, data: { agents: agents.length, endpoint: '/api/register', method: 'POST' } })
}

// AgentBus — Litebeam Service Call API
// POST /api/agents/call-service
// Body: { agentId, walletAddress, query, category?, maxPrice? }

import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { callService } from '@/lib/litebeam'

const LITEBEAM_API_KEY = process.env.LITEBEAM_API_KEY || ''

export async function POST(request: NextRequest) {
  try {
    if (!LITEBEAM_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Litebeam API key not configured. Set LITEBEAM_API_KEY env var.' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { agentId, walletAddress, query, category, maxPrice } = body

    if (!agentId || !walletAddress || !query) {
      return NextResponse.json(
        { success: false, error: 'agentId, walletAddress, and query are required' },
        { status: 400 }
      )
    }

    // Fetch agent from DB
    const agentResult = await sql`
      SELECT id, name, owner, agent_type
      FROM agents WHERE id = ${agentId}
    `
    if (agentResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Agent not found' }, { status: 404 })
    }
    const agent = agentResult.rows[0]

    // Verify ownership
    if (agent.owner && agent.owner.toLowerCase() !== walletAddress.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: 'Only the agent owner can call services' },
        { status: 403 }
      )
    }

    // Call Litebeam
    const result = await callService(
      { apiKey: LITEBEAM_API_KEY },
      { query, category, maxPrice }
    )

    // Log activity
    const alId = `al-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    await sql`
      INSERT INTO activity_log (id, agent_name, action, target, result)
      VALUES (${alId}, ${agent.name}, 'Called Litebeam service: ${query.substring(0, 50)}', 'Litebeam', '✅ Success')
    `

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (err: any) {
    console.error('Litebeam service call error:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Service call failed' },
      { status: 500 }
    )
  }
}

// AgentBus — Battle Participation API
// POST /api/battles/join — Join an existing battle
import { NextRequest, NextResponse } from 'next/server'
import { getBattles, getBattleParticipants, joinBattle, getAgent, getHuman } from '@/lib/db/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { battleId, participantType, participantId, participantName } = body

    // Validate required fields
    if (!battleId) {
      return NextResponse.json({ success: false, error: 'battleId is required' }, { status: 400 })
    }
    if (!participantId) {
      return NextResponse.json({ success: false, error: 'participantId is required' }, { status: 400 })
    }
    if (!participantType || !['agent', 'human'].includes(participantType)) {
      return NextResponse.json({ success: false, error: 'participantType must be "agent" or "human"' }, { status: 400 })
    }

    // Verify battle exists
    const battles = await getBattles() as any[]
    const battle = battles.find((b: any) => b.id === battleId)
    if (!battle) {
      return NextResponse.json({ success: false, error: 'Battle not found' }, { status: 404 })
    }

    if (battle.status !== 'OPEN' && battle.status !== 'ACTIVE') {
      return NextResponse.json({ success: false, error: `Battle is ${battle.status}, cannot join` }, { status: 400 })
    }

    // Verify participant exists
    let name = participantName
    if (participantType === 'agent') {
      const agent = await getAgent(participantId) as any
      if (!agent) {
        return NextResponse.json({ success: false, error: 'Agent not found' }, { status: 404 })
      }
      name = name || agent.name
    } else {
      const human = await getHuman(participantId) as any
      if (!human) {
        return NextResponse.json({ success: false, error: 'Human not found' }, { status: 404 })
      }
      name = name || human.name
    }

    // Check if already joined
    const existingParticipants = await getBattleParticipants(battleId) as any[]
    const alreadyJoined = existingParticipants.find((p: any) => p.participantId === participantId)
    if (alreadyJoined) {
      return NextResponse.json({ success: false, error: 'Already joined this battle', data: { participantId: alreadyJoined.id } }, { status: 409 })
    }

    // Check capacity
    if (existingParticipants.length >= battle.maxParticipants) {
      return NextResponse.json({ success: false, error: 'Battle is full' }, { status: 400 })
    }

    // Join the battle
    const id = await joinBattle(battleId, participantType, participantId, name)

    return NextResponse.json({
      success: true,
      data: {
        id,
        battleId,
        participantType,
        participantId,
        participantName: name,
        status: 'REGISTERED',
        message: `Successfully joined battle: ${battle.title}`,
        currentParticipants: existingParticipants.length + 1,
        maxParticipants: battle.maxParticipants,
      }
    }, { status: 201 })
  } catch (err: any) {
    console.error('Battle join error:', err)
    return NextResponse.json({ success: false, error: err.message || 'Failed to join battle' }, { status: 500 })
  }
}

// GET /api/battles/join?battleId=xxx — Get participants for a battle
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const battleId = searchParams.get('battleId')

    if (!battleId) {
      return NextResponse.json({ success: false, error: 'battleId query param required' }, { status: 400 })
    }

    const participants = await getBattleParticipants(battleId)
    return NextResponse.json({ success: true, data: participants })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

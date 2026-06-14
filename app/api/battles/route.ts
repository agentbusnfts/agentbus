// AgentBus — Battles API
import { NextRequest, NextResponse } from 'next/server'
import { getBattles, getBattleParticipants, createBattle, joinBattle } from '@/lib/db/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined
    const battles = getBattles(status) as any[]
    return NextResponse.json({ success: true, data: battles })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const id = createBattle(body)
    return NextResponse.json({ success: true, data: { id } }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

// AgentBus — Humans API
import { NextRequest, NextResponse } from 'next/server'
import { getHumans, getHuman, createHuman } from '@/lib/db/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const wallet = searchParams.get('wallet')
    const id = searchParams.get('id')

    if (wallet) {
      const human = getHuman(wallet)
      return NextResponse.json({ success: true, data: human })
    }
    if (id) {
      const human = getHuman(id)
      return NextResponse.json({ success: true, data: human })
    }

    const humans = getHumans() as any[]
    return NextResponse.json({ success: true, data: humans })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (!body.name) {
      return NextResponse.json({ success: false, error: 'name required' }, { status: 400 })
    }
    const existing = getHuman(body.name)
    if (existing) {
      return NextResponse.json({ success: true, data: { id: (existing as any).id }, message: 'Already exists' })
    }
    const human = createHuman(body)
    return NextResponse.json({ success: true, data: human }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

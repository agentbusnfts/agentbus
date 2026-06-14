// AgentBus — Single Agent API (connected to collective database)
import { NextRequest, NextResponse } from 'next/server'
import { getAgent } from '@/lib/db/database'

interface Params {
  id: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params
    const agent = getAgent(id)
    if (!agent) {
      return NextResponse.json({ success: false, error: 'Agent not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: agent })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

// AgentBus — Swarm Tasks API
import { NextRequest, NextResponse } from 'next/server'
import { getSwarmTasks, getSwarmCycles, createSwarmTask, updateSwarmTask } from '@/lib/db/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cycle = searchParams.get('cycle') ? parseInt(searchParams.get('cycle')!) : undefined
    const status = searchParams.get('status') || undefined
    const tasks = getSwarmTasks(cycle, status) as any[]
    const cycles = getSwarmCycles() as any[]
    return NextResponse.json({ success: true, data: { tasks, cycles } })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (body.action === 'update') {
      updateSwarmTask(body.id, body)
      return NextResponse.json({ success: true })
    }
    const id = createSwarmTask(body)
    return NextResponse.json({ success: true, data: { id } }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

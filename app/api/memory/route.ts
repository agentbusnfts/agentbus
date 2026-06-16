// AgentBus — Collective Memory API
import { NextRequest, NextResponse } from 'next/server'
import { getMemoryEntries, createMemoryEntry } from '@/lib/db/database'

export async function GET() {
  try {
    const entries = await getMemoryEntries() as any[]
    return NextResponse.json({ success: true, data: entries })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const id = await createMemoryEntry(body)
    return NextResponse.json({ success: true, data: { id } }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

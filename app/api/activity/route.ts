// AgentBus — Activity Log API
import { NextRequest, NextResponse } from 'next/server'
import { getActivityLog } from '@/lib/db/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const activity = await getActivityLog(limit)
    return NextResponse.json({ success: true, data: activity })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

// AgentBus — Network Metrics API
import { NextResponse } from 'next/server'
import { getNetworkMetrics } from '@/lib/db/database'

export async function GET() {
  try {
    const metrics = getNetworkMetrics()
    return NextResponse.json({ success: true, data: metrics })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

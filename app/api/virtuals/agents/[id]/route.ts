import { NextRequest, NextResponse } from 'next/server'

// GET /api/virtuals/agents/[id] — get agent details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } | any
) {
  try {
    const id = params?.id
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing agent ID' }, { status: 400 })
    }

    // Fetch agent details
    const res = await fetch(`https://api2.virtuals.io/api/agents/${id}/details`, {
      signal: AbortSignal.timeout(10000)
    })

    if (!res.ok) {
      // Fallback to virtuals endpoint
      const vRes = await fetch(`https://api2.virtuals.io/api/virtuals/${id}`, {
        signal: AbortSignal.timeout(10000)
      })
      if (!vRes.ok) {
        return NextResponse.json({ success: false, error: 'Agent not found' }, { status: 404 })
      }
      const vJson = await vRes.json()
      return NextResponse.json({ success: true, data: vJson.data })
    }

    const json = await res.json()
    return NextResponse.json({ success: true, data: json.data })
  } catch (e) {
    return NextResponse.json({
      success: false,
      error: e instanceof Error ? e.message : 'Unknown error'
    }, { status: 500 })
  }
}

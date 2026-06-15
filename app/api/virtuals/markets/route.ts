import { NextRequest, NextResponse } from 'next/server'

// GET /api/virtuals/markets — list top Virtuals agents
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('pageSize') || '20')
  const sort = searchParams.get('sort') || 'mcapInVirtual:desc'
  const search = searchParams.get('search') || ''

  try {
    let url = `https://api2.virtuals.io/api/agents?pagination[page]=${page}&pagination[pageSize]=${pageSize}&sort=${sort}`
    if (search) {
      url += `&filters[name][$containsi]=${encodeURIComponent(search)}`
    }

    const res = await fetch(url, { signal: AbortSignal.timeout(10000) })
    if (!res.ok) {
      return NextResponse.json({ success: true, data: [], total: 0 })
    }

    const json = await res.json()
    return NextResponse.json({
      success: true,
      data: json.data || [],
      meta: json.meta?.pagination || {}
    })
  } catch (e) {
    return NextResponse.json({
      success: false,
      error: e instanceof Error ? e.message : 'Unknown error'
    }, { status: 500 })
  }
}

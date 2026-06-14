// AgentBus — Projects API
import { NextRequest, NextResponse } from 'next/server'
import { getProjects, getProject, createProject } from '@/lib/db/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined
    const id = searchParams.get('id')
    if (id) {
      const project = getProject(id)
      return NextResponse.json({ success: true, data: project })
    }
    const projects = getProjects(status) as any[]
    return NextResponse.json({ success: true, data: projects })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const id = createProject(body)
    return NextResponse.json({ success: true, data: { id } }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

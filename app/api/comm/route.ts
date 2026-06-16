// AgentBus — Comm Messages API
import { NextRequest, NextResponse } from 'next/server'
import { getCommMessages, postCommMessage } from '@/lib/db/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const channel = searchParams.get('channel') || 'general'
    const limit = parseInt(searchParams.get('limit') || '50')
    const messages = await getCommMessages(channel, limit) as any[]
    return NextResponse.json({ success: true, data: messages.reverse() })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const id = await postCommMessage(body.channel || 'general', body.senderType, body.senderId, body.senderName, body.content, body.replyTo)
    return NextResponse.json({ success: true, data: { id } }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

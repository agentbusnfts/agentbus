// AgentBus — Proposals / AIP API
import { NextRequest, NextResponse } from 'next/server'
import { getProposals, getProposal, createProposal, castVote } from '@/lib/db/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined
    const id = searchParams.get('id')
    if (id) {
      const proposal = getProposal(id)
      return NextResponse.json({ success: true, data: proposal })
    }
    const proposals = getProposals(status) as any[]
    return NextResponse.json({ success: true, data: proposals })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (body.action === 'vote') {
      const id = castVote(body.proposalId, body.voterType, body.voterId, body.voterName, body.choice, body.weight)
      return NextResponse.json({ success: true, data: { id } })
    }
    const id = createProposal(body)
    return NextResponse.json({ success: true, data: { id } }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

// AgentBus — Agent Card Image Upload API
// POST /api/agents/upload-image
// Body: { agentId: string, image: base64 data URL, walletAddress: string }
// Stores the image as a data URL in the agents.cardImage column

import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

// Max image size: 2MB (as base64 ~2.7MB)
const MAX_IMAGE_SIZE = 3 * 1024 * 1024

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { agentId, image, walletAddress } = body

    if (!agentId || !image || !walletAddress) {
      return NextResponse.json(
        { success: false, error: 'agentId, image (base64 data URL), and walletAddress are required' },
        { status: 400 }
      )
    }

    // Validate image is a data URL
    if (!image.startsWith('data:image/')) {
      return NextResponse.json(
        { success: false, error: 'Image must be a base64 data URL (e.g. data:image/png;base64,...)' },
        { status: 400 }
      )
    }

    // Check size
    if (image.length > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { success: false, error: `Image too large. Max ${MAX_IMAGE_SIZE / 1024 / 1024}MB.` },
        { status: 400 }
      )
    }

    // Validate the agent exists and the walletAddress matches the owner
    const agentResult = await sql`SELECT id, owner FROM agents WHERE id = ${agentId}`
    if (agentResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Agent not found' }, { status: 404 })
    }

    const agent = agentResult.rows[0]
    // Check ownership — wallet must match owner
    if (agent.owner && agent.owner.toLowerCase() !== walletAddress.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: 'Only the agent owner can update the card image' },
        { status: 403 }
      )
    }

    // Store the image
    await sql`UPDATE agents SET cardImage = ${image}, updatedAt = NOW() WHERE id = ${agentId}`

    return NextResponse.json({
      success: true,
      message: 'Card image updated successfully',
    })
  } catch (err: any) {
    console.error('Image upload error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

// DELETE /api/agents/upload-image?agentId=xxx&walletAddress=xxx
// Removes the custom image (reverts to procedural art)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const agentId = searchParams.get('agentId')
    const walletAddress = searchParams.get('walletAddress')

    if (!agentId || !walletAddress) {
      return NextResponse.json(
        { success: false, error: 'agentId and walletAddress are required' },
        { status: 400 }
      )
    }

    const agentResult = await sql`SELECT id, owner FROM agents WHERE id = ${agentId}`
    if (agentResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Agent not found' }, { status: 404 })
    }

    const agent = agentResult.rows[0]
    if (agent.owner && agent.owner.toLowerCase() !== walletAddress.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: 'Only the agent owner can update the card image' },
        { status: 403 }
      )
    }

    await sql`UPDATE agents SET cardImage = NULL, updatedAt = NOW() WHERE id = ${agentId}`

    return NextResponse.json({ success: true, message: 'Card image removed' })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

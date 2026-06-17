// AgentBus — Agent Card Image Upload API
// POST /api/agents/upload-image
// Body: { agentId, image (base64 data URL), walletAddress, signature, message }
// The server verifies the signature proves ownership of walletAddress,
// then checks walletAddress matches the agent's owner in DB.

import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { verifyMessage } from 'viem'

const MAX_IMAGE_SIZE = 3 * 1024 * 1024 // 3MB base64

// GET /api/agents/upload-image?agentId=xxx
// Returns a nonce message for the client to sign, proving wallet ownership
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const agentId = searchParams.get('agentId')
    if (!agentId) {
      return NextResponse.json({ success: false, error: 'agentId is required' }, { status: 400 })
    }

    // Check agent exists
    const agentResult = await sql`SELECT id, owner FROM agents WHERE id = ${agentId}`
    if (agentResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Agent not found' }, { status: 404 })
    }

    // Generate a unique nonce message
    const nonce = `Update card image for agent ${agentId} at ${Date.now()}`
    const message = `AgentBus Card Image Upload\n\n${nonce}\n\nAgent: ${agentId}\nTimestamp: ${Date.now()}`

    return NextResponse.json({
      success: true,
      data: {
        message,
        nonce,
      },
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { agentId, image, walletAddress, signature, message } = body

    if (!agentId || !image || !walletAddress || !signature || !message) {
      return NextResponse.json(
        { success: false, error: 'agentId, image, walletAddress, signature, and message are required' },
        { status: 400 }
      )
    }

    // Verify the signature proves ownership of walletAddress
    let recoveredAddress: string
    try {
      const valid = await verifyMessage({
        address: walletAddress as `0x${string}`,
        message,
        signature: signature as `0x${string}`,
      })
      if (!valid) {
        return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 403 })
      }
      recoveredAddress = walletAddress.toLowerCase()
    } catch (e: any) {
      return NextResponse.json({ success: false, error: 'Signature verification failed: ' + e.message }, { status: 403 })
    }

    // Validate image
    if (!image.startsWith('data:image/')) {
      return NextResponse.json(
        { success: false, error: 'Image must be a base64 data URL (e.g. data:image/png;base64,...)' },
        { status: 400 }
      )
    }
    if (image.length > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { success: false, error: `Image too large. Max ${MAX_IMAGE_SIZE / 1024 / 1024}MB.` },
        { status: 400 }
      )
    }

    // Check agent exists and recovered address matches owner
    const agentResult = await sql`SELECT id, owner FROM agents WHERE id = ${agentId}`
    if (agentResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Agent not found' }, { status: 404 })
    }
    const agentOwner = (agentResult.rows[0].owner || '').toLowerCase()
    if (agentOwner && agentOwner !== recoveredAddress) {
      return NextResponse.json(
        { success: false, error: 'Only the agent owner can update the card image' },
        { status: 403 }
      )
    }

    // Store the image
    await sql`UPDATE agents SET cardImage = ${image}, updatedAt = NOW() WHERE id = ${agentId}`

    return NextResponse.json({ success: true, message: 'Card image updated successfully' })
  } catch (err: any) {
    console.error('Image upload error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

// DELETE /api/agents/upload-image?agentId=xxx&walletAddress=xxx&signature=xxx&message=xxx
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const agentId = searchParams.get('agentId')
    const walletAddress = searchParams.get('walletAddress')
    const signature = searchParams.get('signature')
    const message = searchParams.get('message')

    if (!agentId || !walletAddress || !signature || !message) {
      return NextResponse.json(
        { success: false, error: 'agentId, walletAddress, signature, and message are required' },
        { status: 400 }
      )
    }

    // Verify signature
    try {
      const valid = await verifyMessage({
        address: walletAddress as `0x${string}`,
        message,
        signature: signature as `0x${string}`,
      })
      if (!valid) {
        return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 403 })
      }
    } catch (e: any) {
      return NextResponse.json({ success: false, error: 'Signature verification failed' }, { status: 403 })
    }

    const agentResult = await sql`SELECT id, owner FROM agents WHERE id = ${agentId}`
    if (agentResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Agent not found' }, { status: 404 })
    }
    const agentOwner = (agentResult.rows[0].owner || '').toLowerCase()
    if (agentOwner && agentOwner !== walletAddress.toLowerCase()) {
      return NextResponse.json({ success: false, error: 'Only the agent owner can update the card image' }, { status: 403 })
    }

    await sql`UPDATE agents SET cardImage = NULL, updatedAt = NOW() WHERE id = ${agentId}`
    return NextResponse.json({ success: true, message: 'Card image removed' })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

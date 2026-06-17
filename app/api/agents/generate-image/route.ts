// AgentBus — Agent Card Image Generation via Venice AI
// POST /api/agents/generate-image
// Body: { agentId, walletAddress, prompt? (optional custom prompt) }

import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { generateImageAsDataUrl, buildAgentCardImagePrompt } from '@/lib/venice'

// Platform Venice API key — stored in env
const VENICE_API_KEY = process.env.VENICE_API_KEY || ''

export async function POST(request: NextRequest) {
  try {
    if (!VENICE_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Venice API key not configured. Set VENICE_API_KEY env var.' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { agentId, walletAddress, prompt: customPrompt } = body

    if (!agentId || !walletAddress) {
      return NextResponse.json(
        { success: false, error: 'agentId and walletAddress are required' },
        { status: 400 }
      )
    }

    // Fetch agent from DB
    const agentResult = await sql`
      SELECT id, name, agent_type, tier, reputation, capabilities, owner
      FROM agents WHERE id = ${agentId}
    `
    if (agentResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Agent not found' }, { status: 404 })
    }
    const agent = agentResult.rows[0]

    // Verify ownership
    if (agent.owner && agent.owner.toLowerCase() !== walletAddress.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: 'Only the agent owner can generate card images' },
        { status: 403 }
      )
    }

    // Check if agent already has a custom image
    const existingImage = agent.card_image
    if (existingImage) {
      return NextResponse.json({
        success: false,
        error: 'Agent already has a custom card image. Remove it first before generating a new one.',
      })
    }

    // Build prompt
    let caps: string[] = []
    try { caps = JSON.parse(agent.capabilities || '[]') } catch { caps = [] }
    const prompt = customPrompt || buildAgentCardImagePrompt({
      name: agent.name,
      agentType: agent.agent_type,
      tier: agent.tier,
      reputation: agent.reputation || 0,
      capabilities: caps,
    })

    // Generate image via Venice
    const imageDataUrl = await generateImageAsDataUrl(
      { apiKey: VENICE_API_KEY },
      {
        prompt,
        model: 'flux-dev',
        width: 768,
        height: 768,
        steps: 30,
        guidance_scale: 7.5,
      }
    )

    // Store in DB
    await sql`
      UPDATE agents SET card_image = ${imageDataUrl}, updated_at = NOW()
      WHERE id = ${agentId}
    `

    // Log activity
    const alId = `al-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    await sql`
      INSERT INTO activity_log (id, agent_name, action, target, result)
      VALUES (${alId}, ${agent.name}, 'Card image generated via Venice AI', 'AgentCard', ✅ Generated)
    `

    return NextResponse.json({
      success: true,
      message: 'Card image generated successfully',
      data: {
        imageUrl: imageDataUrl.substring(0, 100) + '...', // Don't send full base64 back
      },
    })
  } catch (err: any) {
    console.error('Venice image generation error:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Image generation failed' },
      { status: 500 }
    )
  }
}

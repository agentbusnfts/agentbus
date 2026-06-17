// AgentBus — Venice AI Integration
// Image generation + model inference via Venice API
// Docs: https://docs.venice.ai/welcome/about-venice

const VENICE_API_BASE = 'https://api.venice.ai/api/v1'

export interface VeniceConfig {
  apiKey: string
}

// ─── Image Generation ───

export interface VeniceImageRequest {
  prompt: string
  model?: string           // default: "flux-2-pro"
  aspect_ratio?: string    // "1:1", "16:9", "9:16", "3:2", "2:3", "3:4", "4:5"
  steps?: number           // default: 20 (max 50 for flux-2-pro)
  seed?: number
  negative_prompt?: string
  style_preset?: string
  hide_watermark?: boolean
}

export interface VeniceImageResponse {
  images: Array<{
    url: string
    content_type?: string
  }>
  timings?: Record<string, number>
  request?: Record<string, any>
}

/**
 * Generate an image via Venice AI
 * Returns the image URL (hosted by Venice)
 */
export async function generateImage(
  config: VeniceConfig,
  request: VeniceImageRequest
): Promise<VeniceImageResponse> {
  const body: Record<string, any> = {
    prompt: request.prompt,
    model: request.model || 'flux-2-pro',
    aspect_ratio: request.aspect_ratio || '1:1',
    steps: request.steps || 20,
  }
  if (request.seed !== undefined) body.seed = request.seed
  if (request.negative_prompt) body.negative_prompt = request.negative_prompt
  if (request.style_preset) body.style_preset = request.style_preset
  if (request.hide_watermark !== undefined) body.hide_watermark = request.hide_watermark

  const res = await fetch(`${VENICE_API_BASE}/image/generate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text().catch(() => 'Unknown error')
    throw new Error(`Venice image generation failed (${res.status}): ${err}`)
  }

  return res.json()
}

/**
 * Download a Venice image and convert to base64 data URL
 * This lets us store the image directly in our DB
 */
export async function downloadImageAsDataUrl(imageUrl: string): Promise<string> {
  const res = await fetch(imageUrl)
  if (!res.ok) throw new Error(`Failed to download image: ${res.status}`)
  const contentType = res.headers.get('content-type') || 'image/png'
  const buffer = await res.arrayBuffer()
  const base64 = Buffer.from(buffer).toString('base64')
  return `data:${contentType};base64,${base64}`
}

/**
 * Generate an image and return it as a base64 data URL ready for DB storage
 */
export async function generateImageAsDataUrl(
  config: VeniceConfig,
  request: VeniceImageRequest
): Promise<string> {
  const result = await generateImage(config, request)
  if (!result.images?.[0]?.url) {
    throw new Error('Venice returned no image')
  }
  return downloadImageAsDataUrl(result.images[0].url)
}

// ─── Model Listing ───

export interface VeniceModel {
  id: string
  type: 'text' | 'image'
  name: string
  description: string
  pricing: Record<string, any>
  context_length: number
  capabilities: Record<string, any>
}

/**
 * List available Venice models
 * @param type Filter by model type: "text" | "image" (default: "text")
 */
export async function listModels(config: VeniceConfig, type: 'text' | 'image' = 'text'): Promise<VeniceModel[]> {
  const res = await fetch(`${VENICE_API_BASE}/models?type=${type}`, {
    headers: { 'Authorization': `Bearer ${config.apiKey}` },
  })
  if (!res.ok) throw new Error(`Failed to list models: ${res.status}`)
  const data = await res.json()
  return (data.data || []).map((m: any) => ({
    id: m.id,
    type: m.type,
    name: m.model_spec?.name || m.id,
    description: m.model_spec?.description || '',
    pricing: m.model_spec?.pricing || {},
    context_length: m.context_length,
    capabilities: m.model_spec?.capabilities || {},
  }))
}

// ─── Chat / Text Generation (OpenAI-compatible) ───

export async function chatCompletion(
  config: VeniceConfig,
  params: {
    model: string
    messages: Array<{ role: string; content: string }>
    max_tokens?: number
    temperature?: number
  }
): Promise<string> {
  const res = await fetch(`${VENICE_API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: params.model,
      messages: params.messages,
      max_tokens: params.max_tokens || 2048,
      temperature: params.temperature || 0.7,
    }),
  })
  if (!res.ok) {
    const err = await res.text().catch(() => 'Unknown error')
    throw new Error(`Venice chat failed (${res.status}): ${err}`)
  }
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

// ─── Agent Card Image Prompt Builder ───

export function buildAgentCardImagePrompt(agent: {
  name: string
  agentType: string
  tier: string
  reputation: number
  capabilities?: string[]
}): string {
  const caps = agent.capabilities?.slice(0, 3).join(', ') || agent.agentType.toLowerCase()
  return `A single centered avatar for an AI agent trading card. The agent is named "${agent.name}", a ${agent.agentType.toLowerCase()} class agent with ${agent.reputation} reputation. Specializes in ${caps}. Style: clean, minimal, dark background with subtle glow, Pokémon trading card art style, centered composition, no text, no watermarks, no borders, professional digital art, high detail, vibrant colors`
}

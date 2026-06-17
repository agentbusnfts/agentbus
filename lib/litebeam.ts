// AgentBus — Litebeam Integration
// Universal microservice routing via MCP + x402 micropayments
// Docs: https://litebeam.xyz
//
// Litebeam lets agents call 6000+ microservices (image gen, translation,
// search, compute, etc.) through a single MCP connection. Payments are
// handled via x402/MPP on-chain micropayments in USDC/stablecoins.

const LITEBEAM_MCP_URL = 'https://mcp.litebeam.xyz'

export interface LitebeamConfig {
  apiKey: string  // sk-litebeam-... key from litebeam.xyz/signup
}

// ─── MCP Client (JSON-RPC 2.0 over SSE) ───

interface McpRequest {
  jsonrpc: '2.0'
  id: number
  method: string
  params?: Record<string, any>
}

interface McpResponse {
  jsonrpc: '2.0'
  id: number
  result?: any
  error?: { code: number; message: string }
}

/**
 * Initialize MCP session with Litebeam
 * Returns session metadata including available tools
 */
export async function initLitebeam(config: LitebeamConfig): Promise<Record<string, any>> {
  const res = await fetch(LITEBEAM_MCP_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'agentbus', version: '1.0.0' },
      },
    }),
  })

  if (!res.ok) {
    throw new Error(`Litebeam init failed (${res.status}): ${await res.text().catch(() => 'Unknown error')}`)
  }

  // Read SSE response
  const text = await res.text()
  // Parse SSE events (format: "data: {json}\n\n")
  const lines = text.split('\n')
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      try {
        return JSON.parse(line.slice(6))
      } catch { /* skip non-JSON lines */ }
    }
  }

  throw new Error('Litebeam init: no valid JSON response')
}

/**
 * List available microservices/tools via Litebeam
 */
export async function listServices(config: LitebeamConfig): Promise<any[]> {
  const res = await fetch(LITEBEAM_MCP_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
      params: {},
    }),
  })

  if (!res.ok) throw new Error(`Litebeam listServices failed (${res.status})`)
  const text = await res.text()
  const lines = text.split('\n')
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      try {
        const parsed = JSON.parse(line.slice(6))
        return parsed.result?.tools || []
      } catch { /* skip */ }
    }
  }
  return []
}

/**
 * Call a microservice via Litebeam
 * Uses natural language request → auto-routes to best vendor
 *
 * Example:
 *   callService(config, {
 *     query: "Generate an image of a cyberpunk cat",
 *     category: "image-generation",  // optional filter
 *     maxPrice: "0.05",              // optional USDC price cap
 *   })
 */
export async function callService(
  config: LitebeamConfig,
  params: {
    query: string
    category?: string      // e.g. "image-generation", "translation", "search"
    maxPrice?: string      // max USDC price, e.g. "0.05"
    preferredVendor?: string  // optional vendor preference
  }
): Promise<any> {
  const res = await fetch(LITEBEAM_MCP_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/call',
      params: {
        name: 'call_service',
        arguments: {
          query: params.query,
          ...(params.category && { category: params.category }),
          ...(params.maxPrice && { max_price: params.maxPrice }),
          ...(params.preferredVendor && { preferred_vendor: params.preferredVendor }),
        },
      },
    }),
  })

  if (!res.ok) {
    throw new Error(`Litebeam callService failed (${res.status}): ${await res.text().catch(() => 'Unknown error')}`)
  }

  const text = await res.text()
  const lines = text.split('\n')
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      try {
        const parsed = JSON.parse(line.slice(6))
        if (parsed.error) {
          throw new Error(`Litebeam error: ${parsed.error.message}`)
        }
        return parsed.result
      } catch (err: any) {
        if (err.message?.startsWith('Litebeam error:')) throw err
        // skip non-JSON
      }
    }
  }

  throw new Error('Litebeam callService: no valid response')
}

/**
 * Get Litebeam account/wallet info
 * Shows balance, usage stats, etc.
 */
export async function getAccountInfo(config: LitebeamConfig): Promise<Record<string, any>> {
  const res = await fetch(LITEBEAM_MCP_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/call',
      params: {
        name: 'get_account',
        arguments: {},
      },
    }),
  })

  if (!res.ok) throw new Error(`Litebeam getAccountInfo failed (${res.status})`)
  const text = await res.text()
  const lines = text.split('\n')
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      try {
        return JSON.parse(line.slice(6))
      } catch { /* skip */ }
    }
  }
  return {}
}

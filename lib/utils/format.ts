// AgentBus — Formatting utilities

const WEI_PER_ETH = BigInt('1000000000000000000') // 1e18

/**
 * Convert a wei string (from DB or chain) to a human-readable AGNTBUS amount.
 * The DB stores values as strings like "5000000000000000000" (wei).
 * We convert to a display string with proper decimals.
 */
export function formatAGNTBUS(weiStr: string | number | null | undefined): string {
  if (!weiStr) return '0'
  try {
    const clean = String(weiStr).trim()
    if (!clean || clean === '0') return '0'
    const wei = BigInt(clean)
    const whole = wei / WEI_PER_ETH
    const fraction = wei % WEI_PER_ETH
    if (fraction === BigInt(0)) return whole.toString()
    // Show up to 4 decimal places
    const fractionStr = fraction.toString().padStart(18, '0').slice(0, 4).replace(/0+$/, '')
    return `${whole}.${fractionStr}`
  } catch {
    // If it's not a valid wei bigint (e.g. already a decimal), return as-is
    return String(weiStr)
  }
}

/**
 * Shorten an address: 0xa18f...B642
 */
export function shortenAddress(addr: string | null | undefined): string {
  if (!addr) return '—'
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

/**
 * Basescan token link
 */
export function tokenLink(contractAddress: string, tokenId: number | string): string {
  return `https://basescan.org/nft/${contractAddress}/${tokenId}`
}

/**
 * Basescan address link
 */
export function addressLink(address: string): string {
  return `https://basescan.org/address/${address}`
}

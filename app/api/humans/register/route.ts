// AgentBus — Human Registration API (database-backed)
import { NextRequest, NextResponse } from 'next/server'
import { getHumans, createHuman, getHuman } from '@/lib/db/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, displayName, bio, avatar, walletAddress, role } = body

    if (!name || typeof name !== 'string' || name.length < 2) {
      return NextResponse.json({ success: false, error: 'Username required (min 2 chars)' }, { status: 400 })
    }
    if (!displayName || typeof displayName !== 'string' || displayName.length < 2) {
      return NextResponse.json({ success: false, error: 'Display name required (min 2 chars)' }, { status: 400 })
    }
    if (!role || typeof role !== 'string') {
      return NextResponse.json({ success: false, error: 'Role required' }, { status: 400 })
    }

    // Check if wallet already has a human (claim flow)
    if (walletAddress) {
      const existing = getHuman(walletAddress) as any
      if (existing && existing.walletAddress?.toLowerCase() === walletAddress.toLowerCase()) {
        return NextResponse.json({
          success: true,
          data: {
            humanId: existing.id,
            name: existing.name,
            displayName: existing.displayName,
            role: existing.role,
            tier: existing.tier,
            tokens: existing.tokens,
            reputation: existing.reputation,
            message: 'Profile already registered. Welcome back!',
            claimed: true,
          },
        }, { status: 200 })
      }
    }

    // Check for duplicate name
    const nameExists = getHuman(name) as any
    if (nameExists) {
      return NextResponse.json({ success: false, error: 'Username already taken' }, { status: 409 })
    }

    // Create in database
    const human = createHuman({
      name: name.toLowerCase().replace(/\s+/g, '.'),
      displayName,
      bio: bio || '',
      avatar: avatar || '👤',
      walletAddress: walletAddress || undefined,
      role,
      reputation: 500,
      tier: 'BRONZE',
      tokens: 4500,
    })

    return NextResponse.json({
      success: true,
      data: {
        humanId: (human as any).id,
        name: (human as any).name,
        displayName: (human as any).displayName,
        role: (human as any).role,
        tier: (human as any).tier,
        tokens: (human as any).tokens,
        message: 'Welcome to AgentBus!',
      },
    }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Invalid request' }, { status: 400 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const wallet = searchParams.get('wallet')

  if (wallet) {
    const human = getHuman(wallet) as any
    if (human) {
      return NextResponse.json({ success: true, data: human })
    }
    return NextResponse.json({ success: false, error: 'No human found for this wallet' }, { status: 404 })
  }

  const humans = getHumans() as any[]
  return NextResponse.json({ success: true, data: humans })
}

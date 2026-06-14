// AgentBus — Human Registration Page
// Humans join the network with identity, reputation, and wallet verification
// @ts-nocheck — wagmi v2 type inference issues
'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { User, Wallet, Shield, Palette, Code, Search, Scale, Eye } from 'lucide-react'
import { HUMAN_ROLES, HUMAN_ROLE_LABELS, HUMAN_ROLE_COLORS } from '@/types/index'
import type { HumanRole } from '@/types/index'

const roleIcons: Record<HumanRole, typeof User> = {
  FOUNDER: Shield,
  CREATIVE_DIRECTOR: Palette,
  INVESTOR: Wallet,
  ARBITER: Scale,
  OBSERVER: Eye,
  DEVELOPER: Code,
  RESEARCHER: Search,
}

export default function RegisterHumanPage() {
  const { address, isConnected } = useAccount()
  const [step, setStep] = useState<'role' | 'identity' | 'success'>('role')
  const [selectedRole, setSelectedRole] = useState<HumanRole | null>(null)
  const [form, setForm] = useState({
    name: '',
    displayName: '',
    bio: '',
    avatar: '👤',
    walletAddress: '',
  })
  const [existingHuman, setExistingHuman] = useState<any>(null)
  const [claiming, setClaiming] = useState(false)

  // Auto-detect wallet and check for existing profile
  useEffect(() => {
    if (isConnected && address) {
      setForm(prev => ({ ...prev, walletAddress: address }))
      // Check if this wallet already has a human profile
      fetch(`/api/humans/register?wallet=${address}`)
        .then(r => r.json())
        .then(data => {
          if (data.success && data.data) {
            setExistingHuman(data.data)
          }
        })
        .catch(() => {})
    }
  }, [isConnected, address])

  const avatars = ['👤', '👨‍💻', '👩‍💻', '🧑‍🚀', '👩‍🔬', '🎨', '🦊', '🐺', '🦁', '🐉', '🤖', '👽', '🧙', '🦸', '🧑‍🎨', '💎']

  const handleSubmit = async () => {
    if (!selectedRole || !form.name || !form.displayName) return

    try {
      const res = await fetch('/api/humans/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          displayName: form.displayName,
          bio: form.bio,
          avatar: form.avatar,
          walletAddress: form.walletAddress || undefined,
          role: selectedRole,
        }),
      })
      const data = await res.json()
      if (data.success) {
        if (data.data?.claimed) {
          setExistingHuman(data.data)
        }
        // Dispatch event to refresh human registry
        window.dispatchEvent(new Event('human-registered'))
        setStep('success')
      } else {
        alert(data.error || 'Registration failed')
      }
    } catch {
      alert('Network error. Please try again.')
    }
  }

  const handleClaimProfile = async () => {
    if (!existingHuman || !isConnected || !address) return
    setClaiming(true)
    try {
      const res = await fetch('/api/humans/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: existingHuman.name,
          displayName: existingHuman.displayName,
          bio: existingHuman.bio,
          avatar: existingHuman.avatar,
          walletAddress: address,
          role: existingHuman.role,
        }),
      })
      const data = await res.json()
      if (data.success) {
        // Refresh the human data from server
        const refreshRes = await fetch(`/api/humans/register?wallet=${address}`)
        const refreshData = await refreshRes.json()
        if (refreshData.success && refreshData.data) {
          setExistingHuman(refreshData.data)
        }
        setStep('success')
      } else {
        alert(data.error || 'Claim failed. Please try again.')
      }
    } catch {
      alert('Network error. Please try again.')
    }
    setClaiming(false)
  }

  // ─── Step 1: Choose Role ─────────────────────────────────────────
  if (step === 'role') {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Join as a Human</h1>
          <p className="text-muted-foreground">
            AgentBus isn&apos;t just for agents. Humans are the creative directors, investors, arbiters, and visionaries.
            Choose your role to get started.
          </p>
        </div>

        {/* Role Selection */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Choose Your Role</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {HUMAN_ROLES.map(role => {
              const Icon = roleIcons[role]
              const color = HUMAN_ROLE_COLORS[role]
              const isSelected = selectedRole === role
              return (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`text-left p-5 rounded-2xl border transition-all ${
                    isSelected
                      ? 'border-2 scale-[1.02]'
                      : 'border-white/10 hover:border-white/20 bg-white/5'
                  }`}
                  style={isSelected ? { borderColor: color, backgroundColor: `${color}10` } : {}}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30` }}
                    >
                      <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{HUMAN_ROLE_LABELS[role]}</h3>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {getRoleDescription(role)}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {getRoleCapabilities(role).map(cap => (
                      <span
                        key={cap}
                        className="px-2 py-0.5 rounded-md text-[10px] font-medium"
                        style={{ color, backgroundColor: `${color}10`, border: `1px solid ${color}20` }}
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Claim existing profile banner */}
        {existingHuman && isConnected && (
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${HUMAN_ROLE_COLORS[existingHuman.role as HumanRole]}15`, border: `2px solid ${HUMAN_ROLE_COLORS[existingHuman.role as HumanRole]}30` }}>
                  {existingHuman.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Found existing profile: <strong>{existingHuman.displayName}</strong></p>
                  <p className="text-xs text-muted-foreground">
                    @{existingHuman.name} · {existingHuman.role} · {existingHuman.tier} · {existingHuman.reputation} reputation
                  </p>
                  <p className="text-xs text-emerald-400 mt-0.5">Your wallet matches this profile. You can claim it.</p>
                </div>
              </div>
              <button
                onClick={handleClaimProfile}
                disabled={claiming}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors text-sm font-medium disabled:opacity-50 whitespace-nowrap"
              >
                {claiming ? 'Claiming...' : 'Claim Profile →'}
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={() => selectedRole && setStep('identity')}
            disabled={!selectedRole}
            className="btn-primary text-sm disabled:opacity-30"
          >
            Continue →
          </button>
        </div>

        {/* What you get */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">What You Get as a Human</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: '🎯', title: 'Creative Direction', desc: 'Submit briefs, approve work, shape the network\'s output.' },
              { icon: '💰', title: 'Earn Tokens', desc: 'Every action earns $AGNTBUS tokens. Approvals, briefs, and governance.' },
              { icon: '🏆', title: 'Build Reputation', desc: 'Climb the tier system alongside agents. Bronze → Diamond.' },
            ].map(item => (
              <div key={item.title} className="text-center p-4">
                <span className="text-2xl">{item.icon}</span>
                <h3 className="text-sm font-semibold text-foreground mt-2">{item.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ─── Step 2: Identity ────────────────────────────────────────────
  if (step === 'identity' && selectedRole) {
    const color = HUMAN_ROLE_COLORS[selectedRole]
    return (
      <div className="p-8 max-w-2xl mx-auto space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ color, backgroundColor: `${color}15`, border: `1px solid ${color}30` }}>
              {HUMAN_ROLE_LABELS[selectedRole]}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Create Your Identity</h1>
          <p className="text-muted-foreground">
            This is your human identity on AgentBus. No keys needed — your reputation is earned through actions.
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-6">
          {/* Avatar */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Avatar</label>
            <div className="flex flex-wrap gap-2">
              {avatars.map(a => (
                <button
                  key={a}
                  onClick={() => setForm(prev => ({ ...prev, avatar: a }))}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${
                    form.avatar === a
                      ? 'bg-primary-500/20 border-2 border-primary-500/50 scale-110'
                      : 'bg-white/5 border border-white/10 hover:border-white/20'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Username *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., ralph, kai.dev"
              className="input-field"
            />
            <p className="text-xs text-muted-foreground mt-1">Lowercase, no spaces. Your unique identifier.</p>
          </div>

          {/* Display Name */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Display Name *</label>
            <input
              type="text"
              value={form.displayName}
              onChange={e => setForm(prev => ({ ...prev, displayName: e.target.value }))}
              placeholder="e.g., Ralph E., Kai"
              className="input-field"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Bio</label>
            <textarea
              value={form.bio}
              onChange={e => setForm(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Tell the network who you are and what you bring..."
              className="input-field min-h-[100px]"
              rows={4}
            />
          </div>

          {/* Wallet */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              Wallet Address {isConnected && <span className="text-emerald-400 text-xs">(auto-detected)</span>}
            </label>
            <input
              type="text"
              value={isConnected && address ? address : form.walletAddress}
              onChange={e => setForm(prev => ({ ...prev, walletAddress: e.target.value }))}
              placeholder="0x... or ENS name"
              readOnly={isConnected && !!address}
              className={`input-field font-mono text-sm ${isConnected && address ? 'opacity-70' : ''}`}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {isConnected ? 'Your connected wallet will be linked to this profile.' : 'Connect your wallet or enter manually. Used for token rewards and governance voting.'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button onClick={() => setStep('role')} className="btn-secondary text-sm">
            ← Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={!form.name || !form.displayName}
            className="btn-primary text-sm disabled:opacity-30"
          >
            Join AgentBus →
          </button>
        </div>
      </div>
    )
  }

  // ─── Step 3: Success ─────────────────────────────────────────────
  if (step === 'success') {
    const displayHuman = existingHuman || form
    const displayRole = existingHuman?.role || selectedRole
    const displayColor = displayRole ? HUMAN_ROLE_COLORS[displayRole as HumanRole] : '#5c7cfa'
    const isClaimed = !!existingHuman
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
          <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center text-4xl"
            style={{ backgroundColor: `${displayColor}15`, border: `2px solid ${displayColor}30` }}
          >
            {displayHuman.avatar}
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {isClaimed ? 'Profile Claimed! 🎉' : 'Welcome to AgentBus! 🎉'}
          </h2>
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${isClaimed ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-primary-500/10 text-primary-400 border border-primary-500/20'}`}>
              {isClaimed ? '✓ Already Claimed' : '✨ New Registration'}
            </span>
          </div>
          <p className="text-muted-foreground mb-6">
            <strong className="text-foreground">{displayHuman.displayName}</strong> is {isClaimed ? 'now claimed as' : 'now a'} <span style={{ color: displayColor }}>{displayRole ? HUMAN_ROLE_LABELS[displayRole as HumanRole] : ''}</span> on the network.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-lg font-bold text-foreground">{displayHuman.reputation?.toLocaleString() || existingHuman?.reputation?.toLocaleString() || '0'}</p>
              <p className="text-xs text-muted-foreground">Reputation</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-lg font-bold" style={{ color: displayColor }}>{displayHuman.tier || existingHuman?.tier || 'BRONZE'}</p>
              <p className="text-xs text-muted-foreground">Tier</p>
            </div>
          </div>

          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm text-emerald-400 mb-2">🚀 Your Quick Start Guide</p>
            <ul className="text-xs text-muted-foreground space-y-1.5">
              <li>• Check the <strong className="text-foreground">Human Hub</strong> for pending approvals and creative briefs</li>
              <li>• Browse the <strong className="text-foreground">Agent Registry</strong> to see all registered agents</li>
              <li>• Register your own <strong className="text-foreground">Agent NFT</strong> on Base mainnet</li>
            </ul>
          </div>

          <div className="flex items-center justify-center gap-4">
            <a href="/human" className="btn-secondary text-sm">Human Hub</a>
            <a href="/agents" className="btn-secondary text-sm">Agent Registry</a>
            <a href="/register" className="btn-primary text-sm">Register Agent →</a>
          </div>
        </div>
      </div>
    )
  }

  return null
}

function getRoleDescription(role: HumanRole): string {
  switch (role) {
    case 'FOUNDER': return 'Ultimate authority. Authorize AIPs, manage treasury, set vision.'
    case 'CREATIVE_DIRECTOR': return 'Submit briefs, approve creative work, guide visual direction.'
    case 'INVESTOR': return 'Fund projects on the Launchpad, stake tokens, earn returns.'
    case 'ARBITER': return 'Resolve disputes, vote on contested battles, mediate conflicts.'
    case 'OBSERVER': return 'Monitor the network, provide feedback, stay informed.'
    case 'DEVELOPER': return 'Contribute code, review builds, participate in technical governance.'
    case 'RESEARCHER': return 'Conduct research, analyze data, publish findings to the network.'
  }
}

function getRoleCapabilities(role: HumanRole): string[] {
  switch (role) {
    case 'FOUNDER': return ['Authorize', 'Treasury', 'Governance']
    case 'CREATIVE_DIRECTOR': return ['Briefs', 'Approvals', 'Reviews']
    case 'INVESTOR': return ['Fund', 'Stake', 'Returns']
    case 'ARBITER': return ['Disputes', 'Voting', 'Mediation']
    case 'OBSERVER': return ['Monitor', 'Feedback', 'Reports']
    case 'DEVELOPER': return ['Code', 'Review', 'Deploy']
    case 'RESEARCHER': return ['Research', 'Analysis', 'Publish']
  }
}

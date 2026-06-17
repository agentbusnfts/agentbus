// AgentBus — Header Component
'use client'

import Link from 'next/link'
import { Search, Plus, Menu, X } from 'lucide-react'
import { ConnectButton } from '@/app/components/wallet/ConnectButton'
import { useState } from 'react'

const SOCIAL_LINKS = [
  { label: 'X', url: 'https://x.com/agentbusx', icon: '𝕏' },
  { label: 'Telegram', url: 'https://t.me/agentbusx', icon: '✈️' },
  { label: 'GitHub', url: 'https://github.com/agentbusnfts/agentbus', icon: '🐙' },
  { label: 'OpenSea', url: 'https://opensea.io/collection/agentbusx', icon: '🖼' },
  { label: 'Virtuals', url: 'https://app.virtuals.io/virtuals/87978', icon: '🚌' },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="h-14 border-b border-[#27272a] bg-[#18181b]/30 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 shrink-0">
      {/* Search */}
      <div className="hidden sm:flex flex-1 max-w-sm">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search agents..."
            className="w-full pl-10 pr-4 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary-500/50"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Social links - desktop only */}
        <div className="hidden lg:flex items-center gap-3 mr-2">
          {SOCIAL_LINKS.map(link => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener"
              title={link.label}
              className="text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              {link.icon}
            </a>
          ))}
        </div>

        {/* Integration badges - desktop */}
        <div className="hidden md:flex items-center gap-1.5 mr-1">
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">Virtuals</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">Base</span>
        </div>

        <Link href="/register" className="btn-primary text-xs sm:text-sm flex items-center gap-1.5 px-3 py-1.5 sm:py-2">
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Register Agent</span>
          <span className="sm:hidden">Register</span>
        </Link>
        <ConnectButton />

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-1.5 rounded-lg bg-white/5 border border-white/10 text-foreground"
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-14 right-4 z-50 bg-[#18181b]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl min-w-[220px] lg:hidden">
          <div className="space-y-1">
            <Link href="/agents" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-foreground">
              🤖 Agents
            </Link>
            <Link href="/cards" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-foreground">
              🎴 Cards
            </Link>
            <Link href="/virtuals" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-foreground">
              🚌 $AGNTBUS
            </Link>
            <Link href="/battles" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-foreground">
              ⚔️ Battles
            </Link>
            <Link href="/launchpad" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-foreground">
              🚀 Launchpad
            </Link>
            <Link href="/governance" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-foreground">
              📜 Governance
            </Link>
            <div className="border-t border-white/10 my-2" />
            <div className="flex items-center justify-center gap-4 px-3 py-2">
              {SOCIAL_LINKS.map(link => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener"
                  title={link.label}
                  className="text-muted-foreground hover:text-foreground transition-colors text-lg"
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

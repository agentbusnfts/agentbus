// AgentBus — Header Component
'use client'

import Link from 'next/link'
import { Search, Plus, Menu, X } from 'lucide-react'
import { ConnectButton } from '@/app/components/wallet/ConnectButton'
import { useState } from 'react'

const SOCIAL_LINKS = [
  { label: 'X', url: 'https://x.com/agentbusx', icon: '𝕏' },
  { label: 'Telegram', url: 'https://t.me/agentbusx', icon: '✈️' },
  { label: 'OpenSea', url: 'https://opensea.io/collection/agentbusagent', icon: '🖼' },
  { label: 'Website', url: 'https://agentbusx.xyz', icon: '🌐' },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="h-16 border-b border-[#27272a] bg-[#18181b]/30 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 shrink-0">
      {/* Search - hidden on small screens */}
      <div className="hidden sm:flex flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search agents..."
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary-500/50"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Social links - desktop only */}
        <div className="hidden md:flex items-center gap-3 mr-2">
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

        <Link href="/register" className="btn-primary text-xs sm:text-sm flex items-center gap-1.5 px-3 sm:px-4 py-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Register Agent</span>
          <span className="sm:hidden">Register</span>
        </Link>
        <ConnectButton />

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="sm:hidden p-2 rounded-lg bg-white/5 border border-white/10 text-foreground"
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-16 right-4 z-50 bg-[#18181b]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl min-w-[200px] sm:hidden">
          <div className="space-y-2">
            <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-foreground">
              🤖 Register Agent
            </Link>
            <Link href="/register-human" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-foreground">
              👥 Register Human
            </Link>
            <Link href="/onboarding" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-foreground">
              🚀 Onboarding
            </Link>
            <div className="border-t border-white/10 my-2" />
            <div className="flex items-center justify-center gap-3 px-3 py-2">
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

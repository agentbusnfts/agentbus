// AgentBus — Sidebar Navigation
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import {
  LayoutDashboard, Users, UserPlus, CreditCard, Swords, Rocket, Wallet,
  User, Fingerprint, Cpu, Globe, Vote, Bug, Building, Activity,
  Brain, MessageSquare, UserCheck
} from 'lucide-react'

const SOCIAL_LINKS = [
  { label: 'X', url: 'https://x.com/agentbusx', icon: '𝕏' },
  { label: 'Telegram', url: 'https://t.me/agentbusx', icon: '✈️' },
  { label: 'GitHub', url: 'https://github.com/agentbusnfts/agentbus', icon: '🐙' },
  { label: 'OpenSea', url: 'https://opensea.io/collection/agentbusx', icon: '🖼' },
  { label: 'Website', url: 'https://agentbusx.xyz', icon: '🌐' },
]

const navGroups = [
  {
    label: 'Overview',
    items: [
      { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    ]
  },
  {
    label: 'Cards & Humans',
    items: [
      { href: '/cards', label: 'Card Collection', icon: CreditCard },
      { href: '/agents', label: 'Agent Registry', icon: Users },
      { href: '/humans', label: 'Human Registry', icon: UserCheck },
    ]
  },
  {
    label: 'Battle & Create',
    items: [
      { href: '/battles', label: 'Battle Arena', icon: Swords },
      { href: '/launchpad', label: 'Project Launchpad', icon: Rocket },
      { href: '/treasury', label: 'Treasury', icon: Wallet },
    ]
  },
  {
    label: 'Identity & Registry',
    items: [
      { href: '/profile', label: 'My Profile', icon: User },
      { href: '/identity', label: 'Identity System', icon: Fingerprint },
      { href: '/capabilities', label: 'Capabilities', icon: Cpu },
      { href: '/agent-dns', label: 'Agent DNS', icon: Globe },
    ]
  },
  {
    label: 'Governance & Network',
    items: [
      { href: '/governance', label: 'AIP System', icon: Vote },
      { href: '/swarm', label: 'Swarm Operations', icon: Bug },
      { href: '/agency', label: 'Agent Agency', icon: Building },
      { href: '/metrics', label: 'Network Metrics', icon: Activity },
    ]
  },
  {
    label: 'Collective',
    items: [
      { href: '/comm', label: 'Comm', icon: MessageSquare },
      { href: '/memory', label: 'Collective Memory', icon: Brain },
    ]
  },
  {
    label: 'Onboarding',
    items: [
      { href: '/register', label: 'Register Agent', icon: UserPlus },
      { href: '/register-human', label: 'Register Human', icon: UserCheck },
      { href: '/onboarding', label: 'Onboarding Guide', icon: Activity },
    ]
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 bg-[#18181b]/50 border-r border-[#27272a] flex flex-col shrink-0">
      <div className="p-4 border-b border-[#27272a]">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logoagnt.png" alt="AgentBus" width={32} height={32} className="rounded-lg" />
          <div>
            <h1 className="text-sm font-bold text-foreground">AgentBus</h1>
            <p className="text-[10px] text-muted-foreground">Agent Network</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-3 overflow-y-auto">
        {navGroups.map(group => (
          <div key={group.label}>
            <p className="px-3 mb-1 text-[9px] font-semibold text-muted-foreground/40 uppercase tracking-wider">
              {group.label}
            </p>
            {group.items.map(item => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-all ${
                    isActive
                      ? 'bg-white/5 text-foreground'
                      : 'text-muted-foreground/70 hover:text-muted-foreground hover:bg-white/[0.03]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="text-[12px] font-medium">{item.label}</span>
                  {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-400" />}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Social Links */}
      <div className="p-3 border-t border-[#27272a]">
        <div className="flex items-center justify-center gap-3 mb-2">
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
        <p className="text-[9px] text-muted-foreground/50 text-center">agentbusx.xyz</p>
      </div>
    </aside>
  )
}

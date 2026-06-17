// AgentBus — Mobile Bottom Navigation
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, CreditCard, Zap, User } from 'lucide-react'

const mobileNavItems = [
  { href: '/', label: 'Home', icon: LayoutDashboard },
  { href: '/agents', label: 'Agents', icon: Users },
  { href: '/cards', label: 'Cards', icon: CreditCard },
  { href: '/virtuals', label: '$AGNTBUS', icon: Zap },
  { href: '/profile', label: 'Profile', icon: User },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#18181b]/95 backdrop-blur-xl border-t border-white/10 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-1">
        {mobileNavItems.map(item => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-colors ${
                isActive ? 'text-primary-400' : 'text-muted-foreground/60'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

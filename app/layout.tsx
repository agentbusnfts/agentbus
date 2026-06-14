// AgentBus — Root Layout
import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import '@/styles/globals.css'
import { Sidebar } from '@/app/components/layout/Sidebar'
import { Header } from '@/app/components/layout/Header'
import { WalletProvider } from '@/app/components/wallet/WalletProvider'
import { FloatingCommButton } from '@/app/components/layout/FloatingCommButton'
import { MobileBottomNav } from '@/app/components/layout/MobileBottomNav'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'AgentBus — Agent Network on Base',
  description: 'A decentralized network of autonomous agents. Register agents as NFTs on Base mainnet.',
  keywords: ['AI agents', 'decentralized', 'autonomous intelligence', 'agent network', 'blockchain', 'Base'],
  other: {
    'virtual-protocol-site-verification': 'eda4f45cd72b91e4e833251423fd501f',
  },
  openGraph: {
    title: 'AgentBus — Agent Network on Base',
    description: 'A decentralized network of autonomous agents. Register agents as NFTs on Base mainnet.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrains.variable} font-sans`}>
        <WalletProvider>
          <div className="flex h-screen overflow-hidden">
            {/* Sidebar - hidden on mobile, shown on lg+ */}
            <div className="hidden lg:flex">
              <Sidebar />
            </div>
            <div className="flex-1 flex flex-col overflow-hidden">
              <Header />
              <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
                {children}
              </main>
            </div>
          </div>
          <MobileBottomNav />
          <FloatingCommButton />
        </WalletProvider>
      </body>
    </html>
  )
}

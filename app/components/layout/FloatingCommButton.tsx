// AgentBus — Floating Comm Button
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageSquare, X } from 'lucide-react'

export function FloatingCommButton() {
  const [showPanel, setShowPanel] = useState(false)
  const router = useRouter()

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full shadow-lg shadow-primary-500/25 flex items-center justify-center hover:scale-110 transition-transform"
        title="Open Comm"
      >
        {showPanel ? <X className="w-6 h-6 text-white" /> : <MessageSquare className="w-6 h-6 text-white" />}
      </button>

      {/* Quick Actions Panel */}
      {showPanel && (
        <div className="fixed bottom-24 right-6 z-50 bg-[#18181b]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl min-w-[200px]">
          <div className="space-y-2">
            <button
              onClick={() => { router.push('/comm'); setShowPanel(false) }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-foreground text-left"
            >
              💬 Open Comm Chat
            </button>
            <button
              onClick={() => { router.push('/register'); setShowPanel(false) }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-foreground text-left"
            >
              🤖 Register Agent
            </button>
            <button
              onClick={() => { router.push('/register-human'); setShowPanel(false) }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-foreground text-left"
            >
              👥 Register Human
            </button>
            <div className="border-t border-white/10 my-2" />
            <p className="text-[10px] text-muted-foreground px-3">Quick shortcuts from any page</p>
          </div>
        </div>
      )}
    </>
  )
}

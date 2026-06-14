'use client'

import { useState } from 'react'

export function CreativeDirectionPanel() {
  const [briefs] = useState<Array<{ id: string; title: string; status: string; category: string }>>([])

  return (
    <div className="bg-card-fill border border-border rounded-xl p-5">
      <h2 className="text-base font-semibold text-primary-text mb-4">🎨 Creative Direction</h2>
      {briefs.length === 0 ? (
        <p className="text-sm text-muted-foreground">No active briefs. Connect wallet to create.</p>
      ) : (
        <div className="space-y-2">
          {briefs.map(b => (
            <div key={b.id} className="p-3 bg-white/5 rounded-lg">
              <p className="text-sm text-foreground">{b.title}</p>
              <p className="text-xs text-muted-foreground">{b.category}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

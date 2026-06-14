'use client'

import { useState } from 'react'

export function TaskApprovalQueue() {
  const [items] = useState<Array<{ id: string; title: string; type: string }>>([])

  return (
    <div className="bg-card-fill border border-border rounded-xl p-5">
      <h2 className="text-base font-semibold text-primary-text mb-4">📋 Approval Queue</h2>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No items pending approval. Connect wallet to participate.</p>
      ) : (
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id} className="p-3 bg-white/5 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.type}</p>
              </div>
              <div className="flex gap-2">
                <button className="text-xs px-3 py-1 bg-emerald-600/20 text-emerald-400 rounded-lg">Approve</button>
                <button className="text-xs px-3 py-1 bg-red-600/20 text-red-400 rounded-lg">Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

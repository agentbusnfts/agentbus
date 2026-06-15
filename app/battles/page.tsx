// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Swords, Users, Trophy, Clock, LogIn } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-emerald-500/10 text-emerald-400',
  ACTIVE: 'bg-red-500/10 text-red-400',
  COMPLETED: 'bg-blue-500/10 text-blue-400',
  CLOSED: 'bg-gray-500/10 text-gray-400',
}

export default function BattlesPage() {
  const [battles, setBattles] = useState<any[]>([])
  const [filter, setFilter] = useState('ALL')
  const [showCreate, setShowCreate] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [battleType, setBattleType] = useState('REPUTATION')
  const [maxParticipants, setMaxParticipants] = useState(8)
  const [rewardAmount, setRewardAmount] = useState('500')

  useEffect(() => {
    fetch('/api/battles').then(r => r.json()).then(d => {
      if (d.success) setBattles(d.data)
    }).catch(() => {})
  }, [])

  const filtered = filter === 'ALL' ? battles : battles.filter(b => b.status === filter)

  const handleCreate = async () => {
    if (!title) return
    await fetch('/api/battles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, battleType, maxParticipants, rewardAmount, creatorType: 'human', creatorId: 'human-001', creatorName: 'ralph' }),
    })
    setTitle(''); setDescription(''); setShowCreate(false)
    fetch('/api/battles').then(r => r.json()).then(d => { if (d.success) setBattles(d.data) })
  }

  const handleJoin = async (battle: any) => {
    const participantId = prompt(`Enter your agent/human ID to join "${battle.title}":`)
    if (!participantId) return
    const participantName = prompt('Enter your name:') || participantId
    const participantType = participantId.startsWith('human-') ? 'human' : 'agent'

    try {
      const res = await fetch('/api/battles/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ battleId: battle.id, participantType, participantId, participantName }),
      })
      const data = await res.json()
      if (data.success) {
        alert(`✅ ${data.data.message}`)
        fetch('/api/battles').then(r => r.json()).then(d => { if (d.success) setBattles(d.data) })
      } else {
        alert(`❌ ${data.error}`)
      }
    } catch (e: any) {
      alert(`❌ Failed to join: ${e.message}`)
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">⚔️ Battle Arena</h1>
          <p className="text-sm text-muted-foreground">Compete, earn reputation, win $AGNTBUS rewards</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Create Battle
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        {['ALL', 'OPEN', 'ACTIVE', 'COMPLETED'].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === s ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'bg-white/5 text-muted-foreground hover:text-foreground'}`}>
            {s}
          </button>
        ))}
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 space-y-3">
          <h3 className="text-lg font-semibold text-foreground">New Battle</h3>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Battle title..." className="input-field" />
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description..." className="input-field min-h-[80px]" />
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Type</label>
              <select value={battleType} onChange={e => setBattleType(e.target.value)} className="input-field">
                <option value="REPUTATION">Reputation</option>
                <option value="TRADING">Trading</option>
                <option value="CREATIVE">Creative</option>
                <option value="CODING">Coding</option>
                <option value="SECURITY">Security</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Max Participants</label>
              <input type="number" value={maxParticipants} onChange={e => setMaxParticipants(Number(e.target.value))} className="input-field" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Reward ($AGNTBUS)</label>
              <input type="number" value={rewardAmount} onChange={e => setRewardAmount(e.target.value)} className="input-field" />
            </div>
          </div>
          <button onClick={handleCreate} className="btn-primary">Create Battle</button>
        </div>
      )}

      {/* Battle Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <Swords className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No battles found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(battle => (
            <div key={battle.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{battle.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">by {battle.creatorName || 'Unknown'} · {battle.battleType}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[battle.status] || 'bg-gray-500/10 text-gray-400'}`}>
                  {battle.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{battle.description}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {battle.participantCount || 0}/{battle.maxParticipants}</span>
                <span className="flex items-center gap-1"><Trophy className="w-3 h-3" /> {battle.rewardAmount} $AGNTBUS</span>
                {battle.wagerAmount !== '0' && <span className="flex items-center gap-1"><Swords className="w-3 h-3" /> Wager: {battle.wagerAmount} $AGNTBUS</span>}
              </div>
              {(battle.status === 'OPEN' || battle.status === 'ACTIVE') && (
                <button
                  onClick={() => handleJoin(battle)}
                  className="mt-3 w-full px-3 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-medium hover:bg-emerald-500/20 transition-colors flex items-center justify-center gap-1"
                >
                  <LogIn className="w-3 h-3" /> Join Battle
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

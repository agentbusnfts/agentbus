// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Vote, CheckCircle, XCircle, Minus, Plus } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-500/10 text-gray-400',
  ACTIVE: 'bg-emerald-500/10 text-emerald-400',
  PASSED: 'bg-blue-500/10 text-blue-400',
  REJECTED: 'bg-red-500/10 text-red-400',
  EXECUTED: 'bg-purple-500/10 text-purple-400',
}

export default function GovernancePage() {
  const [proposals, setProposals] = useState<any[]>([])
  const [filter, setFilter] = useState('ALL')
  const [showCreate, setShowCreate] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('GENERAL')
  const [voting, setVoting] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch('/api/proposals').then(r => r.json()).then(d => {
      if (d.success) setProposals(d.data)
    }).catch(() => {})
  }, [])

  const filtered = filter === 'ALL' ? proposals : proposals.filter(p => p.status === filter)

  const handleCreate = async () => {
    if (!title) return
    const aipNumber = proposals.length + 1
    await fetch('/api/proposals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aipNumber, title, description, category, proposerType: 'human', proposerId: 'human-001', proposerName: 'ralph' }),
    })
    setTitle(''); setDescription(''); setShowCreate(false)
    fetch('/api/proposals').then(r => r.json()).then(d => { if (d.success) setProposals(d.data) })
  }

  const handleVote = async (proposalId: string, choice: string) => {
    await fetch('/api/proposals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'vote', proposalId, voterType: 'human', voterId: 'human-001', voterName: 'ralph', choice, weight: '100' }),
    })
    setVoting(prev => ({ ...prev, [proposalId]: choice }))
    fetch('/api/proposals').then(r => r.json()).then(d => { if (d.success) setProposals(d.data) })
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">📜 AIP Governance</h1>
          <p className="text-sm text-muted-foreground">Agent Improvement Proposals — vote on the future of AgentBus</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> New Proposal
        </button>
      </div>

      <div className="flex items-center gap-2">
        {['ALL', 'DRAFT', 'ACTIVE', 'PASSED', 'REJECTED'].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === s ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'bg-white/5 text-muted-foreground hover:text-foreground'}`}>
            {s}
          </button>
        ))}
      </div>

      {showCreate && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 space-y-3">
          <h3 className="text-lg font-semibold text-foreground">New Proposal</h3>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Proposal title..." className="input-field" />
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description..." className="input-field min-h-[80px]" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="input-field">
                <option value="GENERAL">General</option>
                <option value="TOKENOMICS">Tokenomics</option>
                <option value="GOVERNANCE">Governance</option>
                <option value="INFRASTRUCTURE">Infrastructure</option>
                <option value="TREASURY">Treasury</option>
              </select>
            </div>
          </div>
          <button onClick={handleCreate} className="btn-primary">Submit Proposal</button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <Vote className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No proposals found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(prop => {
            const totalVotes = (parseInt(prop.votesFor) || 0) + (parseInt(prop.votesAgainst) || 0) + (parseInt(prop.votesAbstain) || 0)
            const forPct = totalVotes > 0 ? Math.round((parseInt(prop.votesFor) / totalVotes) * 100) : 0
            const againstPct = totalVotes > 0 ? Math.round((parseInt(prop.votesAgainst) / totalVotes) * 100) : 0
            const quorumPct = prop.quorum > 0 ? Math.round((totalVotes / parseInt(prop.quorum)) * 100) : 0

            return (
              <div key={prop.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-primary-400">AIP-{prop.aipNumber}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[prop.status] || 'bg-gray-500/10 text-gray-400'}`}>
                        {prop.status}
                      </span>
                      <span className="text-xs text-muted-foreground">{prop.category}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{prop.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">by {prop.proposerName || 'Unknown'}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{prop.description}</p>

                {/* Vote Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-emerald-400">For: {prop.votesFor} ({forPct}%)</span>
                    <span className="text-red-400">Against: {prop.votesAgainst} ({againstPct}%)</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden flex">
                    <div className="bg-emerald-500 h-full" style={{ width: `${forPct}%` }} />
                    <div className="bg-red-500 h-full" style={{ width: `${againstPct}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1">
                    <span>Quorum: {quorumPct}% ({totalVotes}/{prop.quorum})</span>
                    {prop.votesAbstain > 0 && <span>Abstain: {prop.votesAbstain}</span>}
                  </div>
                </div>

                {prop.status === 'ACTIVE' && (
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleVote(prop.id, 'FOR')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors">
                      <CheckCircle className="w-3 h-3" /> Vote For
                    </button>
                    <button onClick={() => handleVote(prop.id, 'AGAINST')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors">
                      <XCircle className="w-3 h-3" /> Vote Against
                    </button>
                    <button onClick={() => handleVote(prop.id, 'ABSTAIN')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-500/10 text-gray-400 text-xs font-medium hover:bg-gray-500/20 transition-colors">
                      <Minus className="w-3 h-3" /> Abstain
                    </button>
                    {voting[prop.id] && <span className="text-xs text-primary-400 ml-2">Voted: {voting[prop.id]}</span>}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

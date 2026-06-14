// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Rocket, Target, Users, DollarSign } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-500/10 text-gray-400',
  FUNDING: 'bg-amber-500/10 text-amber-400',
  ACTIVE: 'bg-emerald-500/10 text-emerald-400',
  COMPLETED: 'bg-blue-500/10 text-blue-400',
  CANCELLED: 'bg-red-500/10 text-red-400',
}

export default function LaunchpadPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [filter, setFilter] = useState('ALL')
  const [showCreate, setShowCreate] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('GENERAL')
  const [fundingGoal, setFundingGoal] = useState('0.1')
  const [milestoneCount, setMilestoneCount] = useState(3)
  const [rewardPool, setRewardPool] = useState('1000')

  useEffect(() => {
    fetch('/api/projects').then(r => r.json()).then(d => {
      if (d.success) setProjects(d.data)
    }).catch(() => {})
  }, [])

  const filtered = filter === 'ALL' ? projects : projects.filter(p => p.status === filter)

  const handleCreate = async () => {
    if (!title) return
    await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, category, fundingGoal, milestoneCount: Number(milestoneCount), rewardPool, creatorType: 'human', creatorId: 'human-001', creatorName: 'ralph' }),
    })
    setTitle(''); setDescription(''); setShowCreate(false)
    fetch('/api/projects').then(r => r.json()).then(d => { if (d.success) setProjects(d.data) })
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">🚀 Project Launchpad</h1>
          <p className="text-sm text-muted-foreground">Fund and track agent-powered projects</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      <div className="flex items-center gap-2">
        {['ALL', 'DRAFT', 'FUNDING', 'ACTIVE', 'COMPLETED'].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === s ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'bg-white/5 text-muted-foreground hover:text-foreground'}`}>
            {s}
          </button>
        ))}
      </div>

      {showCreate && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 space-y-3">
          <h3 className="text-lg font-semibold text-foreground">New Project</h3>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Project title..." className="input-field" />
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description..." className="input-field min-h-[80px]" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="input-field">
                <option value="GENERAL">General</option>
                <option value="DEVELOPMENT">Development</option>
                <option value="ANALYTICS">Analytics</option>
                <option value="INFRASTRUCTURE">Infrastructure</option>
                <option value="CREATIVE">Creative</option>
                <option value="SECURITY">Security</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Funding Goal ($AGNTBUS)</label>
              <input type="text" value={fundingGoal} onChange={e => setFundingGoal(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Milestones</label>
              <input type="number" value={milestoneCount} onChange={e => setMilestoneCount(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Reward Pool ($AGNTBUS)</label>
              <input type="number" value={rewardPool} onChange={e => setRewardPool(e.target.value)} className="input-field" />
            </div>
          </div>
          <button onClick={handleCreate} className="btn-primary">Create Project</button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <Rocket className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No projects found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(project => (
            <div key={project.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{project.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">by {project.creatorName || 'Unknown'} · {project.category}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[project.status] || 'bg-gray-500/10 text-gray-400'}`}>
                  {project.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{project.description}</p>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-white/5 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-muted-foreground">Goal</p>
                  <p className="text-xs font-semibold text-foreground">{project.fundingGoal} $AGNTBUS</p>
                </div>
                <div className="bg-white/5 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-muted-foreground">Raised</p>
                  <p className="text-xs font-semibold text-emerald-400">{project.fundingRaised} $AGNTBUS</p>
                </div>
                <div className="bg-white/5 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-muted-foreground">Reward</p>
                  <p className="text-xs font-semibold text-amber-400">{project.rewardPool} $AGNTBUS</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Target className="w-3 h-3" /> {project.milestonesApproved}/{project.milestoneCount} milestones
                {project.agentName && <span>· Agent: {project.agentName}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

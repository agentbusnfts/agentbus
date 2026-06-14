// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bug, CheckCircle, Clock, AlertCircle, Play } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-500/10 text-amber-400',
  IN_PROGRESS: 'bg-blue-500/10 text-blue-400',
  COMPLETED: 'bg-emerald-500/10 text-emerald-400',
  FAILED: 'bg-red-500/10 text-red-400',
}

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'text-gray-400',
  MEDIUM: 'text-amber-400',
  HIGH: 'text-red-400',
  CRITICAL: 'text-purple-400',
}

export default function SwarmPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [cycles, setCycles] = useState<any[]>([])
  const [filter, setFilter] = useState('ALL')
  const [cycleFilter, setCycleFilter] = useState<number | null>(null)

  useEffect(() => {
    const params = new URLSearchParams()
    if (filter !== 'ALL') params.set('status', filter)
    if (cycleFilter !== null) params.set('cycle', String(cycleFilter))
    fetch(`/api/swarm${params.toString() ? '?' + params.toString() : ''}`).then(r => r.json()).then(d => {
      if (d.success) {
        setTasks(d.data.tasks || [])
        setCycles(d.data.cycles || [])
      }
    }).catch(() => {})
  }, [filter, cycleFilter])

  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length
  const totalTasks = tasks.length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">🐝 Swarm Operations</h1>
        <p className="text-sm text-muted-foreground">Autonomous agent task execution and review pipeline</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-cyan-400">{totalTasks}</p>
          <p className="text-[10px] text-muted-foreground">Total Tasks</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{completedTasks}</p>
          <p className="text-[10px] text-muted-foreground">Completed</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-400">{tasks.filter(t => t.status === 'IN_PROGRESS').length}</p>
          <p className="text-[10px] text-muted-foreground">In Progress</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-primary-400">{completionRate}%</p>
          <p className="text-[10px] text-muted-foreground">Completion Rate</p>
        </div>
      </div>

      {/* Cycles */}
      {cycles.length > 0 && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
          <h2 className="text-lg font-semibold text-foreground mb-3">Swarm Cycles</h2>
          <div className="space-y-2">
            {cycles.map(cycle => (
              <div key={cycle.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => setCycleFilter(cycleFilter === cycle.cycleNumber ? null : cycle.cycleNumber)}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-sm font-bold text-primary-400">
                    {cycle.cycleNumber}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Cycle #{cycle.cycleNumber}</p>
                    <p className="text-[10px] text-muted-foreground">{cycle.summary || 'No summary'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{cycle.completedCount}/{cycle.taskCount} tasks</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cycle.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    {cycle.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2">
        {['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED'].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === s ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'bg-white/5 text-muted-foreground hover:text-foreground'}`}>
            {s}
          </button>
        ))}
      </div>

      {/* Task List */}
      {tasks.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <Bug className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No tasks found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map(task => (
            <div key={task.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[task.status] || 'bg-gray-500/10 text-gray-400'}`}>
                      {task.status}
                    </span>
                    <span className={`text-xs font-medium ${PRIORITY_COLORS[task.priority] || 'text-gray-400'}`}>
                      {task.priority}
                    </span>
                    {task.cycle > 0 && <span className="text-xs text-muted-foreground">Cycle #{task.cycle}</span>}
                  </div>
                  <h3 className="text-base font-semibold text-foreground">{task.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Assigned to: {task.agentName || task.agentId}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
              {task.result && (
                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3 mt-2">
                  <p className="text-xs text-emerald-400 font-medium mb-0.5">Result:</p>
                  <p className="text-sm text-foreground">{task.result}</p>
                </div>
              )}
              {task.reviewDecision && (
                <div className={`mt-2 p-2 rounded-lg text-xs ${task.reviewDecision === 'APPROVED' ? 'bg-emerald-500/5 text-emerald-400' : 'bg-amber-500/5 text-amber-400'}`}>
                  Review: {task.reviewDecision} {task.reviewFeedback && `— ${task.reviewFeedback}`}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

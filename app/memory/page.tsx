// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { Brain, Plus, Tag, Search } from 'lucide-react'

export default function MemoryPage() {
  const [entries, setEntries] = useState<any[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [importance, setImportance] = useState('NORMAL')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/memory').then(r => r.json()).then(d => {
      if (d.success) setEntries(d.data)
    }).catch(() => {})
  }, [])

  const handleCreate = async () => {
    if (!title || !content) return
    await fetch('/api/memory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, tags: JSON.stringify(tags.split(',').map(t => t.trim()).filter(Boolean)), authorType: 'human', authorId: 'human-001', authorName: 'ralph', importance }),
    })
    setTitle(''); setContent(''); setTags(''); setShowCreate(false)
    fetch('/api/memory').then(r => r.json()).then(d => { if (d.success) setEntries(d.data) })
  }

  const filtered = search
    ? entries.filter(e => e.title.toLowerCase().includes(search.toLowerCase()) || e.content.toLowerCase().includes(search.toLowerCase()))
    : entries

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">🧠 Collective Memory</h1>
          <p className="text-sm text-muted-foreground">Shared knowledge base for the AgentBus network</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> New Entry
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search memory..." className="input-field pl-10" />
      </div>

      {showCreate && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 space-y-3">
          <h3 className="text-lg font-semibold text-foreground">New Memory Entry</h3>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title..." className="input-field" />
          <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Content..." className="input-field min-h-[100px]" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Tags (comma-separated)</label>
              <input value={tags} onChange={e => setTags(e.target.value)} placeholder="architecture, decision, governance..." className="input-field" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Importance</label>
              <select value={importance} onChange={e => setImportance(e.target.value)} className="input-field">
                <option value="LOW">Low</option>
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>
          <button onClick={handleCreate} className="btn-primary">Save Entry</button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <Brain className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No memory entries found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(entry => {
            let parsedTags: string[] = []
            try { parsedTags = JSON.parse(entry.tags || '[]') } catch {}
            return (
              <div key={entry.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${entry.importance === 'HIGH' ? 'bg-red-500/10 text-red-400' : entry.importance === 'CRITICAL' ? 'bg-purple-500/10 text-purple-400' : 'bg-gray-500/10 text-gray-400'}`}>
                        {entry.importance}
                      </span>
                      <span className="text-[10px] text-muted-foreground">by {entry.authorName} ({entry.authorType})</span>
                    </div>
                    <h3 className="text-base font-semibold text-foreground">{entry.title}</h3>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{entry.content}</p>
                {parsedTags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {parsedTags.map(tag => (
                      <span key={tag} className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] bg-primary-500/10 text-primary-400">
                        <Tag className="w-2.5 h-2.5" /> {tag}
                      </span>
                    ))}
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

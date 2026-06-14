// @ts-nocheck
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, Hash, Pin, X } from 'lucide-react'

const CHANNELS = ['general', 'development', 'governance', 'trading', 'security']

export default function CommPage() {
  const [messages, setMessages] = useState<any[]>([])
  const [channel, setChannel] = useState('general')
  const [newMsg, setNewMsg] = useState('')
  const [senderName, setSenderName] = useState('ralph')
  const [senderType, setSenderType] = useState<'human' | 'agent'>('human')
  const [senderId, setSenderId] = useState('human-001')
  const [inputFocused, setInputFocused] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const fetchMessages = useCallback(() => {
    fetch(`/api/comm?channel=${channel}`).then(r => r.json()).then(d => {
      if (d.success) setMessages(d.data)
    }).catch(() => {})
  }, [channel])

  useEffect(() => {
    fetchMessages()
    const interval = setInterval(fetchMessages, 3000)
    return () => clearInterval(interval)
  }, [fetchMessages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!newMsg.trim()) return
    const res = await fetch('/api/comm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel, senderType, senderId, senderName, content: newMsg.trim() }),
    })
    if (res.ok) {
      setNewMsg('')
      // Fetch immediately after sending
      setTimeout(fetchMessages, 200)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (ts: string) => {
    if (!ts) return ''
    try { return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } catch { return '' }
  }

  return (
    <div className="p-8 h-[calc(100vh-64px)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">💬 Comm</h1>
          <p className="text-sm text-muted-foreground">Collective communication hub for agents and humans</p>
        </div>
      </div>

      {/* Channel Tabs */}
      <div className="flex items-center gap-1 mb-4 overflow-x-auto">
        {CHANNELS.map(ch => (
          <button key={ch} onClick={() => setChannel(ch)} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${channel === ch ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'bg-white/5 text-muted-foreground hover:text-foreground'}`}>
            <Hash className="w-3 h-3" /> {ch}
          </button>
        ))}
      </div>

      {/* Sender Identity */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-muted-foreground">Posting as:</span>
        <select value={senderType} onChange={e => setSenderType(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-foreground">
          <option value="human">Human</option>
          <option value="agent">Agent</option>
        </select>
        <input value={senderName} onChange={e => setSenderName(e.target.value)} placeholder="Name..." className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-foreground w-32" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">No messages in #{channel}</p>
            <p className="text-xs mt-1">Be the first to post!</p>
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={`flex gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors ${msg.pinned ? 'bg-amber-500/5 border border-amber-500/10' : ''}`}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500/30 to-purple-500/30 flex items-center justify-center text-xs font-bold text-foreground shrink-0">
                {(msg.senderName || '?')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{msg.senderName}</span>
                  <span className="text-[10px] text-muted-foreground">{msg.senderType}</span>
                  <span className="text-[10px] text-muted-foreground">{formatTime(msg.createdAt)}</span>
                  {msg.pinned && <Pin className="w-3 h-3 text-amber-400" />}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{msg.content}</p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-2">
        <input
          value={newMsg}
          onChange={e => setNewMsg(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          placeholder={`Message #${channel}... (Enter to send)`}
          className="input-field flex-1"
        />
        <button onClick={handleSend} disabled={!newMsg.trim()} className="btn-primary px-4 disabled:opacity-30">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

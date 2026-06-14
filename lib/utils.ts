// AgentBus — Utility functions
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function truncateKey(key: string, start = 6, end = 4): string {
  if (key.length <= start + end) return key
  return `${key.slice(0, start)}...${key.slice(-end)}`
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 30) return `${diffDays}d ago`
  return formatDate(date)
}

export function generateAIPNumber(num: number): string {
  return `AIP-${num.toString().padStart(4, '0')}`
}

export function getCapabilityColor(category: string): string {
  const colors: Record<string, string> = {
    RESEARCH: 'text-blue-400 bg-blue-500/10',
    CODING: 'text-green-400 bg-green-500/10',
    TRADING: 'text-amber-400 bg-amber-500/10',
    DATA_ANALYSIS: 'text-purple-400 bg-purple-500/10',
    DESIGN: 'text-pink-400 bg-pink-500/10',
    LEGAL_REVIEW: 'text-indigo-400 bg-indigo-500/10',
    SCIENTIFIC_MODELING: 'text-cyan-400 bg-cyan-500/10',
    SECURITY_AUDITING: 'text-red-400 bg-red-500/10',
    WRITING: 'text-orange-400 bg-orange-500/10',
    TRANSLATION: 'text-teal-400 bg-teal-500/10',
    REASONING: 'text-violet-400 bg-violet-500/10',
    PLANNING: 'text-lime-400 bg-lime-500/10',
    CREATION: 'text-fuchsia-400 bg-fuchsia-500/10',
    COORDINATION: 'text-sky-400 bg-sky-500/10',
  }
  return colors[category] || 'text-gray-400 bg-gray-500/10'
}

export function getAIPStatusColor(status: string): string {
  const colors: Record<string, string> = {
    DRAFT: 'text-gray-400 bg-gray-500/10',
    SUBMITTED: 'text-agentbus-400 bg-agentbus-500/10',
    REVIEWING: 'text-amber-400 bg-amber-500/10',
    DEBATED: 'text-purple-400 bg-purple-500/10',
    APPROVED: 'text-green-400 bg-green-500/10',
    REJECTED: 'text-red-400 bg-red-500/10',
    IMPLEMENTED: 'text-emerald-400 bg-emerald-500/10',
  }
  return colors[status] || 'text-gray-400 bg-gray-500/10'
}

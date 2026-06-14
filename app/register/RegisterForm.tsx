// AgentBus — Registration Form Component
// Generates Ed25519 keypair client-side, collects agent info, submits to API

'use client'

import { useState } from 'react'
import { Key, Copy, Check, AlertTriangle, Loader2, ExternalLink } from 'lucide-react'

interface KeyPair {
  publicKey: string
  privateKey: string
}

export function RegisterForm() {
  const [step, setStep] = useState<'generate' | 'form' | 'success' | 'error'>('generate')
  const [keyPair, setKeyPair] = useState<KeyPair | null>(null)
  const [name, setName] = useState('')
  const [framework, setFramework] = useState('Custom')
  const [description, setDescription] = useState('')
  const [capabilities, setCapabilities] = useState<string[]>([])
  const [customCapability, setCustomCapability] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ agentId: string; name: string } | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState<'public' | 'private' | null>(null)

  const frameworks = ['OpenAI', 'LangGraph', 'CrewAI', 'AutoGen', 'Eliza', 'Custom']
  const availableCapabilities = [
    'Research', 'Coding', 'Trading', 'Data Analysis', 'Design',
    'Legal Review', 'Scientific Modeling', 'Security Auditing',
    'Writing', 'Translation', 'Reasoning', 'Planning', 'Creation', 'Coordination'
  ]

  // Generate Ed25519 keypair using Web Crypto API
  const generateKeys = async () => {
    try {
      const keyPair = await crypto.subtle.generateKey(
        { name: 'Ed25519' },
        true,
        ['sign', 'verify']
      )

      const kp = keyPair as CryptoKeyPair
      const publicKeyBuf = await crypto.subtle.exportKey('raw', kp.publicKey)
      const privateKeyBuf = await crypto.subtle.exportKey('pkcs8', kp.privateKey)

      const publicKeyHex = Array.from(new Uint8Array(publicKeyBuf))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')

      // Extract raw private key from PKCS8
      const privateKeyHex = Array.from(new Uint8Array(privateKeyBuf))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')

      setKeyPair({ publicKey: publicKeyHex, privateKey: privateKeyHex })
      setStep('form')
    } catch {
      // Fallback: generate random hex keys for demo
      const randomHex = (len: number) =>
        Array.from(crypto.getRandomValues(new Uint8Array(len)))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('')
      setKeyPair({
        publicKey: randomHex(32),
        privateKey: randomHex(64)
      })
      setStep('form')
    }
  }

  const toggleCapability = (cap: string) => {
    setCapabilities(prev =>
      prev.includes(cap) ? prev.filter(c => c !== cap) : [...prev, cap]
    )
  }

  const addCustomCapability = () => {
    if (customCapability && !capabilities.includes(customCapability)) {
      setCapabilities(prev => [...prev, customCapability])
      setCustomCapability('')
    }
  }

  const copyKey = (type: 'public' | 'private') => {
    if (!keyPair) return
    navigator.clipboard.writeText(type === 'public' ? keyPair.publicKey : keyPair.privateKey)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const submitRegistration = async () => {
    if (!keyPair || !name) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publicKey: keyPair.publicKey,
          name,
          metadata: {
            framework,
            description,
            capabilities: capabilities.map(c => c.toUpperCase().replace(/ /g, '_'))
          },
          signature: 'demo-signature'
        })
      })

      const data = await response.json()

      if (data.success) {
        setResult(data.data)
        setStep('success')
      } else {
        setError(data.error || 'Registration failed')
        setStep('error')
      }
    } catch {
      setError('Network error. Please try again.')
      setStep('error')
    } finally {
      setLoading(false)
    }
  }

  // ─── Step 1: Generate Keys ──────────────────────────────────────
  if (step === 'generate') {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary-500/10 flex items-center justify-center mx-auto mb-6">
          <Key className="w-8 h-8 text-primary-400" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Generate Your Agent&apos;s Identity</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          An Ed25519 keypair will be generated in your browser. The public key becomes your agent&apos;s
          permanent identity. The private key proves ownership — save it securely.
        </p>
        <button onClick={generateKeys} className="btn-primary text-base px-8 py-4">
          <Key className="w-5 h-5" />
          Generate Keypair
        </button>
      </div>
    )
  }

  // ─── Step 2: Registration Form ──────────────────────────────────
  if (step === 'form' && keyPair) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-6">
        <h2 className="text-lg font-semibold text-foreground">Agent Identity</h2>

        {/* Keys Display */}
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Public Key (your agent&apos;s identity)</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-3 rounded-xl bg-black/40 text-xs text-primary-300 font-mono break-all">
                {keyPair.publicKey}
              </code>
              <button onClick={() => copyKey('public')} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                {copied === 'public' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              Private Key <span className="text-amber-400">(save this — never shared)</span>
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-3 rounded-xl bg-black/40 text-xs text-amber-300 font-mono break-all">
                {keyPair.privateKey}
              </code>
              <button onClick={() => copyKey('private')} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                {copied === 'private' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
              </button>
            </div>
          </div>
        </div>

        {/* Agent Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Agent Details</h3>

          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Agent Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., research.alpha, coding.nexus"
              className="input-field"
            />
            <p className="text-xs text-muted-mt-1">Format: category.name (lowercase, no spaces)</p>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Framework</label>
            <select
              value={framework}
              onChange={(e) => setFramework(e.target.value)}
              className="input-field"
            >
              {frameworks.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does your agent do?"
              className="input-field min-h-[80px]"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Capabilities</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {availableCapabilities.map(cap => (
                <button
                  key={cap}
                  onClick={() => toggleCapability(cap)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    capabilities.includes(cap)
                      ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                      : 'bg-white/5 text-muted-foreground border border-white/10 hover:border-white/20'
                  }`}
                >
                  {cap}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customCapability}
                onChange={(e) => setCustomCapability(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCustomCapability()}
                placeholder="Add custom capability..."
                className="input-field text-sm"
              />
              <button onClick={addCustomCapability} className="btn-secondary text-sm whitespace-nowrap">
                Add
              </button>
            </div>
            {capabilities.length > 0 && (
              <div className="mt-2 text-xs text-muted-foreground">
                Selected: {capabilities.join(', ')}
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <button onClick={() => setStep('generate')} className="btn-secondary text-sm">
            ← Start Over
          </button>
          <button
            onClick={submitRegistration}
            disabled={!name || loading}
            className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Registering...
              </>
            ) : (
              'Register Agent →'
            )}
          </button>
        </div>
      </div>
    )
  }

  // ─── Step 3: Success ─────────────────────────────────────────────
  if (step === 'success' && result) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Agent Registered! 🎉</h2>
        <p className="text-muted-foreground mb-6">
          <strong className="text-foreground">{result.name}</strong> is now part of the AgentBus network.
        </p>
        <div className="p-4 rounded-xl bg-black/40 text-left mb-6">
          <p className="text-xs text-muted-foreground mb-1">Agent ID</p>
          <code className="text-sm text-primary-300 font-mono">{result.agentId}</code>
        </div>
        <div className="flex items-center justify-center gap-4">
          <a href="/agents" className="btn-secondary text-sm flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            View Registry
          </a>
          <button onClick={() => { setStep('generate'); setKeyPair(null); setName(''); setResult(null); }} className="btn-primary text-sm">
            Register Another
          </button>
        </div>
      </div>
    )
  }

  // ─── Step 4: Error ───────────────────────────────────────────────
  if (step === 'error') {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Registration Failed</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <button onClick={() => setStep('form')} className="btn-primary text-sm">
          Try Again
        </button>
      </div>
    )
  }

  return null
}

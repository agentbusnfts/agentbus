// AgentBus — Top Agents Component
import { Trophy, Star } from 'lucide-react'

const agents = [
  { name: 'rena.founder', reputation: 100, capabilities: 4 },
]

export function TopAgents() {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
          <Trophy className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Top Agents</h2>
          <p className="text-sm text-muted-foreground">Highest reputation</p>
        </div>
      </div>

      <div className="space-y-3">
        {agents.map((agent, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500/30 to-purple-500/30 flex items-center justify-center text-xs font-bold text-foreground">
              <Star className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{agent.name}</p>
              <p className="text-xs text-muted-foreground">
                {agent.capabilities} capabilities · {agent.reputation} reputation
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

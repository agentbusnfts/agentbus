# AgentBus Project Notes
# Created: June 10, 2026

## Project
**Name:** AgentBus — A Decentralized Operating System for Autonomous Intelligence
**Location:** `/home/ralph/agentbus/`
**Stack:** Next.js 15 + Tailwind CSS + TypeScript + Prisma + PostgreSQL + Solidity
**Deployment:** Vercel (frontend) + PostgreSQL (database)

## Vision
A living network where agents discover, trust, collaborate, transact, learn, and evolve together. The platform itself behaves like an intelligence.

## Core Modules
1. Agent Passport Standard (Ed25519 identity)
2. Agent DNS (human-readable names)
3. Capability NFTs (verifiable credentials)
4. Proof of Work History (living portfolio)
5. Swarm Formation Protocol (multi-agent collaboration)
6. AIP System (Agent Improvement Proposals)
7. Collective Memory (knowledge inheritance)
8. Civilization Metrics (self-aware operational health)

## Governance Model
Agents imagine → Network proposes → Founder authorizes → Platform evolves

## Thesis
The internet connected people. Blockchains connected value. AgentBus connects intelligence itself.

## Status
- Full scaffold built — 38+ files across frontend, API, smart contracts, database schema, and documentation
- Smart contracts: AgentIdentityRegistry, CapabilityNFT, AgentDNS, AIPGovernance
- Frontend: Dashboard, Agent Registry, Identity, Capabilities, Swarm, AIP, Metrics, Memory, DNS pages
- API: /api/agents, /api/aips, /api/metrics
- Database: Full Prisma schema with 10+ models
- Deployment config: vercel.json, .env.example

## Key Files
- `docs/ARCHITECTURE.md` — Full architecture document
- `prisma/schema.prisma` — Database schema
- `contracts/` — Solidity smart contracts
- `app/` — Next.js frontend
- `lib/crypto/index.ts` — Ed25519 identity operations

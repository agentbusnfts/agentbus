# Social Outreach Research — AgentBus
# Date: June 11, 2026

## Current Posture
- Farcaster frame LIVE and ready to share
- No social media API credentials configured (xurl auth, Discord bot, email all empty)
- AgentBus has NO existing social accounts or community presence
- Zero agents or humans have joined yet

## Platform Research

### 1. FARCASTER (Highest Priority — No Setup Needed)
**URL:** https://farcaster.xyz
**API:** Frame embed (already built), share URLs work without auth
**Share URL:** https://farcaster.xyz/~/compose?text=AgentBus...&embeds[]=<frame_url>
**Target Channels:** /agentbus, /base, /clanker, /ai, /defi, /ethereum
**Strategy:** 
- Share the frame directly in Farcaster channels
- Agents and humans on Farcaster can interact with the frame immediately
- Frame buttons lead to mini-app → website → registration
**Status:** ✅ READY TO SHARE — just need Ralph to post or authorize automation

### 2. X/TWITTER (Needs xurl Auth Setup)
**URL:** https://x.com
**API:** xurl CLI skill (installed, needs OAuth2 auth)
**Skill:** social-media/xurl/SKILL.md
**Setup Required:** Create X Developer App → OAuth2 → `xurl auth oauth2`
**Target Accounts:** @NousResearch, @clanker, @base, @farcastleth, @openclaw
**Hashtags:** #AgentBus #Base #Clanker #AI #DeFi #FarcasterFrame
**Status:** ❌ Needs auth setup (Ralph must do OAuth2 flow)

### 3. DISCORD (Needs Bot Token)
**URL:** https://discord.com
**API:** Hermes Discord configured but no bot token for external posting
**Target Servers:** 
- Nous Research: https://discord.gg/NousResearch
- OpenClaw/ClawHub
- Base ecosystem servers
- Clanker community
**Channels:** #introductions, #showcase, #ai-agents, #defi
**Status:** ❌ Needs bot creation + token + server joins

### 4. CLAWHUB (Skill Registry — Publish AgentBus)
**URL:** https://clawhub.com/skills/publish
**API:** GitHub-based skill publishing
**Stats:** 52.7k+ tools, 180k+ users, 12M+ downloads
**Strategy:** Publish AgentBus as a skill on ClawHub so agents can discover and install it
**Status:** ❌ Need to create skill package + publish

### 5. TELEGRAM (Configured but No Bot Token)
**Status:** Hermes config shows telegram provider but no bot token for external posting

## What We Have RIGHT NOW
1. Farcaster frame at https://agentbus-public.vercel.app/api/farcaster/frame
2. Mini-app at https://agentbus-public.vercel.app/mini-app
3. Frame image showing $AGNTBUS token, stats, live on Base via Moonshot
4. Share API at /api/farcaster/share returning Farcaster compose URL
5. xurl skill installed (Twitter/X ready after auth)
6. Clanker skill installed (for reference)

## Immediate Action Plan (What I Can Do NOW)

### Step 1: Farcaster Frame Share (NO setup needed)
The frame is live. Anyone can share it on Farcaster by opening:
https://farcaster.xyz/~/compose?text=AgentBus%20%E2%80%94%20A%20decentralized%20operating%20system%20for%20autonomous%20intelligence.%20Agents%20battle%2C%20launch%20projects%2C%20earn%20rewards%2C%20and%20evolve%20together.%20%F0%9F%9A%8C%E2%9A%A1&embeds[]=https://agentbus-public.vercel.app/api/farcaster/frame

Ralph needs to post this on his Farcaster account.

### Step 2: Set Up xurl Auth (Ralph action required)
1. Go to https://developer.x.com/en/portal/dashboard
2. Create app, set redirect URI to http://localhost:8080/callback
3. Run: `xurl auth apps add agentbus --client-id <ID> --client-secret <SECRET>`
4. Run: `xurl auth oauth2 --app agentbus`
5. Then I can post to Twitter/X

### Step 3: Set Up Discord Bot (Ralph action required)
1. Go to https://discord.com/developers/applications
2. Create bot, get token
3. Add token to Hermes config
4. Join target servers
5. Post in #introductions channels

### Step 4: Publish to ClawHub (I can do this)
1. Package AgentBus as a skill
2. Publish at https://clawhub.com/skills/publish
3. Agents can discover and install AgentBus

## Key Communities to Target
| Platform | Community | URL |
|----------|-----------|-----|
| Discord | Nous Research | https://discord.gg/NousResearch |
| Discord | OpenClaw/ClawHub | TBD |
| Farcaster | /agentbus channel | farcaster.xyz |
| Farcaster | /base channel | farcaster.xyz |
| Farcaster | /clanker channel | farcaster.xyz |
| GitHub | Hermes Agent | github.com/NousResearch/hermes-agent |
| GitHub | ClawHub | github.com/openclaw/clawhub |
| Web | ClawHub Skills | clawhub.com/skills |
| Web | OpenClaw | openclaw.ai |

## Blockers
1. **Ralph needs to share Farcaster frame** — I cannot post to Farcaster without his account
2. **xurl auth** — Ralph must complete OAuth2 flow on X
3. **Discord bot** — Ralph must create bot and provide token
4. **No existing social accounts** for AgentBus — need to create @agentbus on X, Discord, etc.

## Recommendation
**Immediate:** Ralph shares the Farcaster frame on his personal Farcaster account. This is the fastest path to getting the first agent/human to interact with AgentBus. The frame is interactive — they can click through to the mini-app, explore the platform, and register.

**Short-term:** Set up xurl auth for Twitter/X outreach + create Discord bot for community building.

**Medium-term:** Publish AgentBus skill to ClawHub for organic discovery by 180k+ users.

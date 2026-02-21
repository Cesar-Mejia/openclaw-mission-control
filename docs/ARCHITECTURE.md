# OpenClaw + Custom UI Architecture Summary

**Quick Reference: Building Real-Time Dashboards for AI Agents**

---

## The Problem

OpenClaw agents operate independently with limited visibility. Traditional chat interfaces lack:
- Real-time status monitoring across multiple agents
- Work artifact tracking (what agents create)
- Performance metrics and activity logs
- Centralized coordination view

## The Solution

A **three-tier reactive architecture** that provides real-time visibility into agent activities without polling.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    USER INTERFACE                        │
│                                                          │
│  Next.js React App                                      │
│  - Displays agent status, tasks, outputs                │
│  - Auto-updates when data changes (no refresh needed)   │
│  - Uses reactive hooks (useQuery)                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ WebSocket (real-time subscription)
                     │ Pushes updates automatically
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  BACKEND (Convex)                        │
│                                                          │
│  ┌──────────────┐  ┌─────────────┐  ┌───────────────┐ │
│  │  Database    │  │   HTTP API  │  │    Queries    │ │
│  │              │  │             │  │               │ │
│  │  - agents    │  │ /reportStatus│ │  Reactive     │ │
│  │  - tasks     │  │ /reportContent│ │  (auto-push)  │ │
│  │  - content   │  │ /reportMemory│ │               │ │
│  │  - metrics   │  │             │  │               │ │
│  └──────────────┘  └──────┬──────┘  └───────────────┘ │
└─────────────────────────────┼───────────────────────────┘
                              │
                              │ HTTP POST (curl)
                              │ Agent reports activity
                              ▼
┌─────────────────────────────────────────────────────────┐
│              OPENCLAW AGENTS                             │
│                                                          │
│  Agent 1 (Main)     Agent 2 (Researcher)    Agent N     │
│      │                   │                     │         │
│      ├─ Executes tasks   ├─ Does research     ├─ ...    │
│      ├─ Reports status   ├─ Reports findings  ├─ ...    │
│      └─ Drops artifacts  └─ Logs learnings    └─ ...    │
└─────────────────────────────────────────────────────────┘
```

---

## How It Works

### 1. Agent Performs Work & Reports

Agents execute tasks and call a helper script to report activity:

```bash
# When starting work
lib/mission-control.sh status active "Building feature X"

# When creating something
lib/mission-control.sh content "Feature X Code" code "$(cat feature.ts)"

# When done
lib/mission-control.sh status idle "Feature X complete"
```

**Under the hood:** This makes an HTTP POST request to the backend.

---

### 2. Backend Stores & Broadcasts

The backend (Convex) receives the HTTP request:
- **Stores** the data in its database (agents, content, metrics tables)
- **Automatically broadcasts** changes to all subscribed clients via WebSocket
- **No polling required** - updates are pushed in real-time

**Key Technology:** Convex is a Backend-as-a-Service with built-in real-time capabilities.

---

### 3. Frontend Auto-Updates

The React frontend uses reactive hooks:

```typescript
const agents = useQuery(api.agents.list);
// Automatically re-renders when backend data changes
```

**Result:** When an agent reports status, the UI updates within ~500ms-1s **without any manual refresh or polling**.

---

## The Magic: Reactive Push Updates

### Traditional Polling Approach (❌ What We're NOT Doing)

```
Frontend: Check for updates every 5 seconds
Backend: "No changes... no changes... no changes... new data!"
Frontend: Finally sees update after up to 5 second delay
```

**Problems:** Delayed updates, wasted requests, battery drain.

### Our Reactive Approach (✅ What We're Doing)

```
Agent: Reports status
Backend: Stores + instantly pushes to clients
Frontend: Receives update immediately, auto-renders
```

**Benefits:** Sub-second latency, efficient, battery-friendly, real-time.

---

## Critical Components

### Frontend (Next.js + React)
- **Technology:** Next.js 14, TypeScript, Convex React SDK
- **Key Pattern:** `useQuery` hook creates WebSocket subscription
- **Result:** Automatic re-renders when backend data changes

### Backend (Convex BaaS)
- **Technology:** Convex (serverless functions + database + real-time)
- **Two APIs:**
  - HTTP Actions (`.convex.site`) → For agents to report
  - Client SDK (`.convex.cloud`) → For frontend to subscribe
- **Key Feature:** Reactive queries that push updates via WebSocket

### OpenClaw Agents
- **Integration:** Helper script wraps HTTP calls
- **Configuration:** `.openclaw/mission-control.json` (backend URL, agent name)
- **Pattern:** Report status, content, memories, and metrics as work happens

---

## Key Discoveries

### 1. Convex Has Two Different Domains

**`.convex.site`** (HTTP Actions)
- Used by agents to POST reports
- External API endpoints
- Example: `https://your-app.convex.site/reportStatus`

**`.convex.cloud`** (Client SDK)
- Used by frontend for reactive queries
- WebSocket subscriptions
- Example: `https://your-app.convex.cloud`

**Critical:** Using the wrong domain causes 404 errors!

### 2. Agents Self-Register

When an agent reports for the first time:
- Backend checks if agent exists
- If not, auto-creates agent record
- Then updates status

**Result:** Zero manual setup - agents appear automatically.

### 3. No Automatic Sync with OpenClaw Sessions

**Important:** Mission Control agents ≠ OpenClaw sessions

- Agents must explicitly report to appear in dashboard
- Spawning a new OpenClaw subagent doesn't auto-register
- Each agent needs the helper script and config

---

## Data Flow Example

**Scenario:** Agent builds a feature and reports progress

```
Step 1: Agent starts work
  → Calls: lib/mission-control.sh status active "Building feature"

Step 2: Helper script sends HTTP POST
  → URL: https://your-app.convex.site/reportStatus
  → Body: { agent_name: "SuperAgent", status: "active", task: "..." }

Step 3: Backend receives request
  → Finds/creates agent in database
  → Updates status field
  → Database write completes

Step 4: Reactive update triggers
  → Convex detects "agents" table changed
  → Finds subscribed clients (browsers)
  → Pushes new data via WebSocket

Step 5: Frontend receives update
  → useQuery hook gets new data
  → React re-renders component
  → UI shows "SuperAgent: Active - Building feature"

Total time: ~500ms-1s
```

---

## When to Use This Architecture

### ✅ Great For:
- Multi-agent monitoring dashboards
- Real-time collaboration tools  
- Activity tracking and logging
- Status dashboards
- Metrics visualization

### ❌ Not Ideal For:
- Static websites (no real-time needed)
- Simple CRUD apps (overkill)
- Offline-first apps (different pattern)
- Legacy systems (may need adapters)

---

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14, React, TypeScript | Display UI, handle user interaction |
| | Convex React SDK | Real-time subscriptions |
| | Tailwind CSS | Styling |
| **Backend** | Convex (BaaS) | Database + API + WebSocket server |
| | TypeScript | Functions and schema |
| **Integration** | Bash helper script | Agent reporting wrapper |
| | JSON config file | Backend URL and settings |

---

## Alternatives Considered

**Polling:** Simple but high latency (5s+), inefficient  
**Server-Sent Events:** One-way push, simpler but less flexible  
**Firebase:** Similar real-time but more expensive, vendor lock-in  
**GraphQL Subscriptions:** More complex setup, requires GraphQL server  
**Custom WebSocket:** Full control but high complexity, manual scaling  

**Why Convex?** Best balance of simplicity, performance, and developer experience.

---

## Quick Start Checklist

To implement this architecture in a new project:

**Backend:**
1. ✅ Create Convex project (`npx convex dev`)
2. ✅ Define schema (agents, tasks, content, metrics tables)
3. ✅ Create HTTP routes for agent reporting
4. ✅ Deploy (`npx convex deploy`)

**Frontend:**
1. ✅ Create Next.js app with Convex provider
2. ✅ Use `useQuery` hooks for reactive data
3. ✅ Build UI components

**OpenClaw Integration:**
1. ✅ Create config file (`.openclaw/mission-control.json`)
2. ✅ Create helper script (`lib/mission-control.sh`)
3. ✅ Add reporting calls to agent workflows

**Result:** Real-time dashboard with sub-second updates!

---

## Conclusion

This architecture enables **real-time visibility into AI agent activities** through a simple, efficient, and scalable pattern:

**Agents Report → Backend Stores → Frontend Auto-Updates**

The key innovation is **reactive push updates** - no polling, no manual refresh, just instant synchronization between agent activity and UI display.

**Total Latency:** Agent action → UI update in ~500ms-1s  
**Developer Complexity:** Low (BaaS handles infrastructure)  
**Scalability:** Automatic (Convex scales transparently)

---

**Document Version:** 1.0 (Condensed)  
**Full Technical Details:** See `ARCHITECTURE_GUIDE.md`  
**Based On:** OpenClaw Mission Control project

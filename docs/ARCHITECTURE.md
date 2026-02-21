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

## Complete Setup Guide (From Scratch)

This section provides **step-by-step instructions** for someone starting fresh with a new OpenClaw installation.

---

### Phase 1: Backend Setup (Convex)

#### 1.1 Initialize Convex Project

```bash
# From your project directory
cd my-dashboard-project
npm install convex
npx convex dev
```

**What happens:**
- Opens browser for Convex authentication
- Creates a new Convex deployment
- Generates two URLs:
  - **Dev:** `https://[random-name].convex.cloud` (development)
  - **Prod:** `https://[different-name].convex.cloud` (production)
- Creates `convex/` directory in your project
- Adds `CONVEX_DEPLOYMENT` to `.env.local`

**Note these URLs!** You'll need them later.

#### 1.2 Create Database Schema

Create `convex/schema.ts`:

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  agents: defineTable({
    name: v.string(),
    role: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("idle"),
      v.literal("sleeping"),
      v.literal("error")
    ),
    current_task: v.optional(v.string()),
    last_active_at: v.number(),
    metadata: v.optional(v.any()),
  })
    .index("by_name", ["name"])
    .index("by_status", ["status"]),
  
  // Add more tables as needed: tasks, content_drops, memories, metrics
});
```

#### 1.3 Create Query Functions

Create `convex/agents.ts`:

```typescript
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("agents").order("desc").collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("agents", {
      name: args.name,
      role: args.role,
      status: "idle",
      last_active_at: Date.now(),
    });
  },
});

export const updateStatus = mutation({
  args: {
    name: v.string(),
    status: v.string(),
    current_task: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db
      .query("agents")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
    
    if (!agent) throw new Error("Agent not found");
    
    await ctx.db.patch(agent._id, {
      status: args.status,
      current_task: args.current_task,
      last_active_at: Date.now(),
    });
  },
});
```

#### 1.4 **CRITICAL:** Create HTTP Router

Create `convex/http.ts` (THIS FILE IS REQUIRED):

```typescript
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/reportStatus",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    
    try {
      await ctx.runMutation(api.agents.updateStatus, {
        name: body.agent_name,
        status: body.status,
        current_task: body.current_task,
      });
      
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      // Auto-create agent if doesn't exist
      if (error.message.includes("not found")) {
        await ctx.runMutation(api.agents.create, {
          name: body.agent_name,
          role: "Auto-created agent",
        });
        
        await ctx.runMutation(api.agents.updateStatus, {
          name: body.agent_name,
          status: body.status,
          current_task: body.current_task,
        });
        
        return new Response(
          JSON.stringify({ success: true, message: "Agent created" }), 
          { status: 200, headers: { "Content-Type": "application/json" }}
        );
      }
      
      return new Response(
        JSON.stringify({ success: false, error: error.message }), 
        { status: 500, headers: { "Content-Type": "application/json" }}
      );
    }
  }),
});

export default http;
```

**Why this file is critical:**
- Without `http.ts`, HTTP endpoints don't exist
- OpenClaw agents can't report (404 errors)
- Must export as `default`
- Routes become accessible at `https://[deployment].convex.site/[path]`

#### 1.5 Deploy to Production

```bash
npx convex deploy
```

**What happens:**
- Compiles TypeScript functions
- Uploads to Convex cloud
- Creates database tables (from schema)
- Registers indexes
- **Exposes HTTP routes** from `http.ts`
- Returns production URL

**You'll see output like:**
```
✔ Deployed Convex functions to https://your-prod-deployment.convex.cloud
```

**Note both URLs now:**
- **`.convex.cloud`** → For frontend SDK
- **`.convex.site`** → For HTTP API (agents report here)

---

### Phase 2: OpenClaw Server Setup

**This happens on the machine where OpenClaw is running** (can be SSH, local, etc.)

#### 2.1 Navigate to Workspace

```bash
cd /root/.openclaw/workspace
# Or wherever your OpenClaw workspace is
```

#### 2.2 Create Configuration File

Create `.openclaw/mission-control.json`:

```bash
mkdir -p .openclaw

cat > .openclaw/mission-control.json << 'EOF'
{
  "convex_url": "https://your-deployment.convex.site",
  "agent_name": "SuperAgent",
  "enabled": true,
  "auto_report_interval_minutes": 30,
  "notes": "Mission Control dashboard integration"
}
EOF
```

**Replace `your-deployment` with your actual Convex deployment name!**

**Critical:** Use `.convex.site` NOT `.convex.cloud`

#### 2.3 Create Helper Script

Create `lib/mission-control.sh`:

```bash
mkdir -p lib

cat > lib/mission-control.sh << 'EOF'
#!/bin/bash
# Mission Control Integration Helper

CONFIG_FILE="/root/.openclaw/workspace/.openclaw/mission-control.json"

# Adjust path to your workspace if different
if [ ! -f "$CONFIG_FILE" ]; then
    CONFIG_FILE="$(dirname "$0")/../.openclaw/mission-control.json"
fi

# Load configuration
if [ ! -f "$CONFIG_FILE" ]; then
    echo "Error: Mission Control config not found: $CONFIG_FILE"
    exit 1
fi

CONVEX_URL=$(jq -r '.convex_url' "$CONFIG_FILE" 2>/dev/null || echo "")
AGENT_NAME=$(jq -r '.agent_name' "$CONFIG_FILE" 2>/dev/null || echo "Agent")
ENABLED=$(jq -r '.enabled' "$CONFIG_FILE" 2>/dev/null || echo "true")

if [ -z "$CONVEX_URL" ]; then
    echo "Error: convex_url not set in $CONFIG_FILE"
    exit 1
fi

if [ "$ENABLED" != "true" ]; then
    echo "Mission Control reporting is disabled"
    exit 0
fi

# Function: Report status
mc_status() {
    local status="$1"
    local task="$2"
    
    local payload="{\"agent_name\":\"$AGENT_NAME\",\"status\":\"$status\""
    if [ -n "$task" ]; then
        payload="$payload,\"current_task\":\"$task\""
    fi
    payload="$payload}"
    
    curl -s -X POST "$CONVEX_URL/reportStatus" \
        -H "Content-Type: application/json" \
        -d "$payload"
    echo ""
}

# CLI interface
case "$1" in
    status)
        if [ -z "$2" ]; then
            echo "Error: status required (active|idle|sleeping|error)"
            exit 1
        fi
        mc_status "$2" "$3"
        ;;
    *)
        echo "Usage: $0 status <active|idle|sleeping|error> [task]"
        echo ""
        echo "Example: $0 status active \"Working on feature X\""
        exit 1
        ;;
esac
EOF

chmod +x lib/mission-control.sh
```

#### 2.4 Test the Integration

```bash
# Test the helper script
lib/mission-control.sh status active "Testing Mission Control integration"
```

**Expected output:**
```json
{"success":true,"message":"Agent created"}
```
or
```json
{"success":true}
```

**If you get 404:** Check that you're using `.convex.site` URL, not `.convex.cloud`

#### 2.5 Update Agent Instructions (Optional but Recommended)

Add to `AGENTS.md`:

```markdown
## Mission Control Integration

Report your status as you work:

```bash
# Before starting work
lib/mission-control.sh status active "Task description"

# After completion
lib/mission-control.sh status idle "Task complete"
```

Configuration: `.openclaw/mission-control.json`
Helper script: `lib/mission-control.sh`
```

---

### Phase 3: Frontend Setup (Next.js)

#### 3.1 Create Next.js App

```bash
npx create-next-app@latest my-dashboard --typescript --tailwind --app
cd my-dashboard
```

#### 3.2 Install Convex Client

```bash
npm install convex
```

#### 3.3 Configure Environment

Create `.env.local`:

```env
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

**Critical:** Use `.convex.cloud` for frontend, NOT `.convex.site`

#### 3.4 Add Convex Provider

Edit `app/layout.tsx`:

```typescript
import { ConvexProvider, ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL!
);

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ConvexProvider client={convex}>
          {children}
        </ConvexProvider>
      </body>
    </html>
  );
}
```

#### 3.5 Create Dashboard Component

Create `app/page.tsx`:

```typescript
"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function Dashboard() {
  const agents = useQuery(api.agents.list);
  
  if (!agents) return <div>Loading...</div>;
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Agent Dashboard</h1>
      <div className="grid gap-4">
        {agents.map(agent => (
          <div key={agent._id} className="border rounded p-4">
            <div className="flex items-center gap-2">
              <h2 className="font-bold">{agent.name}</h2>
              <span className={`px-2 py-1 rounded text-sm ${
                agent.status === 'active' ? 'bg-green-100' :
                agent.status === 'idle' ? 'bg-gray-100' :
                'bg-red-100'
              }`}>
                {agent.status}
              </span>
            </div>
            {agent.current_task && (
              <p className="text-sm text-gray-600 mt-2">
                {agent.current_task}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### 3.6 Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

---

### Phase 4: Verify End-to-End

#### Test the Full Flow:

**1. From OpenClaw server:**
```bash
lib/mission-control.sh status active "End-to-end test"
```

**2. Check frontend (browser):**
- Should see agent appear (or update) within 1 second
- Status: "active"
- Task: "End-to-end test"

**3. Update again:**
```bash
lib/mission-control.sh status idle "Test complete"
```

**4. Frontend updates automatically** (no refresh needed)

**✅ If this works, integration is successful!**

---

## Files Created Summary

### On OpenClaw Server:
```
/root/.openclaw/workspace/
├── .openclaw/
│   └── mission-control.json          (config: backend URL, agent name)
└── lib/
    └── mission-control.sh             (helper: wraps HTTP calls)
```

### In Next.js Project:
```
my-dashboard/
├── .env.local                         (NEXT_PUBLIC_CONVEX_URL)
├── convex/
│   ├── schema.ts                      (database tables)
│   ├── agents.ts                      (queries & mutations)
│   └── http.ts                        (HTTP API routes) ← CRITICAL
└── app/
    ├── layout.tsx                     (Convex provider)
    └── page.tsx                       (dashboard UI)
```

---

## Deployment Steps Explained

### What `npx convex dev` Does:
1. Authenticates with Convex
2. Creates development deployment
3. Watches for file changes
4. Auto-redeploys on save
5. Provides dev URL (`.convex.cloud`)
6. **Keeps running** - must stay open

### What `npx convex deploy` Does:
1. Compiles all TypeScript in `convex/`
2. Validates schema
3. Creates/updates database tables
4. Registers indexes
5. **Uploads and activates functions**
6. **Exposes HTTP routes** from `http.ts`
7. Returns production URL
8. **Completes and exits** - deployment persists

### Key Difference:
- **`convex dev`** = development, continuous, auto-reload
- **`convex deploy`** = production, one-time, persistent

---

## Troubleshooting

### "404 Not Found" when agent reports:

**Cause:** Using wrong domain or `http.ts` not deployed

**Fix:**
1. Check config uses `.convex.site`:
   ```bash
   cat .openclaw/mission-control.json | grep convex_url
   ```
2. Ensure `http.ts` exists and is exported as default
3. Redeploy: `npx convex deploy`

### Frontend doesn't update:

**Cause:** Using wrong domain in frontend

**Fix:**
1. Check `.env.local` uses `.convex.cloud`:
   ```bash
   cat .env.local | grep CONVEX_URL
   ```
2. Restart dev server: `npm run dev`

### "Agent not found" error:

**Cause:** Agent hasn't been created yet

**Fix:** The auto-create logic in `http.ts` should handle this. Check the action has the try/catch block shown above.

---

## Result

After completing all phases, you'll have:

✅ **Backend:** Convex deployment with HTTP API + reactive queries  
✅ **OpenClaw:** Helper script + config for reporting  
✅ **Frontend:** Real-time dashboard with auto-updates  
✅ **Integration:** Agent reports → UI updates in ~500ms-1s

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

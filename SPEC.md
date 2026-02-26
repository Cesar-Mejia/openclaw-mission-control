# OpenClaw Mission Control — Build Spec

## Overview

Build a comprehensive, visually stunning Mission Control web UI for OpenClaw — an AI agent orchestration platform. This is a Next.js app that connects to an OpenClaw gateway via the `@openclaw/bridge` plugin (REST/SSE). The bridge plugin needs to be enhanced first to expose richer data, then the frontend built on top of it.

## Architecture

```
[Next.js Mission Control] <--REST/SSE--> [OpenClaw Gateway :18789] <--bridge plugin-->
```

- **Bridge plugin source**: `/home/admin/projects/openclaw-bridge` (TypeScript, builds to `dist/`)
- **Mission Control app**: `/home/admin/projects/openclaw-mission-control` (this repo)
- Gateway runs on `localhost:18789`, auth via Bearer token
- Bridge plugin is already installed and loaded

## Part 1: Bridge Plugin Enhancements

Enhance the bridge at `/home/admin/projects/openclaw-bridge` with new endpoints and richer event streaming.

### New REST Endpoints

All under `/_plugin/bridge/` prefix, all require Bearer auth.

1. **GET /sessions** — List active sessions
   - Query params: `?active=true&limit=20`
   - Return: `{ sessions: [{ key, agentId, channel, chatType, updatedAt, status }] }`
   - Use: `api.runtime.channel.session.resolveStorePath` + filesystem scan of session files, or track in-memory via hooks

2. **GET /sessions/:sessionKey/history** — Get message history for a session
   - Query params: `?limit=50&includeTools=false`
   - Return: `{ messages: [{ role, content, timestamp, toolName?, toolCallId? }] }`
   - Read from session JSONL files on disk

3. **GET /status** — System status overview
   - Return: `{ uptime, version, agents: [...], channels: { telegram: { enabled, status } }, gateway: { port, mode } }`

4. **GET /diagnostics** — Recent diagnostic events (buffered in-memory)
   - Return last N diagnostic events (model usage, message processing, webhook events, session state changes)
   
5. **GET /sessions/:sessionKey/subagents** — List subagents for a session
   - Return: `{ subagents: [{ runId, childSessionKey, agentId, label, mode, status }] }`

6. **GET /cron** — List cron jobs
   - Return: `{ jobs: [...] }`

7. **POST /sessions/:sessionKey/message** — Send message to a session
   - Body: `{ message: string }`

### Enhanced SSE Events Stream (GET /events)

Hook into MORE lifecycle events and broadcast them all:

```typescript
// Hook into these events and broadcast via SSE:
api.on("before_agent_start", ...) // agent starting
api.on("agent_end", ...)          // agent finished  
api.on("llm_input", ...)          // LLM call started (model, provider, token counts)
api.on("llm_output", ...)         // LLM call finished (usage, cost)
api.on("before_tool_call", ...)   // tool invocation starting
api.on("after_tool_call", ...)    // tool finished (duration, result summary)
api.on("session_start", ...)      // session started
api.on("session_end", ...)        // session ended
api.on("subagent_spawned", ...)   // subagent launched
api.on("subagent_ended", ...)     // subagent completed
api.on("message_received", ...)   // inbound message
api.on("message_sent", ...)       // outbound message

// Also hook into diagnostic events:
import { onDiagnosticEvent } from "openclaw/plugin-sdk";
onDiagnosticEvent((event) => broadcast(event));
```

Each SSE event should include a `type` field, timestamp, and relevant context (sessionKey, agentId, etc.).

### State Management

- Keep an in-memory ring buffer of recent events (last 500) so the UI can fetch recent history on connect
- Track active sessions, their status (idle/processing), and subagent trees
- Track tool call timelines per session

### Implementation Notes

- The plugin SDK types are at: `openclaw/plugin-sdk`
- Key types: `OpenClawPluginApi`, `PluginRuntime`, all the `PluginHook*` types
- The `api.on(hookName, handler)` method registers lifecycle hooks
- `onDiagnosticEvent` from `openclaw/plugin-sdk` gives diagnostic telemetry
- Session files are JSONL at paths resolved via `api.runtime.channel.session.resolveStorePath`
- Config is at `api.config` (type: `OpenClawConfig`)
- Existing code pattern: `src/index.ts` registers hooks and HTTP handlers, routes in `src/routes/`
- Build: `npm run build` (tsc), output to `dist/`
- After changing bridge code, rebuild and restart gateway (but we'll do that at the end)

## Part 2: Next.js Mission Control Frontend

### Tech Stack

- **Next.js 15** (App Router)
- **React 19**
- **shadcn/ui** — component library (uses Radix UI + Tailwind)
- **Tailwind CSS v4** — utility-first styling
- **Recharts** or **Tremor** — for data visualization charts
- **Lucide React** — icons
- **TypeScript** throughout

### Design Philosophy

**DO NOT make this look like a generic admin dashboard.** Think:
- NASA/SpaceX mission control aesthetic — dark theme, glowing accents, data-dense
- Real-time telemetry feel — numbers updating, pulse animations, status indicators
- Cyberpunk-ish but professional — think Bloomberg Terminal meets Grafana meets sci-fi HUD
- Dense information display — no wasted whitespace, every pixel earns its place
- Subtle animations — status transitions, data flowing in, not gratuitous motion

### Color Palette
- Background: near-black (`#0a0a0f` to `#12121a`)
- Primary accent: electric blue/cyan (`#00d4ff`)
- Secondary: amber/gold for warnings (`#ffb700`)
- Success: green (`#00ff88`)
- Error: red (`#ff3366`)
- Text: light gray on dark, with hierarchy
- Subtle grid/scanline overlay for that mission control feel

### Pages & Layout

#### Layout (persistent)
- **Top bar**: "OPENCLAW MISSION CONTROL" branding, system clock (live), gateway status indicator (green dot pulse), uptime counter
- **Left sidebar**: Navigation — Dashboard, Agents, Sessions, Activity Log, Cron, Settings
- Sidebar should be collapsible, icons-only when collapsed

#### 1. Dashboard (`/`)
The main command center view. Dense, information-rich.

**Top metrics row** (4-5 cards):
- Active agents (count + status breakdown)
- Active sessions (count)
- Messages processed (last hour / today)
- Token usage (total in/out with sparkline)
- Estimated cost (if available)

**Center: Agent Status Grid**
- Card per agent showing: name, model, current status (idle/running with animated indicator), last activity timestamp
- When running: show what session/task, elapsed time, animated progress ring
- Click to expand → see recent session history for that agent

**Right panel: Live Activity Feed**
- Scrolling real-time feed of events from SSE
- Color-coded by type: messages (blue), tool calls (purple), LLM calls (cyan), errors (red)
- Each entry: timestamp, event type icon, brief description
- Filterable by event type
- Auto-scroll with pause-on-hover

**Bottom: Active Sessions Timeline**
- Horizontal timeline/gantt showing active sessions
- Bars colored by agent, showing processing vs idle time
- Subagent sessions shown as nested/child bars

#### 2. Agents Page (`/agents`)
- Detailed view per agent
- Config details (model, workspace)
- Session history
- Performance metrics (avg response time, token usage over time)
- Chat interface to send messages to an agent

#### 3. Sessions Page (`/sessions`)
- Table of all sessions (sortable, filterable)
- Columns: Session Key, Agent, Channel, Status, Last Activity, Duration, Messages
- Click to open session detail:
  - Full message history (formatted nicely — user/assistant/tool messages)
  - Subagent tree visualization
  - Token usage breakdown
  - Tool call timeline

#### 4. Activity Log (`/activity`)
- Full searchable log of all events
- Timeline visualization
- Filter by: event type, agent, session, time range
- Export capability

#### 5. Cron Page (`/cron`)
- List of cron jobs with status
- Next run time, last run time, schedule
- Enable/disable toggle

### Real-time Features
- SSE connection to bridge `/events` endpoint
- Reconnect with exponential backoff
- Events update all relevant UI components simultaneously
- Connection status indicator in top bar
- Toast notifications for important events (agent errors, subagent completions)

### Key UI Components

1. **StatusIndicator** — Pulsing dot (green=idle, blue=running, red=error, amber=warning)
2. **LiveClock** — Real-time clock display with milliseconds
3. **MetricCard** — Number + label + sparkline + trend indicator
4. **EventFeed** — Virtualized scrolling list of events
5. **SessionTimeline** — Horizontal gantt-like timeline
6. **AgentCard** — Agent status card with activity ring
7. **ChatPanel** — Message display with role-based styling
8. **TokenCounter** — Animated counter for token usage
9. **ConnectionBadge** — SSE connection status

### API Client

Create a typed API client in `lib/api.ts`:
```typescript
const BRIDGE_URL = process.env.NEXT_PUBLIC_BRIDGE_URL || 'http://localhost:18789';
const TOKEN = process.env.NEXT_PUBLIC_BRIDGE_TOKEN || '';

// Typed fetch wrapper with auth
// SSE subscription helper with reconnect
// React hooks: useAgents(), useSessions(), useEvents(), etc.
```

### Environment Variables
```
NEXT_PUBLIC_BRIDGE_URL=http://localhost:18789
NEXT_PUBLIC_BRIDGE_TOKEN=<gateway auth token>
```

## Part 3: Testing

### Bridge Plugin Tests
- Write unit tests for new route handlers (mock the api object)
- Test SSE event broadcasting
- Test session file parsing
- Use vitest or jest

### Frontend Tests
- Component tests with React Testing Library
- Test SSE hook reconnection logic
- Test API client error handling

### Manual Testing
- After building bridge: `cd /home/admin/projects/openclaw-bridge && npm run build`
- Test bridge endpoints with curl against the gateway
- After building frontend: `npm run dev` and verify in browser

## File Structure

### Bridge additions:
```
src/
  routes/
    sessions.ts      # GET /sessions, GET /sessions/:key/history, POST /sessions/:key/message
    status.ts         # GET /status
    diagnostics.ts    # GET /diagnostics
    cron.ts           # GET /cron
    subagents.ts      # GET /sessions/:key/subagents
  state.ts            # Enhanced with ring buffer, session tracking, subagent tracking
  index.ts            # Register new routes and hooks
```

### Mission Control:
```
app/
  layout.tsx          # Root layout with sidebar + topbar
  page.tsx            # Dashboard
  agents/
    page.tsx          # Agents list
    [id]/page.tsx     # Agent detail
  sessions/
    page.tsx          # Sessions list
    [key]/page.tsx    # Session detail
  activity/
    page.tsx          # Activity log
  cron/
    page.tsx          # Cron jobs
components/
  layout/
    sidebar.tsx
    topbar.tsx
  dashboard/
    metric-card.tsx
    agent-grid.tsx
    activity-feed.tsx
    session-timeline.tsx
  common/
    status-indicator.tsx
    live-clock.tsx
    connection-badge.tsx
    token-counter.tsx
  sessions/
    chat-panel.tsx
    session-table.tsx
  agents/
    agent-card.tsx
    agent-chat.tsx
lib/
  api.ts              # Typed API client
  hooks/
    use-events.ts     # SSE subscription hook
    use-agents.ts
    use-sessions.ts
  types.ts            # Shared types
  utils.ts
```

## Build Order

1. Enhance the bridge plugin first (new routes, hooks, state management)
2. Build and test bridge: `cd /home/admin/projects/openclaw-bridge && npm run build`
3. Test bridge endpoints via curl (the gateway is running on :18789)
4. Create the Next.js app with `npx create-next-app@latest`
5. Install shadcn/ui, configure Tailwind dark theme
6. Build the layout (sidebar + topbar)
7. Build core components (StatusIndicator, MetricCard, etc.)
8. Build the Dashboard page
9. Build remaining pages
10. Wire up SSE real-time updates
11. Test everything

## Important

- The bridge plugin loads from `/home/admin/projects/openclaw-bridge` — edit source files in `src/`, then `npm run build` to compile to `dist/`
- The gateway loads the plugin from the `dist/` folder (check `openclaw.plugin.json`)
- After bridge changes, the gateway needs restart, but build the whole thing first
- Keep the existing bridge endpoints working (backward compatible)
- Use the real OpenClaw plugin SDK types — import from "openclaw/plugin-sdk"
- The frontend should work even when no agents are running (graceful empty states)
- Make the UI FEEL alive — subtle animations, real-time updates, no static pages

When completely finished, run this command to notify me:
openclaw system event --text "Done: Built OpenClaw Mission Control — enhanced bridge plugin with 7 new endpoints + Next.js dashboard with real-time telemetry, agent management, session viewer, activity log, and cron management" --mode now

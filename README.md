# OpenClaw Mission Control

A real-time dashboard for monitoring and controlling OpenClaw AI agents, inspired by the "This Is How I Run OpenClaw Mission Control" concept.

![Mission Control Dashboard](https://img.shields.io/badge/status-production--ready-green)

## Features

- **Real-time Agent Monitoring**: Track agent status (active/sleeping/error/idle) and current tasks
- **Task Management**: Kanban-style board with To Do, In Progress, Done, and Failed columns
- **Build Queue**: Monitor CI/CD builds and deployments
- **Content Drops**: View artifacts produced by agents (scripts, blog posts, code, etc.)
- **Memory Database**: Track agent memories and learnings
- **Key Metrics**: Dashboard for KPIs including Stripe revenue, task completion, and more
- **Squad Configuration**: Initial onboarding flow to deploy your agent team

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Convex (real-time database + serverless functions)
- **Real-time Updates**: Convex reactive queries (auto-updates on data changes)
- **Integration**: HTTP API endpoints for OpenClaw agents

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/openclaw-mission-control.git
cd openclaw-mission-control
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Convex

```bash
# Install Convex CLI globally (if not already installed)
npm install -g convex

# Login to Convex
npx convex login

# Initialize Convex project
npx convex dev
```

This will:
- Create a new Convex project
- Generate your `NEXT_PUBLIC_CONVEX_URL`
- Start the Convex dev server

### 4. Configure Environment Variables

Create `.env.local`:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Convex URL:

```
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

### 5. Seed Sample Data (Optional)

```bash
npx convex run seed:seedAll
```

This creates sample agents, tasks, builds, content, and metrics for testing.

### 6. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard.

## Architecture

### Data Model

#### Agents
- `name`: Agent name (e.g., "Jarvis", "Closer")
- `role`: Agent role/description
- `status`: active | sleeping | error | idle
- `current_task`: What the agent is working on
- `metadata`: Capabilities, tags, config

#### Tasks
- `title`, `description`: Task details
- `status`: todo | in_progress | done | failed
- `assigned_agent_id`: Linked agent
- `priority`: low | medium | high
- `created_at`, `due_at`: Timestamps

#### Builds
- `type`: Build type (deploy, test, compile)
- `status`: queued | running | success | failed
- `logs`: Build output
- `agent_name`: Agent responsible

#### Content Drops
- `agent_name`: Producer agent
- `title`, `type`: Content metadata
- `body` or `file_url`: Content payload

#### Metrics
- `name`: Metric identifier (e.g., "stripe_revenue")
- `value`: Numeric or string value
- `unit`: USD, count, etc.

#### Memories
- `agent_name`: Agent owner
- `title`, `content`: Memory details
- `tags`: Categorization

### Real-Time Updates

All queries use Convex's reactive subscriptions:

```typescript
const agents = useQuery(api.agents.list); // Auto-updates
```

No polling required! Data updates push instantly to the UI.

## OpenClaw Integration

### HTTP API Endpoints

Convex actions are exposed as HTTP endpoints that OpenClaw agents can call:

#### Report Agent Status

```bash
curl -X POST https://your-deployment.convex.cloud/reportStatus \
  -H "Content-Type: application/json" \
  -d '{
    "agent_name": "Jarvis",
    "status": "active",
    "current_task": "Monitoring all systems"
  }'
```

#### Report Content Drop

```bash
curl -X POST https://your-deployment.convex.cloud/reportContent \
  -H "Content-Type: application/json" \
  -d '{
    "agent_name": "Closer",
    "title": "Instagram Script #42",
    "type": "script",
    "body": "Slide 1: ..."
  }'
```

#### Report Memory

```bash
curl -X POST https://your-deployment.convex.cloud/reportMemory \
  -H "Content-Type: application/json" \
  -d '{
    "agent_name": "Scout",
    "title": "Market Analysis",
    "content": "Competitor pricing data..."
  }'
```

#### Update Metric

```bash
curl -X POST https://your-deployment.convex.cloud/updateMetric \
  -H "Content-Type: application/json" \
  -d '{
    "name": "stripe_revenue",
    "value": 15420.50,
    "unit": "USD"
  }'
```

### Integration from OpenClaw Agents

In your OpenClaw agent scripts, use the `exec` tool with `curl`:

```typescript
// Report status update
await exec({
  command: `curl -X POST ${CONVEX_URL}/reportStatus -H "Content-Type: application/json" -d '${JSON.stringify({
    agent_name: "Jarvis",
    status: "active",
    current_task: "Analyzing market data"
  })}'`
});

// Drop content
await exec({
  command: `curl -X POST ${CONVEX_URL}/reportContent -H "Content-Type: application/json" -d '${JSON.stringify({
    agent_name: "Closer",
    title: "Instagram Carousel Script",
    type: "script",
    body: scriptContent
  })}'`
});
```

## Project Structure

```
openclaw-mission-control/
├── app/
│   ├── layout.tsx                    # Root layout with Convex provider
│   ├── page.tsx                      # Home redirect (squad vs mission-control)
│   ├── squad/
│   │   └── page.tsx                  # Squad configuration page
│   └── mission-control/
│       ├── page.tsx                  # Main dashboard
│       └── agents/[id]/page.tsx      # Agent detail page
├── components/
│   ├── ConvexClientProvider.tsx      # Convex React provider
│   ├── AgentsPanel.tsx               # Agent list panel
│   ├── TasksPanel.tsx                # Kanban task board
│   ├── BuildsPanel.tsx               # Build queue panel
│   ├── ContentPanel.tsx              # Content drops panel
│   └── MetricsPanel.tsx              # KPI metrics panel
├── convex/
│   ├── schema.ts                     # Database schema
│   ├── agents.ts                     # Agent queries/mutations
│   ├── tasks.ts                      # Task queries/mutations
│   ├── builds.ts                     # Build queries/mutations
│   ├── content.ts                    # Content queries/mutations
│   ├── memories.ts                   # Memory queries/mutations
│   ├── metrics.ts                    # Metric queries/mutations
│   ├── openclaw.ts                   # HTTP API actions for OpenClaw
│   └── seed.ts                       # Sample data seeder
└── README.md
```

## Development

### Run Locally

```bash
npm run dev           # Start Next.js dev server
npx convex dev        # Start Convex backend (separate terminal)
```

### Seed Sample Data

```bash
npx convex run seed:seedAll
```

### Deploy to Production

#### Deploy Convex Backend

```bash
npx convex deploy
```

#### Deploy Next.js Frontend

**Vercel (Recommended)**:

```bash
vercel deploy
```

Set the `NEXT_PUBLIC_CONVEX_URL` environment variable in Vercel to your production Convex deployment URL.

**Other Platforms**: Build and deploy as a standard Next.js app:

```bash
npm run build
npm start
```

## Customization

### Adding New Metrics

Edit `convex/metrics.ts` and add new metric names to the dashboard:

```typescript
await ctx.runMutation(api.metrics.upsert, {
  name: "custom_metric",
  value: 42,
  unit: "count"
});
```

### Adding New Content Types

Content types are dynamic! Just pass any `type` string when creating content:

```typescript
await ctx.runMutation(api.content.create, {
  agent_name: "Ghost",
  title: "Twitter Thread",
  type: "twitter_thread",  // New type
  body: "..."
});
```

Add an icon in `components/ContentPanel.tsx`:

```typescript
const TYPE_ICONS: Record<string, string> = {
  twitter_thread: "🧵",  // Add your icon
  // ...
};
```

## License

MIT

## Credits

Inspired by [Steven Shoaf's OpenClaw Mission Control](https://youtube.com/@steven-shoaf) concept.

Built with:
- [Next.js](https://nextjs.org/)
- [Convex](https://convex.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Questions?** Open an issue or reach out on [Discord](https://discord.com/invite/clawd).

export type AgentStatus = "running" | "idle";

export interface Agent {
  id: string;
  name: string;
  description: string | null;
  model: { primary?: string } | null;
  workspace: string | null;
  status: AgentStatus;
}

export interface SessionInfo {
  key: string;
  agentId: string;
  channel?: string;
  chatType?: string;
  status: "idle" | "processing";
  startedAt: number;
  updatedAt: number;
  messageCount: number;
}

export interface SubagentInfo {
  runId: string;
  childSessionKey: string;
  agentId: string;
  label?: string;
  mode: "run" | "session";
  status: "running" | "ended";
  startedAt: number;
  endedAt?: number;
  outcome?: string;
}

export interface BridgeEvent {
  id: string;
  type: string;
  timestamp: number;
  agentId?: string;
  sessionKey?: string;
  sessionId?: string;
  data?: Record<string, unknown>;
}

export interface SessionMessage {
  role: string;
  content: string;
  timestamp: number | null;
  toolName?: string;
  toolCallId?: string;
  model?: string;
}

export interface CronJob {
  id?: string;
  jobId?: string;
  name?: string;
  schedule?: {
    kind: string;
    expr?: string;
    tz?: string;
    everyMs?: number;
    at?: string;
  };
  payload?: {
    kind: string;
    text?: string;
    message?: string;
  };
  enabled?: boolean;
  lastRunAt?: number;
  nextRunAt?: number;
}

export interface SystemStatus {
  uptime: number;
  startedAt: number;
  version: string;
  agents: Agent[];
  channels: Record<string, { enabled: boolean }>;
  gateway: { port: number; mode: string };
  sessions: { total: number; active: number };
  subagents: { total: number; running: number };
  activeToolCalls: number;
  sseClients: number;
}

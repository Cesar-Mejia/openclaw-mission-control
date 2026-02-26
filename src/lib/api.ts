import type { Agent, SessionInfo, SessionMessage, SubagentInfo, BridgeEvent, CronJob, SystemStatus } from "./types";

const BRIDGE_URL = process.env.NEXT_PUBLIC_BRIDGE_URL || "http://localhost:18789";
const TOKEN = process.env.NEXT_PUBLIC_BRIDGE_TOKEN || "";

const headers: Record<string, string> = {
  Authorization: `Bearer ${TOKEN}`,
  "Content-Type": "application/json",
};

async function fetchJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BRIDGE_URL}/_plugin/bridge${path}`, {
    headers,
    ...init,
  });
  if (!res.ok) {
    throw new Error(`Bridge API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// --- Agents ---
export async function getAgents(): Promise<Agent[]> {
  const data = await fetchJSON<{ agents: Agent[] }>("/agents");
  return data.agents;
}

// --- Status ---
export async function getStatus(): Promise<SystemStatus> {
  return fetchJSON<SystemStatus>("/status");
}

// --- Sessions ---
export async function getSessions(limit = 50, active = false): Promise<SessionInfo[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (active) params.set("active", "true");
  const data = await fetchJSON<{ sessions: SessionInfo[] }>(`/sessions?${params}`);
  return data.sessions;
}

export async function getSessionHistory(
  sessionKey: string,
  limit = 50,
  includeTools = true,
): Promise<{ messages: SessionMessage[]; total: number }> {
  const params = new URLSearchParams({
    limit: String(limit),
    includeTools: String(includeTools),
  });
  return fetchJSON(`/sessions/${encodeURIComponent(sessionKey)}/history?${params}`);
}

export async function getSessionSubagents(sessionKey: string): Promise<SubagentInfo[]> {
  const data = await fetchJSON<{ subagents: SubagentInfo[] }>(
    `/sessions/${encodeURIComponent(sessionKey)}/subagents`,
  );
  return data.subagents;
}

export async function sendSessionMessage(
  sessionKey: string,
  message: string,
): Promise<ReadableStream<Uint8Array> | null> {
  const res = await fetch(
    `${BRIDGE_URL}/_plugin/bridge/sessions/${encodeURIComponent(sessionKey)}/message`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ message }),
    },
  );
  return res.body;
}

// --- Diagnostics ---
export async function getDiagnostics(limit = 100, type?: string): Promise<BridgeEvent[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (type) params.set("type", type);
  const data = await fetchJSON<{ events: BridgeEvent[] }>(`/diagnostics?${params}`);
  return data.events;
}

// --- Cron ---
export async function getCronJobs(): Promise<CronJob[]> {
  const data = await fetchJSON<{ jobs: CronJob[] }>("/cron");
  return data.jobs;
}

// --- Chat ---
export async function sendChat(
  agentId: string,
  message: string,
  userId: string,
): Promise<ReadableStream<Uint8Array> | null> {
  const res = await fetch(`${BRIDGE_URL}/_plugin/bridge/chat`, {
    method: "POST",
    headers,
    body: JSON.stringify({ agentId, message, userId }),
  });
  return res.body;
}

// --- SSE Events ---
export function createEventSource(onEvent: (event: BridgeEvent) => void, onError?: (err: Event) => void): () => void {
  let controller = new AbortController();
  let retryDelay = 1000;
  let stopped = false;

  async function connect() {
    if (stopped) return;

    try {
      const res = await fetch(`${BRIDGE_URL}/_plugin/bridge/events`, {
        headers: { Authorization: `Bearer ${TOKEN}` },
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error(`SSE connection failed: ${res.status}`);
      }

      retryDelay = 1000; // Reset on success
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop()!;

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const event = JSON.parse(line.slice(6));
              onEvent(event);
            } catch {
              // Skip malformed events
            }
          }
        }
      }
    } catch (err) {
      if (stopped) return;
      if (onError) onError(err as Event);
    }

    // Reconnect with backoff
    if (!stopped) {
      setTimeout(connect, retryDelay);
      retryDelay = Math.min(retryDelay * 2, 30000);
    }
  }

  connect();

  return () => {
    stopped = true;
    controller.abort();
  };
}

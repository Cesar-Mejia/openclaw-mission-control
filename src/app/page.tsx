"use client";

import { useCallback } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MetricCard } from "@/components/common/metric-card";
import { AgentGrid } from "@/components/dashboard/agent-grid";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { SessionList } from "@/components/dashboard/session-list";
import { useEvents } from "@/lib/hooks/use-events";
import { usePolling } from "@/lib/hooks/use-polling";
import { getStatus, getSessions } from "@/lib/api";
import {
  Bot,
  MessageSquare,
  Cpu,
  Zap,
  GitBranch,
  Wrench,
} from "lucide-react";

export default function DashboardPage() {
  const { events, connected } = useEvents();

  const statusFetcher = useCallback(() => getStatus(), []);
  const sessionsFetcher = useCallback(() => getSessions(20), []);

  const { data: status } = usePolling(statusFetcher, 5000);
  const { data: sessions } = usePolling(sessionsFetcher, 5000);

  const agents = status?.agents ?? [];
  const runningAgents = agents.filter((a) => a.status === "running").length;

  // Count events by type for metrics
  const llmEvents = events.filter((e) => e.type === "llm.output");
  const totalTokens = llmEvents.reduce((sum, e) => {
    const usage = e.data?.usage as Record<string, number> | undefined;
    return sum + (usage?.total ?? 0);
  }, 0);
  const toolEvents = events.filter((e) => e.type === "tool.end");
  const messageEvents = events.filter(
    (e) => e.type === "message.received" || e.type === "message.sent",
  );

  return (
    <div className="min-h-screen bg-background grid-bg">
      <Sidebar />
      <Topbar
        connected={connected}
        startedAt={status?.startedAt}
        version={status?.version}
      />

      <main className="pl-14 pt-12">
        <div className="p-6 space-y-6">
          {/* Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <MetricCard
              label="Agents"
              value={agents.length}
              subtitle={`${runningAgents} active`}
              icon={Bot}
              color="cyan"
            />
            <MetricCard
              label="Sessions"
              value={status?.sessions.total ?? 0}
              subtitle={`${status?.sessions.active ?? 0} processing`}
              icon={MessageSquare}
              color="green"
            />
            <MetricCard
              label="Messages"
              value={messageEvents.length}
              subtitle="this session"
              icon={MessageSquare}
              color="purple"
            />
            <MetricCard
              label="LLM Calls"
              value={llmEvents.length}
              subtitle={`${totalTokens.toLocaleString()} tokens`}
              icon={Cpu}
              color="amber"
            />
            <MetricCard
              label="Tool Calls"
              value={toolEvents.length}
              subtitle="executed"
              icon={Wrench}
              color="cyan"
            />
            <MetricCard
              label="Subagents"
              value={status?.subagents.total ?? 0}
              subtitle={`${status?.subagents.running ?? 0} running`}
              icon={GitBranch}
              color="purple"
            />
          </div>

          {/* Main content: Agent grid + Activity feed */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <AgentGrid agents={agents} />
              <SessionList sessions={sessions ?? []} />
            </div>
            <div className="h-[calc(100vh-220px)]">
              <ActivityFeed events={events} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

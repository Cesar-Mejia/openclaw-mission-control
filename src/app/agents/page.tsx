"use client";

import { useCallback } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusIndicator } from "@/components/common/status-indicator";
import { useEvents } from "@/lib/hooks/use-events";
import { usePolling } from "@/lib/hooks/use-polling";
import { getStatus } from "@/lib/api";
import { Bot, Cpu, Hash, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Agent } from "@/lib/types";

function AgentDetailCard({ agent }: { agent: Agent }) {
  const isRunning = agent.status === "running";
  const model = agent.model?.primary ?? "unknown";

  return (
    <Card
      className={cn(
        "relative overflow-hidden border p-6 transition-all duration-300",
        isRunning
          ? "border-cyan/30 bg-cyan/5 glow-cyan"
          : "border-border/50 bg-card/30",
      )}
    >
      {isRunning && (
        <div className="absolute top-4 right-4">
          <div className="h-10 w-10 rounded-full border-2 border-cyan/30 border-t-cyan animate-spin" />
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "rounded-lg p-2.5",
              isRunning ? "bg-cyan/10 border border-cyan/20" : "bg-secondary/50",
            )}
          >
            <Bot className={cn("h-6 w-6", isRunning ? "text-cyan" : "text-muted-foreground")} />
          </div>
          <div>
            <h3 className="text-lg font-medium">{agent.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <StatusIndicator status={agent.status} label={agent.status} size="xs" />
            </div>
          </div>
        </div>

        {agent.description && (
          <p className="text-sm text-muted-foreground">{agent.description}</p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Hash className="h-3.5 w-3.5" />
            <span className="font-mono">{agent.id}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Cpu className="h-3.5 w-3.5" />
            <span className="font-mono">{model.split("/").pop()}</span>
          </div>
          {agent.workspace && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground col-span-2">
              <FolderOpen className="h-3.5 w-3.5" />
              <span className="font-mono truncate">{agent.workspace}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function AgentsPage() {
  const { connected } = useEvents();
  const statusFetcher = useCallback(() => getStatus(), []);
  const { data: status } = usePolling(statusFetcher, 5000);

  const agents = status?.agents ?? [];

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
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono uppercase tracking-wider text-foreground">
              Agents
            </h2>
            <Badge variant="secondary" className="font-mono">
              {agents.length} configured
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <AgentDetailCard key={agent.id} agent={agent} />
            ))}
          </div>

          {agents.length === 0 && (
            <div className="text-center py-20">
              <Bot className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No agents configured</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

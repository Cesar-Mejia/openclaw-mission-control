"use client";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusIndicator } from "@/components/common/status-indicator";
import { Bot, Clock } from "lucide-react";
import type { Agent } from "@/lib/types";

function AgentCard({ agent }: { agent: Agent }) {
  const isRunning = agent.status === "running";
  const model = agent.model?.primary ?? "unknown";

  return (
    <Card
      className={cn(
        "relative overflow-hidden border p-4 transition-all duration-300",
        isRunning
          ? "border-cyan/30 bg-cyan/5 glow-cyan"
          : "border-border/50 bg-card/30 hover:border-border",
      )}
    >
      {/* Activity ring */}
      {isRunning && (
        <div className="absolute top-3 right-3">
          <div className="h-8 w-8 rounded-full border-2 border-cyan/30 border-t-cyan animate-spin" />
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "rounded-md p-1.5",
              isRunning ? "bg-cyan/10" : "bg-secondary/50",
            )}
          >
            <Bot className={cn("h-4 w-4", isRunning ? "text-cyan" : "text-muted-foreground")} />
          </div>
          <div>
            <h4 className="text-sm font-medium">{agent.name}</h4>
            <p className="text-[10px] font-mono text-muted-foreground">{agent.id}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <StatusIndicator status={agent.status} label={agent.status} size="xs" />
          <Badge variant="secondary" className="text-[10px] font-mono">
            {model.split("/").pop()}
          </Badge>
        </div>

        {agent.description && (
          <p className="text-xs text-muted-foreground truncate">{agent.description}</p>
        )}
      </div>
    </Card>
  );
}

export function AgentGrid({ agents }: { agents: Agent[] }) {
  return (
    <div>
      <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">
        Agents
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
        {agents.length === 0 && (
          <p className="text-xs text-muted-foreground col-span-full text-center py-8">
            No agents configured
          </p>
        )}
      </div>
    </div>
  );
}

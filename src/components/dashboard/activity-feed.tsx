"use client";

import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquare,
  Bot,
  Wrench,
  Cpu,
  Zap,
  AlertTriangle,
  GitBranch,
  Send,
  Play,
  Square,
} from "lucide-react";
import type { BridgeEvent } from "@/lib/types";

const eventConfig: Record<string, { icon: typeof Bot; color: string; label: string }> = {
  "agent.start": { icon: Play, color: "text-cyan", label: "Agent Start" },
  "agent.end": { icon: Square, color: "text-cyan", label: "Agent End" },
  "agent.status": { icon: Bot, color: "text-cyan", label: "Status" },
  "llm.input": { icon: Cpu, color: "text-purple", label: "LLM Call" },
  "llm.output": { icon: Zap, color: "text-purple", label: "LLM Response" },
  "tool.start": { icon: Wrench, color: "text-amber", label: "Tool" },
  "tool.end": { icon: Wrench, color: "text-amber", label: "Tool Done" },
  "message.received": { icon: MessageSquare, color: "text-cyan", label: "Message In" },
  "message.sent": { icon: Send, color: "text-green", label: "Message Out" },
  "subagent.spawned": { icon: GitBranch, color: "text-purple", label: "Subagent" },
  "subagent.ended": { icon: GitBranch, color: "text-purple", label: "Subagent End" },
  "session.start": { icon: Play, color: "text-green", label: "Session" },
  "session.end": { icon: Square, color: "text-muted-foreground", label: "Session End" },
  "gateway.start": { icon: Zap, color: "text-green", label: "Gateway" },
  "gateway.stop": { icon: AlertTriangle, color: "text-red", label: "Gateway Stop" },
};

function getEventDescription(event: BridgeEvent): string {
  const d = event.data ?? {};

  switch (event.type) {
    case "agent.start":
      return `${event.agentId ?? "agent"} processing${d.prompt ? `: "${String(d.prompt).slice(0, 60)}..."` : ""}`;
    case "agent.end":
      return `${event.agentId ?? "agent"} ${d.success ? "completed" : "failed"}${d.durationMs ? ` (${Number(d.durationMs) / 1000}s)` : ""}`;
    case "llm.input":
      return `→ ${d.model ?? "model"}`;
    case "llm.output": {
      const usage = d.usage as Record<string, number> | undefined;
      return `← ${d.model ?? "model"}${usage?.total ? ` (${usage.total} tokens)` : ""}`;
    }
    case "tool.start":
      return `${d.toolName ?? "tool"} invoked`;
    case "tool.end":
      return `${d.toolName ?? "tool"} ${d.error ? "failed" : "done"}${d.durationMs ? ` (${Number(d.durationMs)}ms)` : ""}`;
    case "message.received":
      return `from ${d.from ?? "unknown"} via ${d.channel ?? "?"}`;
    case "message.sent":
      return `to ${d.to ?? "unknown"} ${d.success ? "✓" : "✗"}`;
    case "subagent.spawned":
      return `${d.label ?? d.agentId ?? "subagent"} (${d.mode})`;
    case "subagent.ended":
      return `${d.outcome ?? "ended"}: ${d.reason ?? ""}`;
    default:
      return event.type;
  }
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function ActivityFeed({ events }: { events: BridgeEvent[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    if (!hovering && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [events.length, hovering]);

  const recentEvents = events.slice(-100);

  return (
    <Card className="border-border/50 bg-card/30 flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
          Live Activity
        </h3>
        <Badge variant="secondary" className="font-mono text-xs">
          {events.length}
        </Badge>
      </div>
      <ScrollArea
        className="flex-1 px-4"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <div className="space-y-1 py-2">
          {recentEvents.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-8">
              Waiting for events...
            </p>
          )}
          {recentEvents.map((event, i) => {
            const config = eventConfig[event.type] ?? {
              icon: Zap,
              color: "text-muted-foreground",
              label: event.type,
            };
            const Icon = config.icon;

            return (
              <div
                key={event.id ?? i}
                className="flex items-start gap-2 py-1.5 group hover:bg-secondary/30 rounded px-1 -mx-1 transition-colors"
              >
                <Icon className={cn("h-3.5 w-3.5 mt-0.5 shrink-0", config.color)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-xs font-mono font-medium", config.color)}>
                      {config.label}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {getEventDescription(event)}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground/60 tabular-nums shrink-0">
                  {formatTime(event.timestamp)}
                </span>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
    </Card>
  );
}

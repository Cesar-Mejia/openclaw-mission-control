"use client";

import { useState, useCallback } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEvents } from "@/lib/hooks/use-events";
import { usePolling } from "@/lib/hooks/use-polling";
import { getStatus } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  Bot,
  Cpu,
  MessageSquare,
  Wrench,
  GitBranch,
  Zap,
  Search,
  X,
  Play,
  Square,
  Send,
  AlertTriangle,
} from "lucide-react";
import type { BridgeEvent } from "@/lib/types";

const eventTypeGroups: Record<string, { label: string; types: string[]; icon: typeof Bot }> = {
  agent: { label: "Agent", types: ["agent.start", "agent.end", "agent.status"], icon: Bot },
  llm: { label: "LLM", types: ["llm.input", "llm.output"], icon: Cpu },
  tool: { label: "Tools", types: ["tool.start", "tool.end"], icon: Wrench },
  message: { label: "Messages", types: ["message.received", "message.sent"], icon: MessageSquare },
  subagent: { label: "Subagents", types: ["subagent.spawned", "subagent.ended"], icon: GitBranch },
  session: { label: "Sessions", types: ["session.start", "session.end"], icon: Zap },
};

const eventIcons: Record<string, typeof Bot> = {
  "agent.start": Play,
  "agent.end": Square,
  "agent.status": Bot,
  "llm.input": Cpu,
  "llm.output": Zap,
  "tool.start": Wrench,
  "tool.end": Wrench,
  "message.received": MessageSquare,
  "message.sent": Send,
  "subagent.spawned": GitBranch,
  "subagent.ended": GitBranch,
  "session.start": Play,
  "session.end": Square,
  "gateway.start": Zap,
  "gateway.stop": AlertTriangle,
};

const eventColors: Record<string, string> = {
  "agent.start": "text-cyan",
  "agent.end": "text-cyan",
  "agent.status": "text-cyan",
  "llm.input": "text-purple",
  "llm.output": "text-purple",
  "tool.start": "text-amber",
  "tool.end": "text-amber",
  "message.received": "text-cyan",
  "message.sent": "text-green",
  "subagent.spawned": "text-purple",
  "subagent.ended": "text-purple",
  "session.start": "text-green",
  "session.end": "text-muted-foreground",
  "gateway.start": "text-green",
  "gateway.stop": "text-red",
};

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    month: "short",
    day: "numeric",
  });
}

export default function ActivityPage() {
  const { events, connected, clearEvents } = useEvents();
  const statusFetcher = useCallback(() => getStatus(), []);
  const { data: status } = usePolling(statusFetcher, 5000);

  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());

  const toggleFilter = (group: string) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
  };

  let filteredEvents = [...events].reverse();

  if (activeFilters.size > 0) {
    const allowedTypes = new Set(
      Array.from(activeFilters).flatMap((g) => eventTypeGroups[g]?.types ?? []),
    );
    filteredEvents = filteredEvents.filter((e) => allowedTypes.has(e.type));
  }

  if (search) {
    const q = search.toLowerCase();
    filteredEvents = filteredEvents.filter(
      (e) =>
        e.type.toLowerCase().includes(q) ||
        e.agentId?.toLowerCase().includes(q) ||
        e.sessionKey?.toLowerCase().includes(q) ||
        JSON.stringify(e.data ?? {}).toLowerCase().includes(q),
    );
  }

  return (
    <div className="min-h-screen bg-background grid-bg">
      <Sidebar />
      <Topbar
        connected={connected}
        startedAt={status?.startedAt}
        version={status?.version}
      />

      <main className="pl-14 pt-12">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono uppercase tracking-wider text-foreground">
              Activity Log
            </h2>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-mono">
                {filteredEvents.length} events
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearEvents}
                className="text-xs font-mono"
              >
                Clear
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs font-mono bg-secondary/30 border-border/50"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  <X className="h-3 w-3 text-muted-foreground" />
                </button>
              )}
            </div>

            {Object.entries(eventTypeGroups).map(([key, group]) => {
              const Icon = group.icon;
              const isActive = activeFilters.has(key);
              return (
                <Button
                  key={key}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleFilter(key)}
                  className={cn(
                    "h-7 text-[10px] font-mono gap-1.5",
                    isActive
                      ? "bg-cyan/10 text-cyan border-cyan/30 hover:bg-cyan/20"
                      : "border-border/50 text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {group.label}
                </Button>
              );
            })}
          </div>

          {/* Event list */}
          <Card className="border-border/50 bg-card/30">
            <ScrollArea className="h-[calc(100vh-220px)]">
              <div className="divide-y divide-border/30">
                {filteredEvents.map((event, i) => {
                  const Icon = eventIcons[event.type] ?? Zap;
                  const color = eventColors[event.type] ?? "text-muted-foreground";

                  return (
                    <div
                      key={event.id ?? i}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-secondary/20 transition-colors"
                    >
                      <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", color)} />
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={cn("text-xs font-mono font-medium", color)}>
                            {event.type}
                          </span>
                          {event.agentId && (
                            <Badge variant="secondary" className="text-[10px] font-mono">
                              {event.agentId}
                            </Badge>
                          )}
                          {event.sessionKey && (
                            <span className="text-[10px] font-mono text-muted-foreground/60 truncate max-w-[200px]">
                              {event.sessionKey}
                            </span>
                          )}
                        </div>
                        {event.data && Object.keys(event.data).length > 0 && (
                          <pre className="text-[10px] font-mono text-muted-foreground/80 truncate">
                            {JSON.stringify(event.data)}
                          </pre>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground/50 tabular-nums shrink-0">
                        {formatTimestamp(event.timestamp)}
                      </span>
                    </div>
                  );
                })}

                {filteredEvents.length === 0 && (
                  <div className="text-center py-16">
                    <Zap className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      {events.length === 0 ? "Waiting for events..." : "No matching events"}
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </Card>
        </div>
      </main>
    </div>
  );
}

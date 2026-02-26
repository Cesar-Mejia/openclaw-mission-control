"use client";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusIndicator } from "@/components/common/status-indicator";
import { MessageSquare } from "lucide-react";
import type { SessionInfo } from "@/lib/types";

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function SessionRow({ session }: { session: SessionInfo }) {
  const isActive = session.status === "processing";

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors",
        isActive ? "bg-cyan/5 border border-cyan/20" : "hover:bg-secondary/30",
      )}
    >
      <StatusIndicator status={isActive ? "processing" : "idle"} size="xs" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-foreground truncate max-w-[200px]">
            {session.key}
          </span>
          {session.channel && (
            <Badge variant="secondary" className="text-[10px]">
              {session.channel}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1 text-muted-foreground">
          <MessageSquare className="h-3 w-3" />
          <span className="text-[10px] font-mono">{session.messageCount}</span>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground/60 tabular-nums">
          {timeAgo(session.updatedAt)}
        </span>
      </div>
    </div>
  );
}

export function SessionList({ sessions }: { sessions: SessionInfo[] }) {
  return (
    <Card className="border-border/50 bg-card/30">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
          Sessions
        </h3>
        <Badge variant="secondary" className="font-mono text-xs">
          {sessions.length}
        </Badge>
      </div>
      <div className="p-2 space-y-0.5 max-h-[400px] overflow-y-auto">
        {sessions.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8">
            No active sessions
          </p>
        )}
        {sessions.slice(0, 20).map((session) => (
          <SessionRow key={session.key} session={session} />
        ))}
      </div>
    </Card>
  );
}

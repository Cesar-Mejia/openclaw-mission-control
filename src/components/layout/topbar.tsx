"use client";

import { LiveClock, Uptime } from "@/components/common/live-clock";
import { ConnectionBadge } from "@/components/common/connection-badge";
import { Separator } from "@/components/ui/separator";

interface TopbarProps {
  connected: boolean;
  startedAt?: number;
  version?: string;
}

export function Topbar({ connected, startedAt, version }: TopbarProps) {
  return (
    <header className="fixed top-0 right-0 left-14 z-30 h-12 border-b border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xs font-mono font-semibold uppercase tracking-[0.2em] text-foreground">
            OpenClaw Mission Control
          </h1>
          {version && (
            <>
              <Separator orientation="vertical" className="h-4" />
              <span className="text-[10px] font-mono text-muted-foreground">
                v{version}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          {startedAt && startedAt > 0 && <Uptime startedAt={startedAt} />}
          <Separator orientation="vertical" className="h-4" />
          <LiveClock />
          <Separator orientation="vertical" className="h-4" />
          <ConnectionBadge connected={connected} />
        </div>
      </div>
    </header>
  );
}

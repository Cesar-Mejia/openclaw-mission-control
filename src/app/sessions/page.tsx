"use client";

import { useCallback } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusIndicator } from "@/components/common/status-indicator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEvents } from "@/lib/hooks/use-events";
import { usePolling } from "@/lib/hooks/use-polling";
import { getStatus, getSessions } from "@/lib/api";
import { MessageSquare } from "lucide-react";
import type { SessionInfo } from "@/lib/types";

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function formatDuration(startMs: number): string {
  const s = Math.floor((Date.now() - startMs) / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

export default function SessionsPage() {
  const { connected } = useEvents();
  const statusFetcher = useCallback(() => getStatus(), []);
  const sessionsFetcher = useCallback(() => getSessions(100), []);
  const { data: status } = usePolling(statusFetcher, 5000);
  const { data: sessions } = usePolling(sessionsFetcher, 5000);

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
              Sessions
            </h2>
            <div className="flex gap-2">
              <Badge variant="secondary" className="font-mono">
                {sessions?.length ?? 0} total
              </Badge>
              <Badge variant="secondary" className="font-mono text-cyan border-cyan/20">
                {sessions?.filter((s) => s.status === "processing").length ?? 0} active
              </Badge>
            </div>
          </div>

          <Card className="border-border/50 bg-card/30 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="text-[10px] font-mono uppercase tracking-wider">Status</TableHead>
                  <TableHead className="text-[10px] font-mono uppercase tracking-wider">Session Key</TableHead>
                  <TableHead className="text-[10px] font-mono uppercase tracking-wider">Agent</TableHead>
                  <TableHead className="text-[10px] font-mono uppercase tracking-wider">Channel</TableHead>
                  <TableHead className="text-[10px] font-mono uppercase tracking-wider text-right">Messages</TableHead>
                  <TableHead className="text-[10px] font-mono uppercase tracking-wider text-right">Duration</TableHead>
                  <TableHead className="text-[10px] font-mono uppercase tracking-wider text-right">Last Activity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(sessions ?? []).map((session) => (
                  <TableRow
                    key={session.key}
                    className="border-border/30 hover:bg-secondary/20 cursor-pointer"
                  >
                    <TableCell>
                      <StatusIndicator
                        status={session.status === "processing" ? "processing" : "idle"}
                        size="xs"
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs max-w-[300px] truncate">
                      {session.key}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px] font-mono">
                        {session.agentId}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {session.channel ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <MessageSquare className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-mono">{session.messageCount}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-xs font-mono text-muted-foreground tabular-nums">
                      {formatDuration(session.startedAt)}
                    </TableCell>
                    <TableCell className="text-right text-xs font-mono text-muted-foreground/60 tabular-nums">
                      {timeAgo(session.updatedAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {(!sessions || sessions.length === 0) && (
              <div className="text-center py-16">
                <MessageSquare className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No sessions yet</p>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}

"use client";

import { useCallback } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { getStatus, getCronJobs } from "@/lib/api";
import { Clock, Play, Pause, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CronJob } from "@/lib/types";

function formatSchedule(job: CronJob): string {
  if (!job.schedule) return "—";
  if (job.schedule.kind === "cron") return job.schedule.expr ?? "—";
  if (job.schedule.kind === "every") {
    const ms = job.schedule.everyMs ?? 0;
    if (ms >= 3600000) return `every ${ms / 3600000}h`;
    if (ms >= 60000) return `every ${ms / 60000}m`;
    return `every ${ms / 1000}s`;
  }
  if (job.schedule.kind === "at") return `at ${job.schedule.at ?? "?"}`;
  return job.schedule.kind;
}

function formatPayload(job: CronJob): string {
  if (!job.payload) return "—";
  if (job.payload.kind === "systemEvent") return job.payload.text?.slice(0, 80) ?? "system event";
  if (job.payload.kind === "agentTurn") return job.payload.message?.slice(0, 80) ?? "agent turn";
  return job.payload.kind;
}

export default function CronPage() {
  const { connected } = useEvents();
  const statusFetcher = useCallback(() => getStatus(), []);
  const cronFetcher = useCallback(() => getCronJobs(), []);
  const { data: status } = usePolling(statusFetcher, 5000);
  const { data: jobs } = usePolling(cronFetcher, 10000);

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
              Cron Jobs
            </h2>
            <Badge variant="secondary" className="font-mono">
              {jobs?.length ?? 0} jobs
            </Badge>
          </div>

          <Card className="border-border/50 bg-card/30 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="text-[10px] font-mono uppercase tracking-wider w-10">Status</TableHead>
                  <TableHead className="text-[10px] font-mono uppercase tracking-wider">Name</TableHead>
                  <TableHead className="text-[10px] font-mono uppercase tracking-wider">Schedule</TableHead>
                  <TableHead className="text-[10px] font-mono uppercase tracking-wider">Type</TableHead>
                  <TableHead className="text-[10px] font-mono uppercase tracking-wider">Payload</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(jobs ?? []).map((job, i) => (
                  <TableRow
                    key={job.jobId ?? job.id ?? i}
                    className="border-border/30 hover:bg-secondary/20"
                  >
                    <TableCell>
                      {job.enabled !== false ? (
                        <Play className="h-3.5 w-3.5 text-green" />
                      ) : (
                        <Pause className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {job.name ?? job.jobId ?? job.id ?? `Job ${i + 1}`}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px] font-mono">
                        {formatSchedule(job)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {job.payload?.kind ?? "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[300px] truncate">
                      {formatPayload(job)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {(!jobs || jobs.length === 0) && (
              <div className="text-center py-16">
                <Clock className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No cron jobs configured</p>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}

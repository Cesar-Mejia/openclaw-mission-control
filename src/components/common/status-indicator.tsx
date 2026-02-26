"use client";

import { cn } from "@/lib/utils";

type Status = "running" | "idle" | "error" | "connected" | "disconnected" | "processing";

const statusColors: Record<Status, string> = {
  running: "bg-cyan text-cyan",
  processing: "bg-cyan text-cyan",
  idle: "bg-green text-green",
  connected: "bg-green text-green",
  error: "bg-red text-red",
  disconnected: "bg-red text-red",
};

export function StatusIndicator({
  status,
  size = "sm",
  label,
  className,
}: {
  status: Status;
  size?: "xs" | "sm" | "md";
  label?: string;
  className?: string;
}) {
  const dotSize = { xs: "h-1.5 w-1.5", sm: "h-2 w-2", md: "h-3 w-3" }[size];
  const ringSize = { xs: "h-3 w-3", sm: "h-4 w-4", md: "h-5 w-5" }[size];
  const color = statusColors[status] ?? statusColors.idle;
  const isActive = status === "running" || status === "processing";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className={cn("relative inline-flex", ringSize)}>
        {isActive && (
          <span
            className={cn(
              "absolute inline-flex h-full w-full rounded-full opacity-40 animate-ping",
              color.split(" ")[0],
            )}
          />
        )}
        <span
          className={cn(
            "relative inline-flex rounded-full m-auto",
            dotSize,
            color.split(" ")[0],
            isActive && "animate-pulse-glow",
          )}
        />
      </span>
      {label && (
        <span className={cn("text-xs font-mono uppercase tracking-wider", color.split(" ")[1])}>
          {label}
        </span>
      )}
    </div>
  );
}

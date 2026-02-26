"use client";

import { cn } from "@/lib/utils";
import { Wifi, WifiOff } from "lucide-react";

export function ConnectionBadge({ connected }: { connected: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-mono",
        connected
          ? "bg-green/10 text-green border border-green/20"
          : "bg-red/10 text-red border border-red/20",
      )}
    >
      {connected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
      {connected ? "LIVE" : "DISCONNECTED"}
    </div>
  );
}

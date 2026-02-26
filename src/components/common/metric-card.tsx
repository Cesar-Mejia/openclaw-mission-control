"use client";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  color?: "cyan" | "green" | "amber" | "red" | "purple";
  className?: string;
}

const colorMap = {
  cyan: { icon: "text-cyan", glow: "glow-cyan", border: "border-cyan/20" },
  green: { icon: "text-green", glow: "glow-green", border: "border-green/20" },
  amber: { icon: "text-amber", glow: "glow-amber", border: "border-amber/20" },
  red: { icon: "text-red", glow: "glow-red", border: "border-red/20" },
  purple: { icon: "text-purple", glow: "", border: "border-purple/20" },
};

export function MetricCard({
  label,
  value,
  subtitle,
  icon: Icon,
  color = "cyan",
  className,
}: MetricCardProps) {
  const colors = colorMap[color];

  return (
    <Card
      className={cn(
        "relative overflow-hidden border bg-card/50 p-4",
        colors.border,
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className={cn("text-2xl font-mono font-bold tabular-nums", colors.icon)}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className={cn("rounded-md p-2 bg-secondary/50", colors.icon)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      {/* Subtle accent line at bottom */}
      <div
        className={cn("absolute bottom-0 left-0 right-0 h-px", colors.icon)}
        style={{ opacity: 0.3 }}
      />
    </Card>
  );
}

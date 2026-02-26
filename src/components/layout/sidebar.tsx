"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Bot,
  MessageSquare,
  Activity,
  Clock,
  PanelLeftClose,
  PanelLeft,
  Cog,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/agents", label: "Agents", icon: Bot },
  { href: "/sessions", label: "Sessions", icon: MessageSquare },
  { href: "/activity", label: "Activity", icon: Activity },
  { href: "/cron", label: "Cron", icon: Clock },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 bottom-0 z-40 flex flex-col border-r border-border/50 bg-sidebar-background transition-all duration-200",
        collapsed ? "w-14" : "w-52",
      )}
    >
      {/* Logo area */}
      <div className="flex items-center h-12 px-3 border-b border-border/50">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="h-7 w-7 rounded-md bg-cyan/10 border border-cyan/30 flex items-center justify-center shrink-0">
            <span className="text-cyan text-xs font-bold">OC</span>
          </div>
          {!collapsed && (
            <span className="text-xs font-mono font-semibold text-foreground tracking-wider whitespace-nowrap">
              MISSION CTRL
            </span>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;

          const link = (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors",
                isActive
                  ? "bg-cyan/10 text-cyan border border-cyan/20"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                collapsed && "justify-center px-2",
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-cyan")} />
              {!collapsed && <span className="font-mono text-xs">{item.label}</span>}
            </Link>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right" className="font-mono text-xs">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          }

          return link;
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="px-2 py-3 border-t border-border/50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className={cn("w-full", collapsed ? "px-2" : "justify-start")}
        >
          {collapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4 mr-2" />
              <span className="text-xs font-mono">Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}

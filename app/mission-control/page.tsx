"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { AgentsPanel } from "@/components/AgentsPanel";
import { TasksPanel } from "@/components/TasksPanel";
import { BuildsPanel } from "@/components/BuildsPanel";
import { ContentPanel } from "@/components/ContentPanel";
import { MetricsPanel } from "@/components/MetricsPanel";

export default function MissionControlPage() {
  const agents = useQuery(api.agents.list);
  const tasks = useQuery(api.tasks.getBoard);
  const builds = useQuery(api.builds.list);
  const content = useQuery(api.content.getRecent, { limit: 10 });
  const metrics = useQuery(api.metrics.getDashboard);

  const isLoading = !agents || !tasks || !builds || !content || !metrics;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-400">Loading Mission Control...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top Nav */}
      <nav className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                OpenClaw Mission Control
              </h1>
              <div className="flex gap-4 text-sm">
                <Link
                  href="/mission-control"
                  className="text-blue-400 hover:text-blue-300"
                >
                  Dashboard
                </Link>
                <Link
                  href="/mission-control/tasks"
                  className="text-gray-400 hover:text-white"
                >
                  Tasks
                </Link>
                <Link
                  href="/mission-control/content"
                  className="text-gray-400 hover:text-white"
                >
                  Content
                </Link>
                <Link
                  href="/mission-control/memories"
                  className="text-gray-400 hover:text-white"
                >
                  Memories
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-400">
                {new Date().toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm text-green-400">Live</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Agents & Tasks */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <AgentsPanel agents={agents} />
            <BuildsPanel builds={builds} />
          </div>

          {/* Middle Column - Tasks Board */}
          <div className="col-span-12 lg:col-span-5">
            <TasksPanel tasks={tasks} agents={agents} />
          </div>

          {/* Right Column - Content & Metrics */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            <MetricsPanel metrics={metrics} />
            <ContentPanel content={content} />
          </div>
        </div>
      </div>
    </div>
  );
}

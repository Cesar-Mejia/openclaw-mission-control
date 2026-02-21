"use client";

import Link from "next/link";

type Agent = {
  _id: string;
  name: string;
  role: string;
  status: "active" | "sleeping" | "error" | "idle";
  current_task?: string;
  last_active_at: number;
};

const STATUS_COLORS = {
  active: "bg-green-500",
  sleeping: "bg-blue-500",
  error: "bg-red-500",
  idle: "bg-gray-500",
};

const STATUS_LABELS = {
  active: "Active",
  sleeping: "Sleeping",
  error: "Error",
  idle: "Idle",
};

export function AgentsPanel({ agents }: { agents: Agent[] }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Agents</h2>
        <div className="text-sm text-gray-400">{agents.length} total</div>
      </div>

      <div className="space-y-3">
        {agents.map((agent) => (
          <Link
            key={agent._id}
            href={`/mission-control/agents/${agent._id}`}
            className="block bg-gray-800 hover:bg-gray-750 rounded-lg p-4 border border-gray-700 hover:border-blue-500/50 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${STATUS_COLORS[agent.status]}`}
                  ></div>
                  <span className="font-semibold text-white">{agent.name}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      agent.status === "active"
                        ? "bg-green-500/20 text-green-400"
                        : agent.status === "error"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-gray-600/20 text-gray-400"
                    }`}
                  >
                    {STATUS_LABELS[agent.status]}
                  </span>
                </div>
                <div className="text-sm text-gray-400 mb-2">{agent.role}</div>
                {agent.current_task && (
                  <div className="text-sm text-blue-400 italic">
                    {agent.current_task}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Last active:{" "}
              {new Date(agent.last_active_at).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </Link>
        ))}
      </div>

      {agents.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No agents deployed yet.
        </div>
      )}
    </div>
  );
}

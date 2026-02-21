"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import type { Id } from "@/convex/_generated/dataModel";

export default function AgentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as Id<"agents">;

  const agent = useQuery(api.agents.get, { id: agentId });
  const tasks = useQuery(api.tasks.listByAgent, { agent_id: agentId });
  const content = useQuery(api.content.listByAgent, {
    agent_name: agent?.name || "",
  });
  const memories = useQuery(api.memories.listByAgent, {
    agent_name: agent?.name || "",
  });

  if (!agent || !tasks || !content || !memories) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-400">Loading agent...</p>
        </div>
      </div>
    );
  }

  const STATUS_COLORS = {
    active: "bg-green-500",
    sleeping: "bg-blue-500",
    error: "bg-red-500",
    idle: "bg-gray-500",
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top Nav */}
      <nav className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-gray-400 hover:text-white"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              {agent.name}
            </h1>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Agent Profile */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold text-white">{agent.name}</h2>
                <div
                  className={`h-3 w-3 rounded-full ${
                    STATUS_COLORS[agent.status]
                  }`}
                ></div>
              </div>
              <div className="text-lg text-gray-400 mb-2">{agent.role}</div>
              {agent.current_task && (
                <div className="text-blue-400 italic">{agent.current_task}</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-gray-800 rounded p-4">
              <div className="text-sm text-gray-400 mb-1">Status</div>
              <div className="text-lg font-semibold capitalize">{agent.status}</div>
            </div>
            <div className="bg-gray-800 rounded p-4">
              <div className="text-sm text-gray-400 mb-1">Last Active</div>
              <div className="text-lg font-semibold">
                {new Date(agent.last_active_at).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>

          {agent.metadata && (
            <div className="mt-4">
              {agent.metadata.capabilities && (
                <div className="mb-2">
                  <div className="text-sm text-gray-400 mb-1">Capabilities</div>
                  <div className="flex flex-wrap gap-2">
                    {agent.metadata.capabilities.map((cap) => (
                      <span
                        key={cap}
                        className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-sm"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {agent.metadata.tags && (
                <div>
                  <div className="text-sm text-gray-400 mb-1">Tags</div>
                  <div className="flex flex-wrap gap-2">
                    {agent.metadata.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tasks */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">Tasks</h3>
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task._id}
                  className="bg-gray-800 border border-gray-700 rounded p-3"
                >
                  <div className="font-semibold text-white mb-1">
                    {task.title}
                  </div>
                  <div className="text-sm text-gray-400 mb-2">
                    {task.description}
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        task.status === "done"
                          ? "bg-green-500/20 text-green-400"
                          : task.status === "in_progress"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-gray-600/20 text-gray-400"
                      }`}
                    >
                      {task.status}
                    </span>
                    {task.priority && (
                      <span className="text-xs text-gray-500">
                        {task.priority}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {tasks.length === 0 && (
                <div className="text-center py-8 text-gray-500">No tasks.</div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">Content</h3>
            <div className="space-y-2">
              {content.map((item) => (
                <div
                  key={item._id}
                  className="bg-gray-800 border border-gray-700 rounded p-3"
                >
                  <div className="font-semibold text-white mb-1">
                    {item.title}
                  </div>
                  <div className="text-xs text-gray-400 mb-2">{item.type}</div>
                  {item.body && (
                    <div className="text-sm text-gray-500 line-clamp-3">
                      {item.body}
                    </div>
                  )}
                </div>
              ))}
              {content.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No content drops.
                </div>
              )}
            </div>
          </div>

          {/* Memories */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 lg:col-span-2">
            <h3 className="text-xl font-bold mb-4">Memories</h3>
            <div className="space-y-2">
              {memories.map((memory) => (
                <div
                  key={memory._id}
                  className="bg-gray-800 border border-gray-700 rounded p-4"
                >
                  <div className="font-semibold text-white mb-2">
                    {memory.title}
                  </div>
                  <div className="text-sm text-gray-400 mb-2">
                    {memory.content}
                  </div>
                  <div className="flex items-center justify-between">
                    {memory.tags && (
                      <div className="flex gap-1">
                        {memory.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-0.5 bg-gray-700 text-gray-400 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <span className="text-xs text-gray-600">
                      {new Date(memory.created_at).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}
              {memories.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No memories.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

type Task = {
  _id: Id<"tasks">;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done" | "failed";
  assigned_agent_name?: string;
  priority?: "low" | "medium" | "high";
  created_at: number;
};

type Agent = {
  _id: Id<"agents">;
  name: string;
  role: string;
};

type TaskBoard = {
  todo: Task[];
  in_progress: Task[];
  done: Task[];
  failed: Task[];
};

const PRIORITY_COLORS = {
  high: "text-red-400",
  medium: "text-yellow-400",
  low: "text-green-400",
};

export function TasksPanel({
  tasks,
  agents,
}: {
  tasks: TaskBoard;
  agents: Agent[];
}) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");

  const createTask = useMutation(api.tasks.create);

  const handleCreateTask = async () => {
    if (!title || !description) return;

    try {
      await createTask({
        title,
        description,
        assigned_agent_id: selectedAgentId ? (selectedAgentId as Id<"agents">) : undefined,
        priority,
      });

      setTitle("");
      setDescription("");
      setSelectedAgentId("");
      setPriority("medium");
      setShowCreateForm(false);
    } catch (error) {
      console.error("Failed to create task:", error);
      alert("Failed to create task");
    }
  };

  const renderTask = (task: Task) => (
    <div
      key={task._id}
      className="bg-gray-800 border border-gray-700 rounded p-3 mb-2 hover:border-blue-500/50 transition-colors cursor-pointer"
    >
      <div className="flex items-start justify-between mb-1">
        <div className="font-semibold text-sm text-white">{task.title}</div>
        {task.priority && (
          <span className={`text-xs ${PRIORITY_COLORS[task.priority]}`}>
            {task.priority}
          </span>
        )}
      </div>
      <div className="text-xs text-gray-400 mb-2 line-clamp-2">
        {task.description}
      </div>
      {task.assigned_agent_name && (
        <div className="text-xs text-blue-400">→ {task.assigned_agent_name}</div>
      )}
    </div>
  );

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Tasks</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
        >
          + New Task
        </button>
      </div>

      {/* Create Task Form */}
      {showCreateForm && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white mb-2 focus:outline-none focus:border-blue-500"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Task description"
            rows={3}
            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white mb-2 focus:outline-none focus:border-blue-500"
          />
          <div className="flex gap-2 mb-2">
            <select
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Unassigned</option>
              {agents.map((agent) => (
                <option key={agent._id} value={agent._id}>
                  {agent.name}
                </option>
              ))}
            </select>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high")}
              className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreateTask}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
            >
              Create Task
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div className="grid grid-cols-4 gap-3">
        {/* To Do */}
        <div>
          <div className="bg-gray-800 rounded-t px-3 py-2 mb-2">
            <div className="text-sm font-semibold text-gray-300">To Do</div>
            <div className="text-xs text-gray-500">{tasks.todo.length}</div>
          </div>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {tasks.todo.map(renderTask)}
          </div>
        </div>

        {/* In Progress */}
        <div>
          <div className="bg-blue-900/30 rounded-t px-3 py-2 mb-2">
            <div className="text-sm font-semibold text-blue-300">In Progress</div>
            <div className="text-xs text-blue-400">{tasks.in_progress.length}</div>
          </div>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {tasks.in_progress.map(renderTask)}
          </div>
        </div>

        {/* Done */}
        <div>
          <div className="bg-green-900/30 rounded-t px-3 py-2 mb-2">
            <div className="text-sm font-semibold text-green-300">Done</div>
            <div className="text-xs text-green-400">{tasks.done.length}</div>
          </div>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {tasks.done.map(renderTask)}
          </div>
        </div>

        {/* Failed */}
        <div>
          <div className="bg-red-900/30 rounded-t px-3 py-2 mb-2">
            <div className="text-sm font-semibold text-red-300">Failed</div>
            <div className="text-xs text-red-400">{tasks.failed.length}</div>
          </div>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {tasks.failed.map(renderTask)}
          </div>
        </div>
      </div>
    </div>
  );
}

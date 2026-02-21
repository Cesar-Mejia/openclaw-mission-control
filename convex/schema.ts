import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * OpenClaw Mission Control Database Schema
 * 
 * Core entities for monitoring and controlling AI agents:
 * - agents: AI agents with status and current work
 * - tasks: Work items assigned to agents
 * - builds: Build/deployment jobs tracked in queue
 * - content_drops: Artifacts produced by agents
 * - metrics: Key performance indicators
 * - memories: Agent memory database
 */

export default defineSchema({
  agents: defineTable({
    name: v.string(), // Agent name (e.g., "Jarvis", "Closer")
    role: v.string(), // Agent role/description
    status: v.union(
      v.literal("active"),
      v.literal("sleeping"),
      v.literal("error"),
      v.literal("idle")
    ),
    current_task: v.optional(v.string()), // What agent is working on
    last_active_at: v.number(), // Timestamp
    metadata: v.optional(
      v.object({
        capabilities: v.optional(v.array(v.string())),
        tags: v.optional(v.array(v.string())),
        config: v.optional(v.any()),
      })
    ),
  })
    .index("by_name", ["name"])
    .index("by_status", ["status"])
    .index("by_last_active", ["last_active_at"]),

  tasks: defineTable({
    title: v.string(),
    description: v.string(),
    status: v.union(
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("done"),
      v.literal("failed")
    ),
    assigned_agent_id: v.optional(v.id("agents")),
    assigned_agent_name: v.optional(v.string()), // Denormalized for easier querying
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    created_at: v.number(),
    due_at: v.optional(v.number()),
    completed_at: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_agent", ["assigned_agent_id"])
    .index("by_created", ["created_at"]),

  builds: defineTable({
    type: v.string(), // e.g., "deploy", "test", "compile"
    status: v.union(
      v.literal("queued"),
      v.literal("running"),
      v.literal("success"),
      v.literal("failed")
    ),
    agent_id: v.optional(v.id("agents")),
    agent_name: v.optional(v.string()),
    started_at: v.optional(v.number()),
    finished_at: v.optional(v.number()),
    logs: v.optional(v.string()), // Log snippet or URL
    metadata: v.optional(v.any()),
  })
    .index("by_status", ["status"])
    .index("by_started", ["started_at"]),

  content_drops: defineTable({
    agent_id: v.optional(v.id("agents")),
    agent_name: v.string(),
    title: v.string(),
    type: v.string(), // e.g., "script", "blog_post", "email", "code"
    body: v.optional(v.string()), // Content body
    file_url: v.optional(v.string()), // Or external file URL
    created_at: v.number(),
    metadata: v.optional(v.any()),
  })
    .index("by_agent", ["agent_id"])
    .index("by_agent_name", ["agent_name"])
    .index("by_type", ["type"])
    .index("by_created", ["created_at"]),

  metrics: defineTable({
    name: v.string(), // e.g., "revenue", "tasks_completed"
    value: v.union(v.number(), v.string()),
    unit: v.optional(v.string()), // e.g., "USD", "count"
    last_updated_at: v.number(),
    metadata: v.optional(v.any()),
  }).index("by_name", ["name"]),

  memories: defineTable({
    agent_id: v.optional(v.id("agents")),
    agent_name: v.string(),
    title: v.string(),
    content: v.string(),
    created_at: v.number(),
    tags: v.optional(v.array(v.string())),
    metadata: v.optional(v.any()),
  })
    .index("by_agent", ["agent_id"])
    .index("by_agent_name", ["agent_name"])
    .index("by_created", ["created_at"]),
});

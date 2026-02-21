import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Agent queries and mutations
 */

// List all agents
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("agents")
      .order("desc")
      .collect();
  },
});

// Get a single agent by ID
export const get = query({
  args: { id: v.id("agents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get agent by name
export const getByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("agents")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
  },
});

// Create a new agent
export const create = mutation({
  args: {
    name: v.string(),
    role: v.string(),
    metadata: v.optional(
      v.object({
        capabilities: v.optional(v.array(v.string())),
        tags: v.optional(v.array(v.string())),
        config: v.optional(v.any()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const agentId = await ctx.db.insert("agents", {
      name: args.name,
      role: args.role,
      status: "idle",
      last_active_at: Date.now(),
      metadata: args.metadata,
    });
    return agentId;
  },
});

// Update agent status (called by OpenClaw agents)
export const updateStatus = mutation({
  args: {
    name: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("sleeping"),
      v.literal("error"),
      v.literal("idle")
    ),
    current_task: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db
      .query("agents")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (!agent) {
      throw new Error(`Agent ${args.name} not found`);
    }

    await ctx.db.patch(agent._id, {
      status: args.status,
      current_task: args.current_task,
      last_active_at: Date.now(),
      ...(args.metadata && {
        metadata: { ...agent.metadata, ...args.metadata },
      }),
    });

    return agent._id;
  },
});

// Delete an agent
export const remove = mutation({
  args: { id: v.id("agents") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Get agents by status
export const getByStatus = query({
  args: {
    status: v.union(
      v.literal("active"),
      v.literal("sleeping"),
      v.literal("error"),
      v.literal("idle")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("agents")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

// Batch create agents (for squad deployment)
export const batchCreate = mutation({
  args: {
    agents: v.array(
      v.object({
        name: v.string(),
        role: v.string(),
        metadata: v.optional(
          v.object({
            capabilities: v.optional(v.array(v.string())),
            tags: v.optional(v.array(v.string())),
            config: v.optional(v.any()),
          })
        ),
      })
    ),
  },
  handler: async (ctx, args) => {
    const agentIds = [];
    for (const agent of args.agents) {
      const id = await ctx.db.insert("agents", {
        name: agent.name,
        role: agent.role,
        status: "idle",
        last_active_at: Date.now(),
        metadata: agent.metadata,
      });
      agentIds.push(id);
    }
    return agentIds;
  },
});

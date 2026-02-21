import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Task queries and mutations
 */

// List all tasks
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("tasks")
      .order("desc")
      .collect();
  },
});

// List tasks by status
export const listByStatus = query({
  args: {
    status: v.union(
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("done"),
      v.literal("failed")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

// List tasks by agent
export const listByAgent = query({
  args: { agent_id: v.id("agents") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_agent", (q) => q.eq("assigned_agent_id", args.agent_id))
      .order("desc")
      .collect();
  },
});

// Get a single task
export const get = query({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create a new task
export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    assigned_agent_id: v.optional(v.id("agents")),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    due_at: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let assigned_agent_name: string | undefined;

    if (args.assigned_agent_id) {
      const agent = await ctx.db.get(args.assigned_agent_id);
      if (agent) {
        assigned_agent_name = agent.name;
      }
    }

    const taskId = await ctx.db.insert("tasks", {
      title: args.title,
      description: args.description,
      status: "todo",
      assigned_agent_id: args.assigned_agent_id,
      assigned_agent_name,
      priority: args.priority,
      created_at: Date.now(),
      due_at: args.due_at,
    });

    return taskId;
  },
});

// Update task status
export const updateStatus = mutation({
  args: {
    id: v.id("tasks"),
    status: v.union(
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("done"),
      v.literal("failed")
    ),
  },
  handler: async (ctx, args) => {
    const updates: any = { status: args.status };
    
    if (args.status === "done" || args.status === "failed") {
      updates.completed_at = Date.now();
    }

    await ctx.db.patch(args.id, updates);
  },
});

// Assign task to agent
export const assign = mutation({
  args: {
    id: v.id("tasks"),
    agent_id: v.id("agents"),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.agent_id);
    if (!agent) {
      throw new Error("Agent not found");
    }

    await ctx.db.patch(args.id, {
      assigned_agent_id: args.agent_id,
      assigned_agent_name: agent.name,
    });
  },
});

// Delete a task
export const remove = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Get task board grouped by status
export const getBoard = query({
  args: {},
  handler: async (ctx) => {
    const allTasks = await ctx.db.query("tasks").collect();
    
    return {
      todo: allTasks.filter((t) => t.status === "todo"),
      in_progress: allTasks.filter((t) => t.status === "in_progress"),
      done: allTasks.filter((t) => t.status === "done"),
      failed: allTasks.filter((t) => t.status === "failed"),
    };
  },
});

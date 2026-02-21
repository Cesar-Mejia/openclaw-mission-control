import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Build queue queries and mutations
 */

// List all builds
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("builds")
      .order("desc")
      .collect();
  },
});

// List builds by status
export const listByStatus = query({
  args: {
    status: v.union(
      v.literal("queued"),
      v.literal("running"),
      v.literal("success"),
      v.literal("failed")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("builds")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

// Get a single build
export const get = query({
  args: { id: v.id("builds") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create a new build
export const create = mutation({
  args: {
    type: v.string(),
    agent_name: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    let agent_id: any;

    if (args.agent_name) {
      const agent = await ctx.db
        .query("agents")
        .withIndex("by_name", (q) => q.eq("name", args.agent_name!))
        .first();
      if (agent) {
        agent_id = agent._id;
      }
    }

    const buildId = await ctx.db.insert("builds", {
      type: args.type,
      status: "queued",
      agent_id,
      agent_name: args.agent_name,
      metadata: args.metadata,
    });

    return buildId;
  },
});

// Update build status (called by OpenClaw or agents)
export const updateStatus = mutation({
  args: {
    id: v.id("builds"),
    status: v.union(
      v.literal("queued"),
      v.literal("running"),
      v.literal("success"),
      v.literal("failed")
    ),
    logs: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates: any = { status: args.status };

    if (args.status === "running" && !updates.started_at) {
      updates.started_at = Date.now();
    }

    if (args.status === "success" || args.status === "failed") {
      updates.finished_at = Date.now();
    }

    if (args.logs) {
      updates.logs = args.logs;
    }

    await ctx.db.patch(args.id, updates);
  },
});

// Delete a build
export const remove = mutation({
  args: { id: v.id("builds") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Get build queue stats
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const allBuilds = await ctx.db.query("builds").collect();
    
    return {
      queued: allBuilds.filter((b) => b.status === "queued").length,
      running: allBuilds.filter((b) => b.status === "running").length,
      success: allBuilds.filter((b) => b.status === "success").length,
      failed: allBuilds.filter((b) => b.status === "failed").length,
      total: allBuilds.length,
    };
  },
});

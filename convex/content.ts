import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Content drops queries and mutations
 */

// List all content drops
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("content_drops")
      .order("desc")
      .collect();
  },
});

// List content by agent
export const listByAgent = query({
  args: { agent_name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("content_drops")
      .withIndex("by_agent_name", (q) => q.eq("agent_name", args.agent_name))
      .order("desc")
      .collect();
  },
});

// List content by type
export const listByType = query({
  args: { type: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("content_drops")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .order("desc")
      .collect();
  },
});

// Get a single content drop
export const get = query({
  args: { id: v.id("content_drops") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create a new content drop (called by OpenClaw agents)
export const create = mutation({
  args: {
    agent_name: v.string(),
    title: v.string(),
    type: v.string(),
    body: v.optional(v.string()),
    file_url: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Find agent ID if exists
    const agent = await ctx.db
      .query("agents")
      .withIndex("by_name", (q) => q.eq("name", args.agent_name))
      .first();

    const contentId = await ctx.db.insert("content_drops", {
      agent_id: agent?._id,
      agent_name: args.agent_name,
      title: args.title,
      type: args.type,
      body: args.body,
      file_url: args.file_url,
      created_at: Date.now(),
      metadata: args.metadata,
    });

    return contentId;
  },
});

// Delete a content drop
export const remove = mutation({
  args: { id: v.id("content_drops") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Get recent content drops (last N)
export const getRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    return await ctx.db
      .query("content_drops")
      .order("desc")
      .take(limit);
  },
});

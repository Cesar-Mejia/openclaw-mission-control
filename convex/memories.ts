import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Agent memories queries and mutations
 */

// List all memories
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("memories")
      .order("desc")
      .collect();
  },
});

// List memories by agent
export const listByAgent = query({
  args: { agent_name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("memories")
      .withIndex("by_agent_name", (q) => q.eq("agent_name", args.agent_name))
      .order("desc")
      .collect();
  },
});

// Get a single memory
export const get = query({
  args: { id: v.id("memories") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create a new memory (called by OpenClaw agents)
export const create = mutation({
  args: {
    agent_name: v.string(),
    title: v.string(),
    content: v.string(),
    tags: v.optional(v.array(v.string())),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Find agent ID if exists
    const agent = await ctx.db
      .query("agents")
      .withIndex("by_name", (q) => q.eq("name", args.agent_name))
      .first();

    const memoryId = await ctx.db.insert("memories", {
      agent_id: agent?._id,
      agent_name: args.agent_name,
      title: args.title,
      content: args.content,
      tags: args.tags,
      created_at: Date.now(),
      metadata: args.metadata,
    });

    return memoryId;
  },
});

// Delete a memory
export const remove = mutation({
  args: { id: v.id("memories") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Search memories by tags
export const searchByTags = query({
  args: { tags: v.array(v.string()) },
  handler: async (ctx, args) => {
    const allMemories = await ctx.db.query("memories").collect();
    
    // Filter memories that have at least one matching tag
    return allMemories.filter((memory) => {
      if (!memory.tags) return false;
      return args.tags.some((tag) => memory.tags?.includes(tag));
    });
  },
});

// Get recent memories (last N)
export const getRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return await ctx.db
      .query("memories")
      .order("desc")
      .take(limit);
  },
});

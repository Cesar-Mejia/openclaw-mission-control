import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Metrics queries and mutations
 */

// List all metrics
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("metrics")
      .collect();
  },
});

// Get a metric by name
export const getByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("metrics")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
  },
});

// Update or create a metric
export const upsert = mutation({
  args: {
    name: v.string(),
    value: v.union(v.number(), v.string()),
    unit: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("metrics")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        value: args.value,
        unit: args.unit,
        last_updated_at: Date.now(),
        metadata: args.metadata,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("metrics", {
        name: args.name,
        value: args.value,
        unit: args.unit,
        last_updated_at: Date.now(),
        metadata: args.metadata,
      });
    }
  },
});

// Delete a metric
export const remove = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const metric = await ctx.db
      .query("metrics")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
    
    if (metric) {
      await ctx.db.delete(metric._id);
    }
  },
});

// Get dashboard metrics (commonly used KPIs)
export const getDashboard = query({
  args: {},
  handler: async (ctx) => {
    const allMetrics = await ctx.db.query("metrics").collect();
    
    // Convert to key-value map for easier access
    const metricsMap: Record<string, any> = {};
    allMetrics.forEach((metric) => {
      metricsMap[metric.name] = {
        value: metric.value,
        unit: metric.unit,
        last_updated_at: metric.last_updated_at,
      };
    });

    return metricsMap;
  },
});

// Increment a counter metric
export const increment = mutation({
  args: {
    name: v.string(),
    amount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("metrics")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    const increment = args.amount ?? 1;

    if (existing && typeof existing.value === "number") {
      await ctx.db.patch(existing._id, {
        value: existing.value + increment,
        last_updated_at: Date.now(),
      });
      return existing._id;
    } else {
      return await ctx.db.insert("metrics", {
        name: args.name,
        value: increment,
        last_updated_at: Date.now(),
      });
    }
  },
});

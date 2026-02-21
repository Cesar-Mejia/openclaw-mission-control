/**
 * OpenClaw Integration API
 * 
 * HTTP-callable actions that OpenClaw agents use to report status,
 * content, memories, and build updates.
 * 
 * Usage from OpenClaw:
 * POST https://your-convex-deployment.convex.cloud/api/<action-name>
 * Headers: { "Content-Type": "application/json" }
 * Body: { agent_name: "...", ... }
 */

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

/**
 * Report agent status
 * 
 * Example OpenClaw call:
 * curl -X POST https://your-deployment.convex.cloud/reportStatus \
 *   -H "Content-Type: application/json" \
 *   -d '{"agent_name": "Jarvis", "status": "active", "current_task": "Analyzing market data"}'
 */
export const reportStatus = action({
  args: {
    agent_name: v.string(),
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
    try {
      await ctx.runMutation(api.agents.updateStatus, {
        name: args.agent_name,
        status: args.status,
        current_task: args.current_task,
        metadata: args.metadata,
      });

      return { success: true, message: "Status updated" };
    } catch (error: any) {
      // If agent doesn't exist, auto-create it
      if (error.message.includes("not found")) {
        await ctx.runMutation(api.agents.create, {
          name: args.agent_name,
          role: "Auto-created agent",
        });

        await ctx.runMutation(api.agents.updateStatus, {
          name: args.agent_name,
          status: args.status,
          current_task: args.current_task,
          metadata: args.metadata,
        });

        return { success: true, message: "Agent created and status updated" };
      }
      throw error;
    }
  },
});

/**
 * Report content drop
 * 
 * Example OpenClaw call:
 * curl -X POST https://your-deployment.convex.cloud/reportContent \
 *   -H "Content-Type: application/json" \
 *   -d '{"agent_name": "Closer", "title": "Instagram Script #42", "type": "script", "body": "..."}'
 */
export const reportContent = action({
  args: {
    agent_name: v.string(),
    title: v.string(),
    type: v.string(),
    body: v.optional(v.string()),
    file_url: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const contentId = await ctx.runMutation(api.content.create, {
      agent_name: args.agent_name,
      title: args.title,
      type: args.type,
      body: args.body,
      file_url: args.file_url,
      metadata: args.metadata,
    });

    return { success: true, content_id: contentId };
  },
});

/**
 * Report memory entry
 * 
 * Example OpenClaw call:
 * curl -X POST https://your-deployment.convex.cloud/reportMemory \
 *   -H "Content-Type: application/json" \
 *   -d '{"agent_name": "Scout", "title": "Market Analysis", "content": "..."}'
 */
export const reportMemory = action({
  args: {
    agent_name: v.string(),
    title: v.string(),
    content: v.string(),
    tags: v.optional(v.array(v.string())),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const memoryId = await ctx.runMutation(api.memories.create, {
      agent_name: args.agent_name,
      title: args.title,
      content: args.content,
      tags: args.tags,
      metadata: args.metadata,
    });

    return { success: true, memory_id: memoryId };
  },
});

/**
 * Report build status
 * 
 * Example OpenClaw call:
 * curl -X POST https://your-deployment.convex.cloud/reportBuildStatus \
 *   -H "Content-Type: application/json" \
 *   -d '{"build_id": "...", "status": "success", "logs": "Build completed successfully"}'
 */
export const reportBuildStatus = action({
  args: {
    build_id: v.id("builds"),
    status: v.union(
      v.literal("queued"),
      v.literal("running"),
      v.literal("success"),
      v.literal("failed")
    ),
    logs: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.runMutation(api.builds.updateStatus, {
      id: args.build_id,
      status: args.status,
      logs: args.logs,
    });

    return { success: true, message: "Build status updated" };
  },
});

/**
 * Create a new build
 * 
 * Example OpenClaw call:
 * curl -X POST https://your-deployment.convex.cloud/createBuild \
 *   -H "Content-Type: application/json" \
 *   -d '{"type": "deploy", "agent_name": "Forge"}'
 */
export const createBuild = action({
  args: {
    type: v.string(),
    agent_name: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const buildId = await ctx.runMutation(api.builds.create, {
      type: args.type,
      agent_name: args.agent_name,
      metadata: args.metadata,
    });

    return { success: true, build_id: buildId };
  },
});

/**
 * Update or create a metric
 * 
 * Example OpenClaw call:
 * curl -X POST https://your-deployment.convex.cloud/updateMetric \
 *   -H "Content-Type: application/json" \
 *   -d '{"name": "stripe_revenue", "value": 15420.50, "unit": "USD"}'
 */
export const updateMetric = action({
  args: {
    name: v.string(),
    value: v.union(v.number(), v.string()),
    unit: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await ctx.runMutation(api.metrics.upsert, {
      name: args.name,
      value: args.value,
      unit: args.unit,
      metadata: args.metadata,
    });

    return { success: true, message: "Metric updated" };
  },
});

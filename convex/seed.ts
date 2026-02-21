/**
 * Seed data for local development
 * 
 * Run with: npx convex run seed:seedAll
 */

import { internalMutation } from "./_generated/server";

export const seedAll = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Clear existing data
    const agents = await ctx.db.query("agents").collect();
    for (const agent of agents) {
      await ctx.db.delete(agent._id);
    }

    const tasks = await ctx.db.query("tasks").collect();
    for (const task of tasks) {
      await ctx.db.delete(task._id);
    }

    const builds = await ctx.db.query("builds").collect();
    for (const build of builds) {
      await ctx.db.delete(build._id);
    }

    // Create sample agents
    const jarvisId = await ctx.db.insert("agents", {
      name: "Jarvis",
      role: "Chief Operating Agent",
      status: "active",
      current_task: "Monitoring all systems",
      last_active_at: Date.now(),
      metadata: {
        capabilities: ["orchestration", "monitoring", "reporting"],
        tags: ["core", "always-on"],
      },
    });

    const closerId = await ctx.db.insert("agents", {
      name: "Closer",
      role: "Sales & Conversion Agent",
      status: "active",
      current_task: "Writing Instagram scripts",
      last_active_at: Date.now() - 300000,
      metadata: {
        capabilities: ["sales", "copywriting", "social-media"],
        tags: ["revenue", "content"],
      },
    });

    const ghostId = await ctx.db.insert("agents", {
      name: "Ghost",
      role: "Content Writer",
      status: "sleeping",
      last_active_at: Date.now() - 7200000,
      metadata: {
        capabilities: ["writing", "editing", "research"],
        tags: ["content"],
      },
    });

    const forgeId = await ctx.db.insert("agents", {
      name: "Forge",
      role: "Build & Deploy Agent",
      status: "active",
      current_task: "Deploying to production",
      last_active_at: Date.now() - 120000,
      metadata: {
        capabilities: ["ci-cd", "deployment", "infrastructure"],
        tags: ["engineering", "devops"],
      },
    });

    const scoutId = await ctx.db.insert("agents", {
      name: "Scout",
      role: "Market Research Agent",
      status: "idle",
      last_active_at: Date.now() - 3600000,
      metadata: {
        capabilities: ["research", "analysis", "data-gathering"],
        tags: ["intelligence"],
      },
    });

    // Create sample tasks
    await ctx.db.insert("tasks", {
      title: "Analyze competitor pricing",
      description: "Research top 5 competitors and compile pricing comparison",
      status: "in_progress",
      assigned_agent_id: scoutId,
      assigned_agent_name: "Scout",
      priority: "high",
      created_at: Date.now() - 86400000,
    });

    await ctx.db.insert("tasks", {
      title: "Write blog post about AI agents",
      description: "2000-word article on business automation with AI agents",
      status: "todo",
      assigned_agent_id: ghostId,
      assigned_agent_name: "Ghost",
      priority: "medium",
      created_at: Date.now() - 43200000,
    });

    await ctx.db.insert("tasks", {
      title: "Create Instagram carousel script",
      description: "10-slide carousel about productivity hacks",
      status: "done",
      assigned_agent_id: closerId,
      assigned_agent_name: "Closer",
      priority: "high",
      created_at: Date.now() - 172800000,
      completed_at: Date.now() - 86400000,
    });

    // Create sample builds
    await ctx.db.insert("builds", {
      type: "deploy",
      status: "running",
      agent_id: forgeId,
      agent_name: "Forge",
      started_at: Date.now() - 300000,
      logs: "Deploying to production environment...",
    });

    await ctx.db.insert("builds", {
      type: "test",
      status: "success",
      agent_id: forgeId,
      agent_name: "Forge",
      started_at: Date.now() - 600000,
      finished_at: Date.now() - 400000,
      logs: "All tests passed successfully ✓",
    });

    await ctx.db.insert("builds", {
      type: "build",
      status: "failed",
      agent_id: forgeId,
      agent_name: "Forge",
      started_at: Date.now() - 7200000,
      finished_at: Date.now() - 7000000,
      logs: "Error: TypeScript compilation failed",
    });

    // Create sample content drops
    await ctx.db.insert("content_drops", {
      agent_id: closerId,
      agent_name: "Closer",
      title: "Instagram Script: 10 AI Hacks",
      type: "script",
      body: "Slide 1: Did you know AI can automate 80% of your daily tasks?\n\nSlide 2: Here's how...",
      created_at: Date.now() - 3600000,
    });

    await ctx.db.insert("content_drops", {
      agent_id: ghostId,
      agent_name: "Ghost",
      title: "Blog: Future of Work",
      type: "blog_post",
      body: "The future of work is here, and it's powered by AI agents...",
      created_at: Date.now() - 86400000,
    });

    // Create sample memories
    await ctx.db.insert("memories", {
      agent_id: scoutId,
      agent_name: "Scout",
      title: "Competitor Analysis - Acme Corp",
      content: "Acme Corp pricing: $99/mo for starter, $299/mo for pro. Strong marketing presence on LinkedIn.",
      tags: ["research", "competitors"],
      created_at: Date.now() - 7200000,
    });

    await ctx.db.insert("memories", {
      agent_id: jarvisId,
      agent_name: "Jarvis",
      title: "System Performance - Dec 2024",
      content: "Average response time: 1.2s. Uptime: 99.8%. Total requests: 42,150.",
      tags: ["metrics", "performance"],
      created_at: Date.now() - 172800000,
    });

    // Create sample metrics
    await ctx.db.insert("metrics", {
      name: "stripe_revenue",
      value: 15420.50,
      unit: "USD",
      last_updated_at: Date.now(),
    });

    await ctx.db.insert("metrics", {
      name: "tasks_completed_today",
      value: 7,
      unit: "count",
      last_updated_at: Date.now(),
    });

    await ctx.db.insert("metrics", {
      name: "active_agents",
      value: 3,
      unit: "count",
      last_updated_at: Date.now(),
    });

    await ctx.db.insert("metrics", {
      name: "builds_in_queue",
      value: 2,
      unit: "count",
      last_updated_at: Date.now(),
    });

    return { success: true, message: "Seed data created successfully" };
  },
});

"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";

interface AgentConfig {
  name: string;
  role: string;
  capabilities: string[];
  tags: string[];
}

const DEFAULT_SQUAD: AgentConfig[] = [
  {
    name: "Jarvis",
    role: "Chief Operating Agent",
    capabilities: ["orchestration", "monitoring", "reporting"],
    tags: ["core", "always-on"],
  },
  {
    name: "Closer",
    role: "Sales & Conversion Agent",
    capabilities: ["sales", "copywriting", "social-media"],
    tags: ["revenue", "content"],
  },
  {
    name: "Ghost",
    role: "Content Writer",
    capabilities: ["writing", "editing", "research"],
    tags: ["content"],
  },
  {
    name: "Hype",
    role: "Marketing Agent",
    capabilities: ["marketing", "branding", "campaigns"],
    tags: ["marketing", "growth"],
  },
  {
    name: "Forge",
    role: "Build & Deploy Agent",
    capabilities: ["ci-cd", "deployment", "infrastructure"],
    tags: ["engineering", "devops"],
  },
  {
    name: "Scout",
    role: "Market Research Agent",
    capabilities: ["research", "analysis", "data-gathering"],
    tags: ["intelligence"],
  },
  {
    name: "Reviewer",
    role: "Quality Assurance Agent",
    capabilities: ["testing", "qa", "validation"],
    tags: ["quality", "engineering"],
  },
  {
    name: "Keeper",
    role: "Data & Memory Agent",
    capabilities: ["storage", "archival", "knowledge-management"],
    tags: ["data", "memory"],
  },
];

export default function SquadPage() {
  const [squad, setSquad] = useState<AgentConfig[]>(DEFAULT_SQUAD);
  const [isDeploying, setIsDeploying] = useState(false);
  const batchCreate = useMutation(api.agents.batchCreate);
  const router = useRouter();

  const handleDeploy = async () => {
    setIsDeploying(true);
    try {
      await batchCreate({
        agents: squad.map((agent) => ({
          name: agent.name,
          role: agent.role,
          metadata: {
            capabilities: agent.capabilities,
            tags: agent.tags,
          },
        })),
      });
      router.push("/mission-control");
    } catch (error) {
      console.error("Failed to deploy squad:", error);
      alert("Failed to deploy squad. Please try again.");
      setIsDeploying(false);
    }
  };

  const updateAgent = (index: number, field: keyof AgentConfig, value: any) => {
    const newSquad = [...squad];
    newSquad[index] = { ...newSquad[index], [field]: value };
    setSquad(newSquad);
  };

  const addAgent = () => {
    setSquad([
      ...squad,
      {
        name: "",
        role: "",
        capabilities: [],
        tags: [],
      },
    ]);
  };

  const removeAgent = (index: number) => {
    setSquad(squad.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Deploy Your Squad
          </h1>
          <p className="text-gray-400 text-lg">
            Configure your AI agents and deploy them to Mission Control
          </p>
        </div>

        {/* Agent Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {squad.map((agent, index) => (
            <div
              key={index}
              className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-blue-500/50 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={agent.name}
                    onChange={(e) => updateAgent(index, "name", e.target.value)}
                    placeholder="Agent Name"
                    className="bg-gray-800 border border-gray-700 rounded px-3 py-2 w-full mb-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    value={agent.role}
                    onChange={(e) => updateAgent(index, "role", e.target.value)}
                    placeholder="Role / Description"
                    className="bg-gray-800 border border-gray-700 rounded px-3 py-2 w-full text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={() => removeAgent(index)}
                  className="ml-3 text-red-400 hover:text-red-300"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Capabilities</label>
                  <input
                    type="text"
                    value={agent.capabilities.join(", ")}
                    onChange={(e) =>
                      updateAgent(
                        index,
                        "capabilities",
                        e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                      )
                    }
                    placeholder="research, writing, analysis"
                    className="bg-gray-800 border border-gray-700 rounded px-3 py-2 w-full text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Tags</label>
                  <input
                    type="text"
                    value={agent.tags.join(", ")}
                    onChange={(e) =>
                      updateAgent(
                        index,
                        "tags",
                        e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                      )
                    }
                    placeholder="core, revenue, engineering"
                    className="bg-gray-800 border border-gray-700 rounded px-3 py-2 w-full text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <button
            onClick={addAgent}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            + Add Agent
          </button>
          <button
            onClick={handleDeploy}
            disabled={isDeploying || squad.length === 0 || squad.some((a) => !a.name || !a.role)}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isDeploying ? "Deploying..." : "Deploy Squad"}
          </button>
        </div>

        {/* Info */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>
            These agents will be created and ready for monitoring in Mission Control.
            <br />
            You can always add, modify, or remove agents later.
          </p>
        </div>
      </div>
    </div>
  );
}

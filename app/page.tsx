"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const agents = useQuery(api.agents.list);
  const router = useRouter();

  useEffect(() => {
    if (agents !== undefined) {
      if (agents.length === 0) {
        // No agents configured, go to squad setup
        router.push("/squad");
      } else {
        // Agents exist, go to mission control
        router.push("/mission-control");
      }
    }
  }, [agents, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        <p className="mt-4 text-gray-400">Loading OpenClaw Mission Control...</p>
      </div>
    </div>
  );
}

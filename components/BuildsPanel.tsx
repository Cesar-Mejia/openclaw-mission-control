"use client";

type Build = {
  _id: string;
  type: string;
  status: "queued" | "running" | "success" | "failed";
  agent_name?: string;
  started_at?: number;
  finished_at?: number;
  logs?: string;
};

const STATUS_ICONS = {
  queued: "⏳",
  running: "▶️",
  success: "✓",
  failed: "✕",
};

const STATUS_COLORS = {
  queued: "text-gray-400",
  running: "text-blue-400",
  success: "text-green-400",
  failed: "text-red-400",
};

export function BuildsPanel({ builds }: { builds: Build[] }) {
  const recentBuilds = builds.slice(0, 10);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Build Queue</h2>
        <div className="text-sm text-gray-400">{builds.length} total</div>
      </div>

      <div className="space-y-2">
        {recentBuilds.map((build) => (
          <div
            key={build._id}
            className="bg-gray-800 border border-gray-700 rounded p-3 hover:border-blue-500/50 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`text-lg ${STATUS_COLORS[build.status]}`}>
                  {STATUS_ICONS[build.status]}
                </span>
                <div>
                  <div className="font-semibold text-sm text-white">
                    {build.type}
                  </div>
                  {build.agent_name && (
                    <div className="text-xs text-gray-400">
                      by {build.agent_name}
                    </div>
                  )}
                </div>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded ${
                  build.status === "success"
                    ? "bg-green-500/20 text-green-400"
                    : build.status === "failed"
                    ? "bg-red-500/20 text-red-400"
                    : build.status === "running"
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-gray-600/20 text-gray-400"
                }`}
              >
                {build.status}
              </span>
            </div>

            {build.logs && (
              <div className="text-xs text-gray-400 font-mono bg-gray-900 rounded p-2 line-clamp-2">
                {build.logs}
              </div>
            )}

            {build.started_at && (
              <div className="text-xs text-gray-500 mt-2">
                {build.finished_at ? (
                  <>
                    Completed in{" "}
                    {Math.round((build.finished_at - build.started_at) / 1000)}s
                  </>
                ) : (
                  <>
                    Started{" "}
                    {new Date(build.started_at).toLocaleString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {builds.length === 0 && (
        <div className="text-center py-8 text-gray-500">No builds yet.</div>
      )}
    </div>
  );
}

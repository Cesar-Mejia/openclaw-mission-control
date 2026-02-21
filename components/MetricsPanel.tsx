"use client";

type MetricsMap = Record<
  string,
  {
    value: number | string;
    unit?: string;
    last_updated_at: number;
  }
>;

const METRIC_ICONS: Record<string, string> = {
  stripe_revenue: "💰",
  tasks_completed_today: "✓",
  active_agents: "🤖",
  builds_in_queue: "⚙️",
};

const METRIC_LABELS: Record<string, string> = {
  stripe_revenue: "Revenue (Stripe)",
  tasks_completed_today: "Tasks Completed",
  active_agents: "Active Agents",
  builds_in_queue: "Builds in Queue",
};

export function MetricsPanel({ metrics }: { metrics: MetricsMap }) {
  const metricKeys = Object.keys(metrics);

  const formatValue = (value: number | string, unit?: string) => {
    if (typeof value === "number" && unit === "USD") {
      return `$${value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
    if (typeof value === "number") {
      return value.toLocaleString("en-US");
    }
    return value;
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Metrics</h2>
      </div>

      <div className="space-y-3">
        {metricKeys.map((key) => {
          const metric = metrics[key];
          return (
            <div
              key={key}
              className="bg-gray-800 border border-gray-700 rounded-lg p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">
                  {METRIC_ICONS[key] || "📊"}
                </span>
                <div className="text-sm text-gray-400">
                  {METRIC_LABELS[key] || key}
                </div>
              </div>
              <div className="text-2xl font-bold text-white">
                {formatValue(metric.value, metric.unit)}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Updated{" "}
                {new Date(metric.last_updated_at).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          );
        })}
      </div>

      {metricKeys.length === 0 && (
        <div className="text-center py-8 text-gray-500">No metrics yet.</div>
      )}
    </div>
  );
}

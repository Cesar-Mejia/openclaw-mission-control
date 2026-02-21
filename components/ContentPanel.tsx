"use client";

import Link from "next/link";

type ContentDrop = {
  _id: string;
  agent_name: string;
  title: string;
  type: string;
  body?: string;
  created_at: number;
};

const TYPE_ICONS: Record<string, string> = {
  script: "📝",
  blog_post: "📄",
  email: "✉️",
  code: "💻",
  default: "📦",
};

export function ContentPanel({ content }: { content: ContentDrop[] }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Content Drops</h2>
        <Link
          href="/mission-control/content"
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          View all →
        </Link>
      </div>

      <div className="space-y-2">
        {content.map((item) => (
          <div
            key={item._id}
            className="bg-gray-800 border border-gray-700 rounded p-3 hover:border-blue-500/50 transition-colors cursor-pointer"
          >
            <div className="flex items-start gap-2">
              <span className="text-xl">
                {TYPE_ICONS[item.type] || TYPE_ICONS.default}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-white truncate">
                  {item.title}
                </div>
                <div className="text-xs text-gray-400 mb-1">
                  by {item.agent_name}
                </div>
                {item.body && (
                  <div className="text-xs text-gray-500 line-clamp-2">
                    {item.body}
                  </div>
                )}
                <div className="text-xs text-gray-600 mt-1">
                  {new Date(item.created_at).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {content.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No content drops yet.
        </div>
      )}
    </div>
  );
}

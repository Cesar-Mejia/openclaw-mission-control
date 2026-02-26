"use client";

import { useState, useEffect } from "react";

export function LiveClock() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) +
          "." +
          String(now.getMilliseconds()).padStart(3, "0"),
      );
    };
    update();
    const timer = setInterval(update, 100);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className="font-mono text-cyan text-sm tracking-wider tabular-nums">
      {time || "00:00:00.000"}
    </span>
  );
}

export function Uptime({ startedAt }: { startedAt: number }) {
  const [uptime, setUptime] = useState("");

  useEffect(() => {
    const update = () => {
      const ms = Date.now() - startedAt;
      const s = Math.floor(ms / 1000);
      const m = Math.floor(s / 60);
      const h = Math.floor(m / 60);
      const d = Math.floor(h / 24);

      if (d > 0) {
        setUptime(`${d}d ${h % 24}h ${m % 60}m`);
      } else if (h > 0) {
        setUptime(`${h}h ${m % 60}m ${s % 60}s`);
      } else {
        setUptime(`${m}m ${s % 60}s`);
      }
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [startedAt]);

  return (
    <span className="font-mono text-xs text-muted-foreground tabular-nums">
      UP {uptime}
    </span>
  );
}

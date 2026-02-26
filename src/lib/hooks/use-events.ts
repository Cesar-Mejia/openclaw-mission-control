"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createEventSource } from "@/lib/api";
import type { BridgeEvent } from "@/lib/types";

const MAX_EVENTS = 200;

export function useEvents() {
  const [events, setEvents] = useState<BridgeEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const cleanup = createEventSource(
      (event) => {
        if (event.type === "connected") {
          setConnected(true);
          return;
        }
        if (event.type === "heartbeat") return;

        setEvents((prev) => {
          const next = [...prev, event as BridgeEvent];
          return next.length > MAX_EVENTS ? next.slice(-MAX_EVENTS) : next;
        });
      },
      () => {
        setConnected(false);
      },
    );

    cleanupRef.current = cleanup;
    return cleanup;
  }, []);

  const clearEvents = useCallback(() => setEvents([]), []);

  return { events, connected, clearEvents };
}

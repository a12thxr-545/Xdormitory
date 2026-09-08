'use client';

import { useEffect, useRef } from 'react';

const BROADCAST_CHANNEL_NAME = 'xdorm_realtime_channel';

// Helper to broadcast on local BroadcastChannel
export function broadcastLocalEvent(type: string, payload?: any) {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      channel.postMessage({ type, payload, timestamp: Date.now() });
      channel.close();
    } catch (e) {
      console.warn('BroadcastChannel error:', e);
    }
  }
}

export function useRealtimeSync(onDataChange: (event: { type: string; payload?: any }) => void) {
  const callbackRef = useRef(onDataChange);

  useEffect(() => {
    callbackRef.current = onDataChange;
  }, [onDataChange]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let eventSource: EventSource | null = null;
    let broadcastChannel: BroadcastChannel | null = null;
    let fallbackInterval: NodeJS.Timeout | null = null;

    // 1. Subscribe to Server-Sent Events (SSE)
    try {
      eventSource = new EventSource('/api/events');

      eventSource.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data && data.type !== 'connected') {
            callbackRef.current(data);
          }
        } catch (err) {
          console.error('Error parsing SSE event:', err);
        }
      };

      eventSource.onerror = () => {
        // SSE temporary failure, EventSource automatically retries connection
      };
    } catch (err) {
      console.warn('EventSource not supported or failed:', err);
    }

    // 2. Subscribe to BroadcastChannel for cross-tab local sync
    if ('BroadcastChannel' in window) {
      try {
        broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        broadcastChannel.onmessage = (e) => {
          if (e.data) {
            callbackRef.current(e.data);
          }
        };
      } catch (e) {
        console.warn('BroadcastChannel initialization failed:', e);
      }
    }

    // 3. Polling interval (every 8 seconds) as background fallback
    fallbackInterval = setInterval(() => {
      callbackRef.current({ type: 'poll' });
    }, 8000);

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (broadcastChannel) {
        broadcastChannel.close();
      }
      if (fallbackInterval) {
        clearInterval(fallbackInterval);
      }
    };
  }, []);
}

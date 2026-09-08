import { NextRequest } from 'next/server';
import { appEventEmitter, DataChangeEvent } from '@/server/events';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // 1. Initial connection message
      const initialMessage = `data: ${JSON.stringify({ type: 'connected', timestamp: Date.now() })}\n\n`;
      controller.enqueue(encoder.encode(initialMessage));

      // 2. Data change listener
      const onDataChange = (event: DataChangeEvent) => {
        try {
          const message = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(message));
        } catch (e) {
          // Stream might be closed
        }
      };

      appEventEmitter.on('change', onDataChange);

      // 3. Heartbeat interval every 15s to keep connection active
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch (e) {
          clearInterval(heartbeat);
        }
      }, 15000);

      // 4. Clean up on disconnect
      request.signal.addEventListener('abort', () => {
        appEventEmitter.off('change', onDataChange);
        clearInterval(heartbeat);
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}

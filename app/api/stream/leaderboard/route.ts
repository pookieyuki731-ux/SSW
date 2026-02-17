import { NextRequest, NextResponse } from 'next/server'
import { sseBroadcaster } from '@/lib/sse'

export const runtime = 'nodejs' // Or 'edge', but globalThis singleton might fail in Edge
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      // Send immediate connection info
      const connectedMsg = `event: connected\ndata: {"status": "ok"}\n\n`;
      controller.enqueue(encoder.encode(connectedMsg));

      // Register client with broadcaster
      // The singleton manages the client lifecycle
      const cleanup = sseBroadcaster.addClient(controller);

      // Clean up when client disconnects (often handled by the browser closing connection)
      // Note: req.signal.onabort might trigger on some disconnects
      req.signal.onabort = () => {
        cleanup();
        try {
            controller.close();
        } catch (e) {
            // Controller might be already closed
        }
      }
    },
    cancel(reason) {
      console.log('Stream canceled', reason)
    },
  })

  // Return raw Response with stream
    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    })
}

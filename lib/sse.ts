// Singleton to manage SSE clients
// Using globalThis to persist across hot reloads in development

class SSEBroadcaster {
  // Use a unique symbol for the global instance if needed, or stick to a simple global property
  private clients: Set<ReadableStreamDefaultController> = new Set();
  private heartbeatInterval: NodeJS.Timeout | null = null;
    
  constructor() {
      // Don't auto-start heartbeat in constructor to avoid issues with SSR or multiple instantiations
  }

  addClient(controller: ReadableStreamDefaultController) {
    this.clients.add(controller);
    // console.log(`[SSE] Client connected. Total: ${this.clients.size}`);
    
    // Send immediate ping
    const encoder = new TextEncoder();
    try {
        controller.enqueue(encoder.encode(`event: ping\ndata: {"timestamp":${Date.now()}}\n\n`));
    } catch {
        this.clients.delete(controller);
        return () => {};
    }

    return () => {
      this.clients.delete(controller);
      // console.log(`[SSE] Client disconnected. Total: ${this.clients.size}`);
    };
  }

  broadcast(event: string, data: any) {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    const encoder = new TextEncoder();
    const encoded = encoder.encode(message);

    this.clients.forEach((controller) => {
      try {
        controller.enqueue(encoded);
      } catch (err) {
        // console.error("[SSE] Error sending to client, removing.", err);
        this.clients.delete(controller);
      }
    });
  }

  startHeartbeat() {
      if (this.heartbeatInterval) return;
      
      this.heartbeatInterval = setInterval(() => {
          if (this.clients.size > 0) {
            this.broadcast("ping", { timestamp: Date.now() });
          }
      }, 20000);
      // console.log("[SSE] Heartbeat started");
  }
}

// Global singleton pattern for Next.js
const globalForSSE = globalThis as unknown as { sseBroadcaster: SSEBroadcaster | undefined };

export const sseBroadcaster = globalForSSE.sseBroadcaster ?? new SSEBroadcaster();
sseBroadcaster.startHeartbeat();

if (process.env.NODE_ENV !== "production") globalForSSE.sseBroadcaster = sseBroadcaster;

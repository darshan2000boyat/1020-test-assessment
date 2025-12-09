// app/api/webhooks/timesheet/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Store active SSE connections
const clients = new Set<ReadableStreamDefaultController>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Notify all connected clients
    const message = `data: ${JSON.stringify({ 
      type: 'timesheet-update',
      event: body.event,
      timestamp: new Date().toISOString()
    })}\n\n`;

    clients.forEach(controller => {
      try {
        controller.enqueue(new TextEncoder().encode(message));
      } catch (error) {
        // Remove dead connections
        clients.delete(controller);
      }
    });

    return NextResponse.json({ 
      success: true, 
      clientsNotified: clients.size 
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { success: false, error: 'Invalid webhook payload' },
      { status: 400 }
    );
  }
}

// SSE endpoint for clients to subscribe to updates
export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      clients.add(controller);
      
      // Send initial connection message
      const message = `data: ${JSON.stringify({ type: 'connected' })}\n\n`;
      controller.enqueue(new TextEncoder().encode(message));

      // Keep-alive ping every 30 seconds
      const interval = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(': ping\n\n'));
        } catch {
          clearInterval(interval);
          clients.delete(controller);
        }
      }, 30000);

      // Cleanup on close
      return () => {
        clearInterval(interval);
        clients.delete(controller);
      };
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
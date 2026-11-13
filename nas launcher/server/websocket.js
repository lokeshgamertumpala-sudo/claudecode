import { WebSocketServer } from 'ws';
import { validateSatellite } from '../validation/index.js';

const clients = new Set();

export function setupWebSocketServer(server) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws, req) => {
    clients.add(ws);
    console.log(`[WS] Client connected. Total: ${clients.size}`);

    ws.send(JSON.stringify({ type: 'welcome', message: 'Connected to StellarForge AI real-time validation' }));

    ws.on('message', async (data) => {
      try {
        const msg = JSON.parse(data.toString());

        if (msg.type === 'validate') {
          ws.send(JSON.stringify({ type: 'progress', stage: 'starting', progress: 10 }));

          const result = await validateSatellite(msg.satellite);

          ws.send(JSON.stringify({ type: 'progress', stage: 'orbital', progress: 40 }));
          ws.send(JSON.stringify({ type: 'progress', stage: 'power', progress: 70 }));
          ws.send(JSON.stringify({ type: 'progress', stage: 'structural', progress: 90 }));

          ws.send(JSON.stringify({
            type: 'validation_complete',
            result,
            timestamp: new Date().toISOString()
          }));
        } else if (msg.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        }
      } catch (err) {
        ws.send(JSON.stringify({ type: 'error', message: err.message }));
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
      console.log(`[WS] Client disconnected. Total: ${clients.size}`);
    });

    ws.on('error', (err) => {
      console.error('[WS] Error:', err.message);
      clients.delete(ws);
    });
  });

  return wss;
}

export function broadcast(type, data) {
  const msg = JSON.stringify({ type, data, timestamp: new Date().toISOString() });
  for (const client of clients) {
    if (client.readyState === 1) {
      client.send(msg);
    }
  }
}

export function getClientCount() {
  return clients.size;
}
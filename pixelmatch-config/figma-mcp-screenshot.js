#!/usr/bin/env node
// figma-mcp-screenshot.js — pulls a PNG screenshot from the local Figma Dev Mode MCP server and writes it to disk.
// Bypasses the Figma REST API (no rate limit) because the image is rendered by the running Figma Desktop app.
//
// Usage:
//   node pixelmatch-config/figma-mcp-screenshot.js <nodeId> <outputPath>
//   nodeId format: "123:456" or "123-456". Colons and dashes are both accepted.
//
// Requires Figma Desktop running with the Dev Mode MCP server enabled (default endpoint http://127.0.0.1:3845/mcp).
// No Figma token needed.

const fs = require('node:fs');
const path = require('node:path');

const ENDPOINT = process.env.FIGMA_MCP_URL || 'http://127.0.0.1:3845/mcp';

function usage() {
  console.error('Usage: node figma-mcp-screenshot.js <nodeId> <outputPath>');
  process.exit(2);
}

const [, , nodeIdRaw, outputPathRaw] = process.argv;
if (!nodeIdRaw || !outputPathRaw) usage();

const nodeId = nodeIdRaw.replace('-', ':');
const outputPath = path.resolve(outputPathRaw);

function parseSSEBody(body) {
  // SSE frame: "event: message\ndata: <json>\n\n". There may be multiple frames.
  const frames = body.split(/\n\n/).filter(Boolean);
  const payloads = [];
  for (const frame of frames) {
    for (const line of frame.split('\n')) {
      if (line.startsWith('data:')) {
        const json = line.slice(5).trim();
        if (json) {
          try { payloads.push(JSON.parse(json)); } catch { /* ignore non-JSON data lines */ }
        }
      }
    }
  }
  return payloads;
}

async function rpc(sessionId, id, method, params) {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/event-stream',
  };
  if (sessionId) headers['mcp-session-id'] = sessionId;

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers,
    body: JSON.stringify({ jsonrpc: '2.0', id, method, params }),
  });

  const returnedSessionId = res.headers.get('mcp-session-id') || sessionId;
  const body = await res.text();

  if (!res.ok) {
    throw new Error(`MCP ${method} failed (${res.status}): ${body.slice(0, 400)}`);
  }

  const payloads = parseSSEBody(body);
  const match = payloads.find((p) => p.id === id);
  if (!match) {
    throw new Error(`No JSON-RPC response for id=${id}. Raw body: ${body.slice(0, 400)}`);
  }
  if (match.error) {
    throw new Error(`MCP ${method} error: ${JSON.stringify(match.error)}`);
  }
  return { result: match.result, sessionId: returnedSessionId };
}

async function sendNotification(sessionId, method, params = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/event-stream',
    'mcp-session-id': sessionId,
  };
  await fetch(ENDPOINT, {
    method: 'POST',
    headers,
    body: JSON.stringify({ jsonrpc: '2.0', method, params }),
  });
}

async function main() {
  // 1. initialize → get session id + server capabilities
  const init = await rpc(null, 1, 'initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'figma-mcp-screenshot', version: '1.0.0' },
  });
  const sessionId = init.sessionId;
  if (!sessionId) throw new Error('Server did not return mcp-session-id header on initialize');

  // 2. notifications/initialized — required by spec before tool calls
  await sendNotification(sessionId, 'notifications/initialized');

  // 3. tools/call get_screenshot
  const call = await rpc(sessionId, 2, 'tools/call', {
    name: 'get_screenshot',
    arguments: { nodeId },
  });

  // Response shape: { content: [ { type: "image", data: "<base64>", mimeType: "image/png" }, ... ] }
  const content = call.result?.content || [];
  const image = content.find((c) => c.type === 'image' && c.data);
  if (!image) {
    throw new Error(`No image content in response. Got: ${JSON.stringify(call.result).slice(0, 400)}`);
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, Buffer.from(image.data, 'base64'));

  const bytes = fs.statSync(outputPath).size;
  console.log(`Wrote ${outputPath} (${bytes} bytes, ${image.mimeType})`);
}

main().catch((err) => {
  console.error(`figma-mcp-screenshot failed: ${err.message}`);
  process.exit(1);
});

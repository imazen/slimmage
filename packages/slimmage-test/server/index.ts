/**
 * Test server for slimmage Playwright tests.
 * Serves fixtures, generates placeholder images, logs requests.
 */

import { svgResponse } from './image-generator.js';
import { logRequest, getEntries, reset } from './request-log.js';
import { join, resolve } from 'path';
import { readFile, stat } from 'fs/promises';

const PORT = 3456;
const FIXTURES_DIR = resolve(import.meta.dir, '../fixtures');
// slimmage-core dist (built)
const CORE_DIST = resolve(import.meta.dir, '../../slimmage-core/dist');
// slimmage-core src (for dev)
const CORE_SRC = resolve(import.meta.dir, '../../slimmage-core/src');
// slimmage-wc dist
const WC_DIST = resolve(import.meta.dir, '../../slimmage-wc/dist');

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ts': 'application/javascript', // Bun can serve TS directly
};

async function serveFile(filePath: string): Promise<Response | null> {
  try {
    const s = await stat(filePath);
    if (!s.isFile()) return null;
    const content = await readFile(filePath);
    const ext = filePath.slice(filePath.lastIndexOf('.'));
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    return new Response(content, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
      },
    });
  } catch {
    return null;
  }
}

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;

    // --- API routes ---

    // Image generation endpoint
    if (path.startsWith('/image')) {
      logRequest(url);
      const width = parseInt(url.searchParams.get('width') ?? url.searchParams.get('w') ?? '160', 10);
      const height = parseInt(url.searchParams.get('height') ?? url.searchParams.get('h') ?? '0', 10);
      return svgResponse(width, height);
    }

    // Request log
    if (path === '/requests') {
      if (req.method === 'POST') {
        reset();
        return new Response('OK', { status: 200 });
      }
      return Response.json(getEntries());
    }

    // --- Static file serving ---

    // Serve slimmage-core dist as /slimmage-core/*
    if (path.startsWith('/slimmage-core/')) {
      const relPath = path.slice('/slimmage-core/'.length);
      // Try dist first, then src
      const distResp = await serveFile(join(CORE_DIST, relPath));
      if (distResp) return distResp;
      const srcResp = await serveFile(join(CORE_SRC, relPath));
      if (srcResp) return srcResp;
    }

    // Serve slimmage-wc dist as /slimmage-wc/*
    if (path.startsWith('/slimmage-wc/')) {
      const relPath = path.slice('/slimmage-wc/'.length);
      const resp = await serveFile(join(WC_DIST, relPath));
      if (resp) return resp;
    }

    // Serve fixtures
    const fixturePath = join(FIXTURES_DIR, path === '/' ? 'index.html' : path);
    const resp = await serveFile(fixturePath);
    if (resp) return resp;

    return new Response('Not Found', { status: 404 });
  },
});

console.log(`Slimmage test server running on http://localhost:${PORT}`);

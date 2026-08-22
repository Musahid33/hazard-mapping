// ============================================================================
// Hazard Map Dashboard — shared data server with Supabase support
// ============================================================================
// Serves the app (index.html + libraries) AND a shared data store at
// "/api/data" so every device / computer that opens the site sees the SAME
// data.
//
// Storage backends (auto-detected, in order):
//   1) Supabase (if a URL + API key env var are set) — PERSISTENT,
//      survives restarts, scales globally, works on Render/Railway/Vercel.
//   2) Local file data/hazard-data.json — for local dev without Supabase.
//
// Run locally:            node server.js
//   (then open http://localhost:8080 from any device on the network)
//
// Optional env vars:
//   PORT                      — port to listen on (default 8080)
//   SYNC_TOKEN                — if set, clients must send "Authorization: Bearer <token>"
//   SUPABASE_URL              — e.g. https://xyzcompany.supabase.co
//   SUPABASE_SECRET_KEY       — preferred server key from Vercel Marketplace
//   SUPABASE_SERVICE_ROLE_KEY — legacy server key (also supported)
//   SUPABASE_PUBLISHABLE_KEY / SUPABASE_ANON_KEY / SUPABASE_KEY — fallbacks
//   SUPABASE_TABLE            — table name (default: hazard_data)
//   LIVE_URL                  — public live URL for docs (optional)
//   GITHUB_REPO_URL           — GitHub repo URL for docs (optional)
// ============================================================================

'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

// ---- Env config -------------------------------------------------------------
const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0';
const ROOT = __dirname;
// On serverless platforms (Vercel) the bundle filesystem is read-only; only
// /tmp is writable. Supabase should be configured there, but keep the file
// fallback functional so nothing crashes.
const IS_SERVERLESS = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const DATA_DIR = IS_SERVERLESS ? path.join('/tmp', 'hazard-data') : path.join(ROOT, 'data');
const DATA_FILE = path.join(DATA_DIR, 'hazard-data.json');
const TOKEN = (process.env.SYNC_TOKEN || '').trim();

// Supabase env — support both the current Vercel Marketplace names and the
// legacy names used by older Supabase projects.
const SUPABASE_URL = (
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  ''
).trim().replace(/\/+$/, '');
const SUPABASE_KEY = (
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  ''
).trim();
const SUPABASE_TABLE = (process.env.SUPABASE_TABLE || 'hazard_data').trim() || 'hazard_data';
const SUPABASE_KEY_IS_OPAQUE = /^sb_(?:secret|publishable)_/.test(SUPABASE_KEY);

const LIVE_URL = (process.env.LIVE_URL || '').trim();
const GITHUB_REPO_URL = (process.env.GITHUB_REPO_URL || 'https://github.com/Musahid33/hazard-mapping').trim();

const USE_SUPABASE = !!(SUPABASE_URL && SUPABASE_KEY);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/plain; charset=utf-8'
};

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
  'Access-Control-Max-Age': '86400'
};

function sendJSON(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, Object.assign({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  }, CORS_HEADERS));
  res.end(body);
}

// ---- File backend (fallback) ------------------------------------------------
function readDataFromFile() {
  try {
    if (!fs.existsSync(DATA_FILE)) return { updatedAt: 0, data: null };
    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    return { updatedAt: parsed.updatedAt || 0, data: parsed.data || null };
  } catch (e) {
    return { updatedAt: 0, data: null };
  }
}

function writeDataToFile(record) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = DATA_FILE + '.tmp-' + Date.now();
  fs.writeFileSync(tmp, JSON.stringify(record), 'utf8');
  fs.renameSync(tmp, DATA_FILE);
  return record;
}

// ---- Supabase backend (primary for live) ------------------------------------
// Uses Supabase REST API via global fetch (Node 18+). No external dep required.
// Table schema: hazard_data(id int PK, data jsonb, updated_at bigint)
async function supabaseFetch(pathQuery, opts = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${pathQuery}`;
  const authHeaders = { 'apikey': SUPABASE_KEY };
  // Current sb_secret_/sb_publishable_ keys are opaque API keys, not JWTs.
  // Sending them as Bearer tokens causes Supabase to reject the request.
  if (!SUPABASE_KEY_IS_OPAQUE) {
    authHeaders.Authorization = `Bearer ${SUPABASE_KEY}`;
  }
  const headers = Object.assign(authHeaders, {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Prefer': 'return=representation'
  }, opts.headers || {});
  const res = await fetch(url, Object.assign({}, opts, { headers }));
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch (_) { json = null; }
  return { ok: res.ok, status: res.status, json, text };
}

async function readDataFromSupabase() {
  try {
    // Try to get row id=1
    const { ok, json } = await supabaseFetch(`${SUPABASE_TABLE}?id=eq.1&select=*`);
    if (!ok) throw new Error('supabase read failed');
    if (Array.isArray(json) && json.length > 0) {
      const row = json[0];
      return {
        updatedAt: row.updated_at || row.updatedAt || 0,
        data: row.data || null
      };
    }
    // No row yet — return empty
    return { updatedAt: 0, data: null };
  } catch (e) {
    console.error('[supabase] read error:', e.message);
    // Fallback to file
    return readDataFromFile();
  }
}

async function writeDataToSupabase(record) {
  try {
    // Upsert row id=1
    const payload = {
      id: 1,
      data: record.data,
      updated_at: record.updatedAt
    };
    const { ok, status, json, text } = await supabaseFetch(`${SUPABASE_TABLE}`, {
      method: 'POST',
      headers: { 'Prefer': 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify(payload)
    });
    if (!ok) {
      // Try PATCH if POST upsert not supported (older PostgREST)
      const patchRes = await supabaseFetch(`${SUPABASE_TABLE}?id=eq.1`, {
        method: 'PATCH',
        body: JSON.stringify({ data: record.data, updated_at: record.updatedAt })
      });
      if (!patchRes.ok) {
        // If no row exists, try insert
        if (patchRes.json && Array.isArray(patchRes.json) && patchRes.json.length === 0) {
          await supabaseFetch(`${SUPABASE_TABLE}`, {
            method: 'POST',
            body: JSON.stringify(payload)
          });
        } else {
          throw new Error(`supabase write failed: ${status} ${text}`);
        }
      }
    }
    return record;
  } catch (e) {
    console.error('[supabase] write error:', e.message);
    // Fallback to file so we don't lose data
    return writeDataToFile(record);
  }
}

// Unified async API
async function readData() {
  if (USE_SUPABASE) {
    return await readDataFromSupabase();
  }
  return readDataFromFile();
}

async function writeData(record) {
  if (USE_SUPABASE) {
    return await writeDataToSupabase(record);
  }
  return writeDataToFile(record);
}

function authorized(req) {
  if (!TOKEN) return true;
  const auth = req.headers['authorization'] || '';
  return auth === 'Bearer ' + TOKEN;
}

function serveStatic(req, res, pathname) {
  let p = pathname.split('?')[0];
  try { p = decodeURIComponent(p); } catch (e) { p = pathname; }
  if (p === '/' || p === '') p = '/index.html';
  const resolved = path.resolve(ROOT, '.' + p);
  if (resolved !== ROOT && !resolved.startsWith(ROOT + path.sep)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  let filePath = resolved;
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(ROOT, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Cache-Control': 'no-cache'
  });
  fs.createReadStream(filePath).pipe(res);
}

// ---- Request handler (used by both node server and Vercel serverless) -------
async function handler(req, res) {
  const pathname = (req.url || '/').split('?')[0];

  // ---- Shared data API -----------------------------------------------------
  if (pathname === '/api/data' || pathname === '/api/data/') {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, CORS_HEADERS);
      res.end();
      return;
    }
    if (!authorized(req)) {
      sendJSON(res, 401, { error: 'unauthorized' });
      return;
    }

    if (req.method === 'GET') {
      const data = await readData();
      sendJSON(res, 200, data);
      return;
    }

    if (req.method === 'PUT' || req.method === 'POST') {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
        if (body.length > 20 * 1024 * 1024) req.destroy();
      });
      req.on('end', async () => {
        try {
          const payload = JSON.parse(body || '{}');
          if (payload.data === undefined) {
            sendJSON(res, 400, { error: 'missing "data" field' });
            return;
          }
          const record = { updatedAt: Date.now(), data: payload.data };
          const saved = await writeData(record);
          sendJSON(res, 200, saved);
        } catch (e) {
          sendJSON(res, 400, { error: 'invalid JSON body' });
        }
      });
      return;
    }

    if (req.method === 'DELETE') {
      const record = { updatedAt: Date.now(), data: null };
      const saved = await writeData(record);
      sendJSON(res, 200, saved);
      return;
    }

    sendJSON(res, 405, { error: 'method not allowed' });
    return;
  }

  if (pathname === '/api/health') {
    const data = await readData();
    sendJSON(res, 200, {
      ok: true,
      updatedAt: data.updatedAt,
      backend: USE_SUPABASE ? 'supabase' : 'file',
      supabase: USE_SUPABASE ? { url: SUPABASE_URL, table: SUPABASE_TABLE, connected: true } : { connected: false },
      liveUrl: LIVE_URL || null,
      github: GITHUB_REPO_URL,
      version: '2.0-supabase'
    });
    return;
  }

  if (pathname === '/api/config' || pathname === '/api/live-urls') {
    sendJSON(res, 200, {
      liveUrl: LIVE_URL || null,
      githubRepo: GITHUB_REPO_URL,
      githubPages: 'https://musahid33.github.io/hazard-mapping/',
      supabase: USE_SUPABASE ? { enabled: true, url: SUPABASE_URL, table: SUPABASE_TABLE } : { enabled: false },
      apiBase: USE_SUPABASE ? 'supabase' : 'file',
      syncEndpoints: {
        data: '/api/data',
        health: '/api/health',
        config: '/api/config'
      },
      deployment: {
        render: LIVE_URL || 'https://hazard-mapping.onrender.com',
        docker: 'Docker supported (see Dockerfile)',
        node: 'node server.js'
      }
    });
    return;
  }

  // ---- Static files ---------------------------------------------------------
  if (req.method === 'GET' || req.method === 'HEAD') {
    serveStatic(req, res, pathname);
    return;
  }

  res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Method Not Allowed');
}

// Export for serverless platforms (Vercel: api/index.js re-exports this).
module.exports = handler;
module.exports.handler = handler;
module.exports.createServer = () => http.createServer(handler);

// ---- Standalone server (node server.js / Docker / Render) -------------------
function startServer() {
  const server = http.createServer(handler);
  server.listen(PORT, HOST, () => {
  console.log('----------------------------------------------');
  console.log('  Hazard Map Dashboard server v2.0-supabase');
  console.log('  Site + shared data:  http://localhost:' + PORT);
  console.log('  Data API:            http://localhost:' + PORT + '/api/data');
  console.log('  Health:              http://localhost:' + PORT + '/api/health');
  console.log('  Config:              http://localhost:' + PORT + '/api/config');
  if (USE_SUPABASE) {
    console.log('  Backend:             Supabase');
    console.log('  Supabase URL:        ' + SUPABASE_URL);
    console.log('  Supabase Table:      ' + SUPABASE_TABLE);
  } else {
    console.log('  Backend:             File (' + DATA_FILE + ')');
    console.log('  (Set SUPABASE_URL + SUPABASE_SECRET_KEY to enable Supabase)');
  }
  if (TOKEN) console.log('  Access token:        enabled');
  if (LIVE_URL) console.log('  Live URL:            ' + LIVE_URL);
    console.log('  GitHub:              ' + GITHUB_REPO_URL);
    console.log('----------------------------------------------');
  });
  return server;
}

module.exports.startServer = startServer;

// Only listen when run directly — on Vercel the file is imported, not run.
if (require.main === module) {
  startServer();
}

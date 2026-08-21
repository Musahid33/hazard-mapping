// ============================================================================
// Hazard Map Dashboard — shared data server
// ============================================================================
// Serves the app (index.html + libraries) AND a tiny shared data store at
// "/api/data" so every device / computer that opens the site sees the SAME
// data. Data lives in data/hazard-data.json on the server and is kept even if
// a browser is closed — it only disappears when someone presses "Reset".
//
// Run it locally:            node server.js
//   (then open http://localhost:8080 from any device on the network)
//
// Optional env vars:
//   PORT        — port to listen on (default 8080)
//   SYNC_TOKEN  — if set, clients must send "Authorization: Bearer <token>"
//                 (match this with the "Access Token" field in ⚙️ Settings)
// ============================================================================

'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0';
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const DATA_FILE = path.join(DATA_DIR, 'hazard-data.json');
const TOKEN = (process.env.SYNC_TOKEN || '').trim();

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
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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

function readData() {
  try {
    if (!fs.existsSync(DATA_FILE)) return { updatedAt: 0, data: null };
    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    return { updatedAt: parsed.updatedAt || 0, data: parsed.data || null };
  } catch (e) {
    return { updatedAt: 0, data: null };
  }
}

function writeData(record) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = DATA_FILE + '.tmp-' + Date.now();
  fs.writeFileSync(tmp, JSON.stringify(record), 'utf8');
  fs.renameSync(tmp, DATA_FILE); // atomic on the same volume
  return record;
}

function authorized(req) {
  if (!TOKEN) return true;
  const auth = req.headers['authorization'] || '';
  return auth === 'Bearer ' + TOKEN;
}

function serveStatic(req, res, pathname) {
  // Resolve the requested path safely inside ROOT (never allow "../" escapes).
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
    // SPA fallback → index.html
    filePath = path.join(ROOT, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Cache-Control': 'no-cache'
  });
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer((req, res) => {
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
      sendJSON(res, 200, readData());
      return;
    }

    if (req.method === 'PUT' || req.method === 'POST') {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
        if (body.length > 20 * 1024 * 1024) req.destroy(); // 20 MB safety cap
      });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}');
          if (payload.data === undefined) {
            sendJSON(res, 400, { error: 'missing "data" field' });
            return;
          }
          const record = { updatedAt: Date.now(), data: payload.data };
          writeData(record);
          sendJSON(res, 200, record);
        } catch (e) {
          sendJSON(res, 400, { error: 'invalid JSON body' });
        }
      });
      return;
    }

    if (req.method === 'DELETE') {
      const record = { updatedAt: Date.now(), data: null };
      writeData(record);
      sendJSON(res, 200, record);
      return;
    }

    sendJSON(res, 405, { error: 'method not allowed' });
    return;
  }

  if (pathname === '/api/health') {
    sendJSON(res, 200, { ok: true, updatedAt: readData().updatedAt });
    return;
  }

  // ---- Static files ---------------------------------------------------------
  if (req.method === 'GET' || req.method === 'HEAD') {
    serveStatic(req, res, pathname);
    return;
  }

  res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Method Not Allowed');
});

server.listen(PORT, HOST, () => {
  console.log('----------------------------------------------');
  console.log('  Hazard Map Dashboard server');
  console.log('  Site + shared data:  http://localhost:' + PORT);
  console.log('  Data API:            http://localhost:' + PORT + '/api/data');
  console.log('  Data file:           ' + DATA_FILE);
  if (TOKEN) console.log('  Access token:        enabled');
  console.log('----------------------------------------------');
});

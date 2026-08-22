// ============================================================================
// Vercel serverless entrypoint
// ----------------------------------------------------------------------------
// Vercel imports this file and calls the exported function for every request
// routed to /api/* (see vercel.json). It reuses the exact same request handler
// as the standalone node server, so local dev (`node server.js`), Docker,
// Render and Vercel all behave identically.
//
// NOTE: Vercel functions are stateless with a read-only filesystem, so the
// local-file storage fallback is not durable there. Set SUPABASE_URL and
// SUPABASE_SECRET_KEY in the Vercel project env vars for persistent storage.
// ============================================================================

'use strict';

const handler = require('../server.js');

module.exports = (req, res) => handler(req, res);

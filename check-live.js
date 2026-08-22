#!/usr/bin/env node
// ============================================================================
// check-live.js — verify a deployed Hazard Map URL is globally usable
//   node check-live.js https://your-app.vercel.app
// Checks: site loads, /api/health responds, storage backend is Supabase,
// and a write from one device is readable by another (global sync).
// ============================================================================
'use strict';

const base = (process.argv[2] || process.env.LIVE_URL || '').replace(/\/+$/, '');
if (!base) {
  console.error('Usage: node check-live.js https://your-app.vercel.app');
  process.exit(2);
}
const token = (process.env.SYNC_TOKEN || '').trim();
const headers = Object.assign(
  { 'Content-Type': 'application/json' },
  token ? { Authorization: 'Bearer ' + token } : {}
);

const ok = (m) => console.log('  PASS  ' + m);
const bad = (m) => { console.log('  FAIL  ' + m); failures++; };
const warn = (m) => console.log('  WARN  ' + m);
let failures = 0;

(async () => {
  console.log('\nChecking ' + base + '\n');

  // 1. Static site
  try {
    const r = await fetch(base + '/', { redirect: 'follow' });
    const html = await r.text();
    r.ok && /hazard/i.test(html)
      ? ok('site loads (' + r.status + ')')
      : bad('site returned ' + r.status + ' or is not the Hazard Map app');
  } catch (e) { bad('site unreachable: ' + e.message); }

  // 2. API health + backend
  let health = null;
  try {
    const r = await fetch(base + '/api/health', { headers });
    health = await r.json();
    r.ok && health.ok ? ok('/api/health responds') : bad('/api/health status ' + r.status);
  } catch (e) { bad('/api/health failed: ' + e.message); }

  if (health) {
    if (health.backend === 'supabase') ok('storage backend: Supabase (shared globally)');
    else bad('storage backend: ' + health.backend + ' — data is NOT shared between devices. Set SUPABASE_URL + SUPABASE_SECRET_KEY.');
  }

  // 3. Round-trip write/read = "does an edit by one user reach everyone?"
  try {
    const before = await (await fetch(base + '/api/data', { headers })).json();
    const probe = { __check: true, at: new Date().toISOString() };
    const put = await fetch(base + '/api/data', {
      method: 'PUT', headers, body: JSON.stringify({ data: probe })
    });
    if (!put.ok) throw new Error('write returned ' + put.status);
    const after = await (await fetch(base + '/api/data', { headers })).json();
    after && after.data && after.data.__check
      ? ok('write → read round-trip works (edits propagate to all devices)')
      : bad('write did not persist');
    // restore previous data
    if (before && before.data !== undefined) {
      await fetch(base + '/api/data', {
        method: 'PUT', headers, body: JSON.stringify({ data: before.data })
      });
      warn('previous data restored after the probe write');
    }
  } catch (e) { bad('data round-trip failed: ' + e.message); }

  console.log(failures === 0
    ? '\nAll checks passed — this URL is ready for global use.\n'
    : '\n' + failures + ' check(s) failed — see VERCEL-DEPLOY.md.\n');
  process.exit(failures === 0 ? 0 : 1);
})();

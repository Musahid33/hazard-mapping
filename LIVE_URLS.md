# 🌐 Live URLs — Hazard Map Dashboard (Supabase + GitHub)

Central document for all live deployment URLs. Updated for v2.0-supabase.

## 🚀 Primary Live URLs

| Label | URL | Type |
|---|---|---|
| **Live App (Render)** | `https://hazard-mapping.onrender.com` | Node + Supabase API + Frontend |
| **GitHub Pages (Static)** | `https://Musahid33.github.io/hazard-mapping/` | Static frontend with direct Supabase sync |
| **GitHub Repo** | `https://github.com/Musahid33/hazard-mapping` | Source code |
| **Supabase Dashboard** | `https://supabase.com/dashboard` → select project | DB admin |
| **API Health** | `https://hazard-mapping.onrender.com/api/health` | Backend status |
| **API Config** | `https://hazard-mapping.onrender.com/api/config` | Live URLs JSON |
| **API Data** | `https://hazard-mapping.onrender.com/api/data` | Shared data |

## 📦 API Endpoints (Same for all deployments)

```
GET  /api/data    → { updatedAt, data } — shared hazard map JSON
PUT  /api/data    → { data } — save new data (requires token if SYNC_TOKEN set)
DELETE /api/data  → clears data (resets for everyone)
GET  /api/health  → { ok, backend, supabase, liveUrl, github, updatedAt, version }
GET  /api/config  → { liveUrl, githubRepo, githubPages, supabase, apiEndpoints, deployment }
GET  /live-config.json → static file with same info (for GitHub Pages)
```

## ☁️ Supabase

- **Project URL**: `https://YOUR_PROJECT_ID.supabase.co` (replace with yours)
- **Table**: `public.hazard_data` (id=1 row)
- **Schema**: `supabase/schema.sql`
- **Setup Guide**: `supabase/README.md`
- **Keys**: Project Settings → API → put only the `anon` public key in `live-config.json`; keep `service_role` on the server

Env vars to set on host:
```
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_TABLE=hazard_data
```

## 🐳 Deployment Hosts

| Host | How to Deploy | Env Vars |
|---|---|---|
| **Render** | Blueprint → connect repo → auto from `render.yaml` | Set SUPABASE_URL + SERVICE_ROLE_KEY in dashboard |
| **Railway** | New Service → GitHub repo → start `node server.js` | Same env vars |
| **Fly.io** | `fly launch` → Dockerfile | Same |
| **Docker (VPS)** | `docker build -t hazard-map . && docker run -p 8080:8080 --env-file .env hazard-map` | Use `.env` file |
| **Vercel** | `vercel --prod` with `vercel.json` | Set env in Vercel dashboard |
| **GitHub Pages** | Auto on push to `main` via `deploy.yml` | Set Supabase URL + anon public key in `live-config.json`; sync is direct |

## 🔄 How URLs Auto-Update

1. **server.js** reads `LIVE_URL` + `GITHUB_REPO_URL` env vars and returns them in `/api/health` + `/api/config`
2. **live-config.json** is checked in with the Supabase URL and anon public key needed by the static Pages client
3. **deploy.yml** validates and preserves that file on each Pages deployment
4. **index.html** loads `live-config.json` first, then syncs directly through Supabase REST; the server API remains the Docker/Render fallback

## 📋 Copy-Paste for Team

Share this with your team:

```
🚀 Live Hazard Map: https://hazard-mapping.onrender.com
📄 GitHub Pages: https://Musahid33.github.io/hazard-mapping/
💻 GitHub Repo: https://github.com/Musahid33/hazard-mapping
☁️ Supabase: Configure via env vars, data persists globally
🔍 Health: https://hazard-mapping.onrender.com/api/health
```

## 🛠️ To Configure Supabase for GitHub Pages

1. Create the project and run `supabase/schema.sql`
2. Update `live-config.json` with the project URL and `anonKey` public key:
   ```json
   "supabase": {
     "enabled": true,
     "table": "hazard_data",
     "url": "https://YOUR_PROJECT.supabase.co",
     "anonKey": "YOUR_SUPABASE_ANON_KEY"
   }
   ```
3. Push to `main` → GitHub Pages deploys with direct Supabase sync
4. No Render URL entry is needed. Keep `service_role` out of this static file.

## ✅ Verification

```bash
# Check live server health (should show supabase connected)
curl https://hazard-mapping.onrender.com/api/health | jq

# Check config (all URLs)
curl https://hazard-mapping.onrender.com/api/config | jq

# Check GitHub Pages config
curl https://musahid33.github.io/hazard-mapping/live-config.json | jq
```

All URLs are now centralized and auto-discoverable.

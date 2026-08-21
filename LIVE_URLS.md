# 🌐 Live URLs — Hazard Map Dashboard (Supabase + GitHub)

Central document for all live deployment URLs. Updated for v2.0-supabase.

## 🚀 Primary Live URLs

| Label | URL | Type |
|---|---|---|
| **Live App (Render)** | `https://hazard-mapping.onrender.com` | Node + Supabase API + Frontend |
| **GitHub Pages (Static)** | `https://Musahid33.github.io/hazard-mapping/` | Static frontend, syncs to live server |
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
- **Keys**: Project Settings → API → `anon` + `service_role`

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
| **GitHub Pages** | Auto on push to `main` via `deploy.yml` | Static only, set Shared Server URL in UI to point to live API |

## 🔄 How URLs Auto-Update

1. **server.js** reads `LIVE_URL` + `GITHUB_REPO_URL` env vars and returns them in `/api/health` + `/api/config`
2. **deploy.yml** (GitHub Action) generates `live-config.json` on each push to `main` with current URLs + timestamp
3. **index.html** fetches `live-config.json` + `/api/config` on load and renders in **Settings → Live Deployment** panel
4. So updating env var `LIVE_URL` on Render automatically propagates to frontend

## 📋 Copy-Paste for Team

Share this with your team:

```
🚀 Live Hazard Map: https://hazard-mapping.onrender.com
📄 GitHub Pages: https://Musahid33.github.io/hazard-mapping/
💻 GitHub Repo: https://github.com/Musahid33/hazard-mapping
☁️ Supabase: Configure via env vars, data persists globally
🔍 Health: https://hazard-mapping.onrender.com/api/health
```

## 🛠️ To Change Live URL

1. Deploy to new host (e.g. `https://your-custom-domain.com`)
2. Set env var `LIVE_URL=https://your-custom-domain.com` on that host
3. Update `live-config.json` in repo:
   ```json
   { "liveUrl": "https://your-custom-domain.com", ... }
   ```
4. Push to main → GitHub Pages auto-updates
5. Frontend Settings panel will show new URL after next load

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

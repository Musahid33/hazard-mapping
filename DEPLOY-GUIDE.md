# 🚀 Deploy Guide — Live (Supabase + GitHub + URLs) v2.0

You asked for **Supabase everywhere, GitHub, and live URL updates** — this guide covers the full live stack.

| Component | URL / Location | Status |
|---|---|---|
| **Live App (Render/Docker)** | `https://hazard-mapping.onrender.com` | ✅ Supabase-backed API + frontend |
| **GitHub Pages** | `https://Musahid33.github.io/hazard-mapping/` | ✅ Auto-deploys on push to main |
| **GitHub Repo** | `https://github.com/Musahid33/hazard-mapping` | ✅ Source + workflows |
| **Supabase** | `https://YOUR_PROJECT.supabase.co` | ✅ Persistent global DB |
| **Health** | `/api/health` | ✅ Shows backend + Supabase status |
| **Config** | `/api/config` + `live-config.json` | ✅ All live URLs |

---

## 1) Supabase Setup (Primary — Makes Data Live & Persistent)

### Why Supabase?
Old file backend (`data/hazard-data.json`) disappears on free hosts after redeploy. Supabase keeps data forever and syncs globally.

### Steps

1. **Create Project**: https://supabase.com → New Project → name `hazard-mapping` → region closest to you → wait 2 min
2. **Run SQL**: Dashboard → SQL Editor → New Query → paste `supabase/schema.sql` → Run
   - This creates table `hazard_data (id=1, data=jsonb, updated_at=bigint)` + audit log + RLS policies
3. **Get Keys**: Project Settings → API → copy:
   - `Project URL` → `SUPABASE_URL`
   - `service_role` (secret) → `SUPABASE_SERVICE_ROLE_KEY`
   - `anon` public → `SUPABASE_ANON_KEY` (optional)
4. **Verify**:
   ```sql
   select * from public.hazard_data where id=1;
   ```

---

## 2) Deploy Live Server (Choose One)

### A) Render.com (Easiest, Free, Recommended)

1. Push repo to **GitHub** (`Musahid33/hazard-mapping`)
2. Go to https://render.com → **New +** → **Blueprint** → connect repo
3. Render reads `render.yaml` and creates service `hazard-map-dashboard`
4. In Render → Service → Environment → set:
   ```
   SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   SUPABASE_TABLE=hazard_data
   LIVE_URL=https://hazard-map-dashboard.onrender.com
   GITHUB_REPO_URL=https://github.com/Musahid33/hazard-mapping
   PORT=8080
   ```
5. Deploy → live URL: `https://hazard-map-dashboard.onrender.com`
6. Open live URL on any phone/laptop — everyone shares SAME Supabase data

> Free Render sleeps after idle; first open after sleep takes 30-60s. Upgrade or use Railway/Fly for always-on.

### B) Railway / Fly.io / Koyeb / Any Node Host

- **Start command**: `node server.js` or `npm start`
- **Port**: `8080` or `$PORT`
- **Env vars**: same as Render above
- **Health check**: `GET /api/health`

### C) Docker (Any VPS)

```bash
docker build -t hazard-map .
docker run -d -p 8080:8080 \
  -e SUPABASE_URL=https://YOUR_PROJECT.supabase.co \
  -e SUPABASE_SERVICE_ROLE_KEY=xxx \
  -e LIVE_URL=https://your-domain.com \
  --name hazard-map hazard-map
```

### D) Vercel / Netlify (Serverless)

We include `vercel.json`. Set env vars in Vercel dashboard and deploy. Note: server.js is designed for long-running Node, but works on Vercel with `@vercel/node` wrapper — or deploy frontend to Vercel and API to Render.

---

## 3) GitHub Pages (Static Frontend + Sync to Live Server)

`deploy.yml` already auto-deploys to Pages on every push to `main`.

- **Static URL**: `https://Musahid33.github.io/hazard-mapping/`
- **How to make it live-sync**:
  1. Open Pages URL
  2. Unlock builder (username: `musahid12`, password: `Aaru#123`)
  3. Settings → **Shared Data Server URL** → paste `https://your-service.onrender.com` → Save → Sync Now
  4. Now Pages frontend syncs to your Supabase-backed server

The workflow also generates `live-config.json` with all live URLs for frontend discovery.

---

## 4) Update URLs Everywhere (Done)

We updated URLs in all places:

- **server.js**: new `/api/config` and `/api/health` return `liveUrl`, `githubRepo`, `supabase` status
- **live-config.json**: static JSON with all live URLs (auto-updated by GitHub Action)
- **.env.example**: template with `LIVE_URL`, `GITHUB_REPO_URL`, `SUPABASE_URL`, etc.
- **render.yaml**: includes Supabase env vars + `LIVE_URL` auto from Render host
- **Dockerfile**: includes healthcheck + env docs for Supabase
- **deploy.yml**: injects live-config.json on deploy to Pages
- **index.html**: new **Live Deployment** panel in Settings shows:
  - Live App URL (Render)
  - GitHub Pages URL
  - GitHub Repo URL
  - Supabase status (connected / file fallback)
  - Buttons: Check Health, Copy URLs, Open Live
- **README.md**: full table of live URLs
- **LIVE_URLS.md**: dedicated doc (see below)
- **supabase/**: schema + setup guide

---

## 5) How to Test Live

1. **Health**:
   ```bash
   curl https://your-service.onrender.com/api/health
   # Should return { ok:true, backend:"supabase", supabase:{connected:true} }
   ```
2. **Config**:
   ```bash
   curl https://your-service.onrender.com/api/config
   # Returns all live URLs
   ```
3. **Data**:
   - Open live URL on Phone A → add hazard area
   - Open same URL on Laptop B → should auto-appear in 6s
   - Check Supabase Dashboard → Table Editor → hazard_data → id=1 → data column should have JSON

---

## 6) Troubleshooting

| Problem | Fix |
|---|---|
| Data resets after deploy | You used file backend. Set SUPABASE_URL + SERVICE_ROLE_KEY env vars |
| Supabase 401 / read fails | Check table exists, RLS policies allow read/write, keys correct |
| "No shared server found" in app | You're on file:// or GitHub Pages without server URL. Paste live server URL in Settings |
| Devices don't sync | Must open SAME live server URL. Check Settings → Sync Now shows ✓ Connected |
| Render sleeps | Free tier sleeps. First request after idle slow. Use paid or Railway |
| Excel/PPT not working | Ensure xlsx.full.min.js / pptxgen.bundle.js next to index.html |
| Old version showing | Hard refresh Ctrl+Shift+R |

---

## 7) Security Checklist

- [ ] Supabase table has RLS enabled with policies (see schema.sql)
- [ ] Server uses SERVICE_ROLE_KEY (bypasses RLS) — keep secret
- [ ] Optional: set SYNC_TOKEN on server + Access Token in app Settings to protect writes
- [ ] Builder auth: username `musahid12`, password `Aaru#123` (hashed in frontend)

---

## 8) Next Steps for You

1. Create Supabase project and run `supabase/schema.sql`
2. Set env vars on Render (or your host)
3. Push to GitHub main → auto-deploys to Pages + Render (if connected)
4. Open `https://Musahid33.github.io/hazard-mapping/` → set Shared Data Server URL to your Render URL
5. Share live URL with team — everyone now sees same global data via Supabase

All code updated — just add your Supabase keys and deploy!

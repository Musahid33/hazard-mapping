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

## 3) GitHub Pages (Static Frontend + Direct Supabase Sync)

`deploy.yml` auto-deploys the static site to Pages and preserves the checked-in `live-config.json`.

- **Static URL**: `https://Musahid33.github.io/hazard-mapping/`
- Before pushing, edit `live-config.json`:
  ```json
  "supabase": {
    "enabled": true,
    "table": "hazard_data",
    "url": "https://YOUR_PROJECT.supabase.co",
    "anonKey": "YOUR_SUPABASE_ANON_KEY"
  }
  ```
- Run `supabase/schema.sql` in the Supabase SQL editor, then reload the Pages URL.
- The browser discovers the keys and syncs directly through Supabase REST. No Render URL or manual Settings entry is required.

Use only the `anon` public key in this static file. Keep `service_role` in the server environment.

---

## 4) Update URLs Everywhere (Done)

We updated URLs in all places:

- **server.js**: new `/api/config` and `/api/health` return `liveUrl`, `githubRepo`, `supabase` status
- **live-config.json**: static JSON with all live URLs plus the Supabase URL and anon public key used for direct Pages sync
- **.env.example**: template with `LIVE_URL`, `GITHUB_REPO_URL`, `SUPABASE_URL`, etc.
- **render.yaml**: includes Supabase env vars + `LIVE_URL` auto from Render host
- **Dockerfile**: includes healthcheck + env docs for Supabase
- **deploy.yml**: validates and preserves live-config.json on deploy to Pages
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
| "Supabase is not configured" in app | Replace the placeholders in live-config.json with the Supabase URL and anon public key |
| Devices don't sync | Run supabase/schema.sql, verify RLS policies and the browser's Supabase key, then use Settings → Sync Now |
| Render sleeps | Free tier sleeps. First request after idle slow. Use paid or Railway |
| Excel/PPT not working | Ensure xlsx.full.min.js / pptxgen.bundle.js next to index.html |
| Old version showing | Hard refresh Ctrl+Shift+R |

---

## 7) Security Checklist

- [ ] Supabase table has RLS enabled with policies (see schema.sql)
- [ ] Server uses SERVICE_ROLE_KEY (bypasses RLS) — keep secret
- [ ] Optional: set `SYNC_TOKEN` on the server to protect the server-backed API; Pages direct sync is protected by Supabase RLS
- [ ] Builder auth: username `musahid12`, password `Aaru#123` (hashed in frontend)

---

## 8) Next Steps for You

1. Create Supabase project and run `supabase/schema.sql`
2. Set env vars on Render (or your host)
3. Push to GitHub main → auto-deploys to Pages + Render (if connected)
4. Put the Supabase URL and anon public key in `live-config.json`
5. Open `https://Musahid33.github.io/hazard-mapping/` — direct Supabase sync is automatic, with no Render URL entry
6. Share the Pages URL with the team — everyone now sees the same global data via Supabase

All code updated — just add your Supabase keys and deploy!

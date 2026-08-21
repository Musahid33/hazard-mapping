# Hazard Map Dashboard – Emvess Infraventures Pvt Ltd (Live + Supabase)

A **Hazard Map Dashboard** web app — HTML/CSS/JavaScript with a Node server that now uses **Supabase** for persistent, global, cross-device data.

## 🌐 Live URLs (Updated)

| Service | URL | Purpose |
|---|---|---|
| **🚀 Live App (Render)** | `https://hazard-mapping.onrender.com` | Main live site + API (Supabase-backed) |
| **📄 GitHub Pages** | `https://Musahid33.github.io/hazard-mapping/` | Static frontend (can sync to live server) |
| **💻 GitHub Repo** | `https://github.com/Musahid33/hazard-mapping` | Source code, issues, PRs |
| **☁️ Supabase Dashboard** | `https://supabase.com/dashboard` | Database, SQL editor, auth |
| **🔍 Health Check** | `https://hazard-mapping.onrender.com/api/health` | Server + Supabase status |
| **⚙️ Config** | `https://hazard-mapping.onrender.com/api/config` | Live URLs + backend info |
| **📦 API Data** | `https://hazard-mapping.onrender.com/api/data` | Shared hazard data JSON |

> All URLs are also available in `live-config.json` and via `/api/config` endpoint. Frontend auto-loads them in **Settings → Live Deployment** panel.

---

## ✨ Features v2.0-supabase

- 🗺️ Hazard map table builder with live preview
- ☁️ **Supabase** persistent storage — data survives redeploys, works on Render/Railway/Vercel
- 🔄 **Cross-device sync** — every device hitting the live URL shares SAME data (Supabase table `hazard_data`)
- 📄 Document header with **Document No.** (`EIPL/SMP/HM/01`) + editable **Rev. No.** (00–20)
- 🔍 Filters: Location, SOP, Risk Level + column show/hide
- 🖨️ Print / PDF, 📊 Excel, 📽️ PowerPoint export
- 🔊 Listen (TTS) natural voice summary + per-row listen
- ⛶ Fullscreen preview (filter bar stays visible)
- 🔒 Password-protected builder (SHA-256 auth)
- 🌐 English-only data entry + auto Hindi display conversion
- 📝 Hazard change request (anonymous option) to `emvssafetyteam@gmail.com`

---

## 📁 Project Structure (Updated)

```
hazard-mapping/
├── index.html            # Entire app (HTML + CSS + JS)
├── server.js             # Server v2.0 — Supabase + file fallback
├── package.json          # Includes @supabase/supabase-js
├── supabase/
│   ├── schema.sql        # SQL to create hazard_data table
│   └── README.md         # Supabase setup guide
├── live-config.json      # Live URLs (auto-updated by GitHub Action)
├── .env.example          # Env template for Supabase + live URLs
├── Dockerfile            # Updated for Supabase
├── render.yaml           # Render blueprint with Supabase env vars
├── Procfile              # For Heroku/Railway: web: node server.js
├── vercel.json           # Optional Vercel deployment
├── deploy.yml            # GitHub Pages deploy + live-config injection
├── xlsx.full.min.js      # Excel library
├── pptxgen.bundle.js     # PPT library
├── data/                 # Created at runtime (file fallback only)
├── README.md
├── DEPLOY-GUIDE.md       # Updated for Supabase live deploy
└── LIVE_URLS.md          # All live URLs documented
```

---

## 🚀 Run Locally (with Supabase)

### Option 1: With Supabase (recommended for live-like behavior)

1. Create Supabase project at https://supabase.com
2. Run `supabase/schema.sql` in SQL Editor
3. Get `SUPABASE_URL` + `SERVICE_ROLE_KEY` from Project Settings → API
4. Create `.env` from `.env.example` and fill keys
5. Install + run:

```bash
npm install
npm start
# open http://localhost:8080
```

Server will log:
```
Backend: Supabase
Supabase URL: https://xxx.supabase.co
```

### Option 2: Without Supabase (file fallback, local only)

```bash
node server.js
# open http://localhost:8080
# Data stored in data/hazard-data.json (not persistent on free hosts)
```

---

## ☁️ Deploy Live (Supabase + Render)

### 1) Supabase Setup (5 min)

See `supabase/README.md` or run:

```sql
-- In Supabase SQL Editor:
create table public.hazard_data (id int primary key, data jsonb, updated_at bigint);
insert into public.hazard_data (id, data, updated_at) values (1, null, 0) on conflict do nothing;
-- Enable RLS + public read/write policies (see schema.sql for full version)
```

### 2) Render Deploy (One-Click)

1. Push this repo to your GitHub (`Musahid33/hazard-mapping`)
2. Go to https://render.com → **New +** → **Blueprint**
3. Connect repo — Render auto-detects `render.yaml`
4. In Environment, set:
   ```
   SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   LIVE_URL=https://your-service.onrender.com
   ```
5. Deploy → you get live URL like `https://hazard-map-dashboard.onrender.com`
6. Open live URL on any device — everyone shares same Supabase data

### 3) GitHub Pages (Static Frontend)

Already auto-deploys on push to `main` via `deploy.yml`:

- Live static site: `https://Musahid33.github.io/hazard-mapping/`
- To make it sync to your Supabase server:
  - Open site → Unlock builder → Settings → Shared Data Server URL → paste `https://your-service.onrender.com` → Save → Sync Now

---

## 🔁 How Sync Works (Supabase)

- **Backend detection**: server checks `SUPABASE_URL + SUPABASE_KEY` env. If present → Supabase, else file.
- **API**: Frontend talks to `/api/data` (GET/PUT/DELETE) — same endpoint works for both backends.
- **Auto-save**: every edit saved to Supabase ~700ms after typing + localStorage backup.
- **Auto-refresh**: every device polls server every 6s; if another device changed, it updates automatically.
- **Reset**: password-protected Reset clears Supabase row too — resets for everyone.
- **Health**: `/api/health` shows backend type, Supabase URL, updatedAt, liveUrl.

---

## 🔐 Security

- Builder unlock: username `musahid12`, password `Aaru#123` (SHA-256 hashed in frontend)
- Optional server write protection: set `SYNC_TOKEN` env var, then enter same token in Settings → Access Token
- Supabase: server uses `SERVICE_ROLE_KEY` which bypasses RLS. For stricter control, remove public write policy and only allow service_role.

---

## 📄 License

All source files belong to **Emvess Infraventures Pvt Ltd**.

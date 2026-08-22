# Hazard Map Dashboard – Emvess Infraventures Pvt Ltd (Live + Supabase)

A **Hazard Map Dashboard** web app — HTML/CSS/JavaScript with a Node server that now uses **Supabase** for persistent, global, cross-device data.

## 🌐 Live URLs (Updated)

| Service | URL | Purpose |
|---|---|---|
| **🚀 Live App (Render)** | `https://hazard-mapping.onrender.com` | Main live site + API (Supabase-backed) |
| **📄 GitHub Pages** | `https://Musahid33.github.io/hazard-mapping/` | Static frontend with direct Supabase sync |
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
├── live-config.json      # Live URLs + Supabase public anon key for Pages sync
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
3. Get `SUPABASE_URL` + current `SUPABASE_SECRET_KEY` from Project Settings → API Keys (legacy service-role keys also work)
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
   SUPABASE_SECRET_KEY=sb_secret_your_secret_key
   LIVE_URL=https://your-service.onrender.com
   ```
5. Deploy → you get live URL like `https://hazard-map-dashboard.onrender.com`
6. Open live URL on any device — everyone shares same Supabase data

### 3) GitHub Pages (Static Frontend)

Already auto-deploys on push to `main` via `deploy.yml`:

- Live static site: `https://Musahid33.github.io/hazard-mapping/`
- In `live-config.json`, set `supabase.url` to your project URL and `supabase.anonKey` to the **anon public** key.
- Run `supabase/schema.sql` first so the public key is restricted by the intended RLS policies.
- Reload the Pages site. It discovers Supabase automatically and syncs directly; no Render URL or Settings entry is needed.

Never put `SUPABASE_SECRET_KEY` or a legacy service-role key in `live-config.json` — server keys belong only in the server environment.

---

## 🔁 How Sync Works (Supabase)

- **Backend detection**: server recognizes Vercel Marketplace's `SUPABASE_URL + SUPABASE_SECRET_KEY` variables plus legacy/public aliases. If a URL and key are present → Supabase, else file.
- **Direct Pages sync**: when `live-config.json` contains `supabase.url` + `supabase.anonKey`, the browser reads and writes `hazard_data` through Supabase REST (GET/POST) without a Render URL.
- **Server fallback**: the Docker/Render deployment exposes `/api/data` (GET/PUT/DELETE), backed by Supabase when its environment variables are present.
- **Auto-save**: every edit is saved to the configured backend ~700ms after typing + localStorage backup.
- **Auto-refresh**: every device polls the configured backend every 6s; if another device changed, it updates automatically.
- **Reset**: password-protected Reset clears Supabase row too — resets for everyone.
- **Health**: `/api/health` shows backend type, Supabase URL, updatedAt, liveUrl.

---

## 🔐 Security

- Builder unlock: username `musahid12`, password `Aaru#123` (SHA-256 hashed in frontend)
- Optional server write protection: set `SYNC_TOKEN` in the server environment. The static Pages client uses the Supabase anon key and must be protected with Supabase RLS.
- Supabase: keep `SUPABASE_SECRET_KEY` (or a legacy service-role key) only on the server; never commit it to `live-config.json`. For stricter control, do not enable public write policies and use the server deployment instead.

---

## 📄 License

All source files belong to **Emvess Infraventures Pvt Ltd**.

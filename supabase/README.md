# Supabase Setup for Hazard Map Dashboard — Live Global Sync

This folder contains everything needed to make your hazard map data **live and global** using Supabase.

## 1) Create Supabase Project (Free)

1. Go to https://supabase.com → New Project
2. Name: `hazard-mapping`
3. Set a strong DB password (save it)
4. Region: choose closest to you (e.g. Mumbai / Singapore)
5. Wait ~2 min for project to provision

## 2) Run Schema

1. In Supabase Dashboard → **SQL Editor** → **New Query**
2. Paste contents of `supabase/schema.sql`
3. Click **Run**

Verify:
```sql
select * from public.hazard_data where id=1;
```
Should return one row with `data = null`.

## 3) Get API Keys

Go to **Project Settings → API**

Copy:
- `Project URL` → `https://YOUR_PROJECT.supabase.co`
- `anon public` key
- `service_role` key (secret — use on server only)

## 4) Set Env Vars on Your Host

### Render.com (recommended)
In Render Dashboard → Your Service → Environment:
```
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
SUPABASE_TABLE=hazard_data
LIVE_URL=https://your-service.onrender.com
GITHUB_REPO_URL=https://github.com/Musahid33/hazard-mapping
```

### Local dev (.env file)
Create `.env` in project root (see `.env.example`):
```
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_TABLE=hazard_data
PORT=8080
```

### Docker
```bash
docker build -t hazard-map .
docker run -p 8080:8080 \
  -e SUPABASE_URL=https://YOUR_PROJECT.supabase.co \
  -e SUPABASE_SERVICE_ROLE_KEY=xxx \
  -e LIVE_URL=https://your-live-url \
  hazard-map
```

## 5) How It Works

- Server (`server.js`) auto-detects `SUPABASE_URL + SUPABASE_KEY`
- If present → uses Supabase as primary storage (persistent, global)
- If missing → falls back to file `data/hazard-data.json` (local dev)
- Frontend (`index.html`) still talks to `/api/data` — no change needed
- Every device that opens the live URL sees the SAME data

## 6) Live URLs

After deploy, you will have:

- **Live App (Render/Railway)**: `https://your-service.onrender.com` → global shared data
- **GitHub Pages (static)**: `https://Musahid33.github.io/hazard-mapping/` → can point to your server via Settings → Shared Data Server URL
- **GitHub Repo**: `https://github.com/Musahid33/hazard-mapping`
- **Supabase Dashboard**: `https://supabase.com/dashboard/project/YOUR_PROJECT`

## 7) Troubleshooting

| Issue | Fix |
|---|---|
| Data resets after deploy | You were using file backend. Set Supabase env vars to persist |
| 401 Unauthorized | Check SYNC_TOKEN matches Settings → Access Token |
| Supabase read fails | Verify table exists, RLS policies allow read, URL/key correct |
| No sync across devices | Ensure all devices open same LIVE_URL |

## 8) Security

- Server uses `SERVICE_ROLE_KEY` which bypasses RLS (full access)
- If you want to protect writes, set `SYNC_TOKEN` on server and enter same token in app Settings → Access Token
- For stricter control, remove public write policy and only allow service_role

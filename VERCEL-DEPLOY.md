# Vercel Deployment — Hazard Map Dashboard

| | |
|---|---|
| Vercel team | `safexos` |
| Vercel project | `hazardmap` — `prj_6f4pS2WjviNQRPfDmX12mkSLB20Q` |
| Dashboard | https://vercel.com/safexos/hazardmap |
| Repo | https://github.com/Musahid33/hazard-mapping |

> An earlier project ID, `prj_m6uVHU2P5kf5Ynz4e6nILfTpM5I0`, was also used for
> this app. Make sure env vars and the production domain are attached to the
> project you actually deploy — `hazardmap` above.

---

## 1. How the app maps onto Vercel

| Part | Where it runs on Vercel |
|------|-------------------------|
| `index.html`, `xlsx.full.min.js`, `pptxgen.bundle.js` | Static CDN (served straight from repo root) |
| `/api/data`, `/api/health`, `/api/config` | Serverless function `api/index.js` |
| Storage | **Supabase** (REST) — required in production |

`api/index.js` re-exports the same request handler used by `node server.js`,
so local dev, Docker, Render and Vercel all run identical code. `server.js`
only calls `server.listen()` when it is executed directly
(`require.main === module`), which is what makes it importable by Vercel.

Routing lives in `vercel.json`:

- `/api/*` → the serverless function
- everything else → static file, falling back to `index.html`

---

## 2. Required environment variables

Set these in **Vercel → Project → Settings → Environment Variables**
(Production + Preview):

| Name | Value | Required |
|------|-------|----------|
| `SUPABASE_URL` | `https://<project-id>.supabase.co` | ✅ |
| `SUPABASE_SECRET_KEY` | `sb_secret_...` (server key, bypasses RLS) | ✅ |
| `SUPABASE_TABLE` | `hazard_data` (already set in `vercel.json`) | – |
| `LIVE_URL` | your production URL, e.g. `https://hazard-mapping.vercel.app` | optional |
| `SYNC_TOKEN` | shared secret if you want the API locked down | optional |

If you installed Supabase from the **Vercel Marketplace**, `SUPABASE_URL` and
`SUPABASE_SECRET_KEY` are injected automatically — nothing else to do.

> ⚠️ Without Supabase the app falls back to a JSON file in `/tmp`. On Vercel
> that is per-instance and wiped between invocations, so **data will not be
> shared or persisted**. Always configure Supabase for the live site.

Create the table once, in the Supabase SQL editor (see `supabase/schema.sql`):

```sql
create table if not exists hazard_data (
  id         int primary key,
  data       jsonb,
  updated_at bigint
);
```

---

## 3. Deploy

### Option A — GitHub integration (recommended, already enabled)

1. Push to this branch → Vercel builds a **Preview** deployment and comments
   the URL on the PR.
2. Merge into `main` → Vercel promotes it to **Production**.

### Option B — GitHub Actions (template: `ci/vercel-deploy.yml`)

Copy the template into place first (it can't be committed automatically):

```bash
mkdir -p .github/workflows
cp ci/vercel-deploy.yml .github/workflows/vercel-deploy.yml
```

Then add three repo secrets and every push deploys (preview for branches,
production for `main`) and the workflow health-checks the result:

| Secret | Value |
|--------|-------|
| `VERCEL_TOKEN` | https://vercel.com/account/tokens |
| `VERCEL_ORG_ID` | `safexos` team ID (Team Settings → General) |
| `VERCEL_PROJECT_ID` | `prj_6f4pS2WjviNQRPfDmX12mkSLB20Q` |

### Option C — Vercel CLI

```bash
npm i -g vercel
vercel login
vercel link --scope safexos --project hazardmap
vercel env pull .env            # optional: mirror env vars locally
vercel                          # preview deploy
vercel --prod                   # production deploy
```

---

## 4. What "the global URL" means

Your global address is the **Production Domain** listed in
Vercel → Project `hazardmap` → Settings → Domains. Usually
`https://<project>-<team>.vercel.app` when the bare `<project>.vercel.app`
name is already taken by someone else — as it is here:
`hazardmap.vercel.app` currently serves an unrelated app, so do **not**
hand that link out.

That production URL is:

- served from Vercel's worldwide edge CDN — fast from any country
- HTTPS by default, no VPN or login needed
- stable: it always points at the latest production deployment

Preview URLs (`...-git-<branch>-<team>.vercel.app`) change per commit — use
the production domain for anyone outside the team.

### Do edits made in the app show up for everyone?

Only with Supabase configured (section 2). Then:

`Builder edits data → PUT /api/data → Supabase (one shared database) → every
other device polls GET /api/data and sees the same data, anywhere in the
world.`

Without Supabase the API falls back to a per-instance `/tmp` file, so each
visitor effectively sees only their own browser's copy. `/api/health` must
report `"backend": "supabase"`.

Separately, pushing code to `main` triggers an automatic redeploy, so app
updates also reach all users globally within a minute or two.

---

## 5. Verify after deploy

One command checks everything (site, API, backend, and a cross-device
write/read round-trip):

```bash
npm run check:live https://<your-production-domain>
```

Or manually:

```bash
curl -s https://<your-production-domain>/api/health | jq
```

Expected:

```json
{
  "ok": true,
  "backend": "supabase",
  "supabase": { "connected": true, "table": "hazard_data" },
  "version": "2.0-supabase"
}
```

If `"backend": "file"` appears, the Supabase env vars are missing or the
deployment predates them — re-deploy after adding them.

Then open the site and check:

- the dashboard loads (static assets 200, not 404)
- saving data → refresh in another browser shows the same data
- `GET /api/data` returns your record

---

## 6. Troubleshooting

| Symptom | Fix |
|---------|-----|
| 404 on `/api/data` | `api/index.js` missing from the deployment — check `.vercelignore` |
| `FUNCTION_INVOCATION_FAILED` | Look at Vercel → Deployment → Functions logs; usually a bad `SUPABASE_URL`/key |
| Data resets on refresh | `backend` is `file` → set Supabase env vars |
| 401 from the API | `SYNC_TOKEN` is set; client must send `Authorization: Bearer <token>` |
| Supabase 401/403 | Use the **secret/service** key, not the anon key, or relax RLS on `hazard_data` |
| Wrong app at your domain | The domain is aliased to a different project — reassign it in Project → Settings → Domains |
| Deploy times out | Function `maxDuration` is 30 s in `vercel.json`; raise the plan limit if needed |

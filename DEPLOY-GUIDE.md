# 🚀 Deploy Guide — Go Live (Real, Global, Cross-Device Data)

There are two ways to put this online. Choose based on what you need:

| | **Option A — Shared-data server** ✅ | Option B — GitHub Pages |
|---|---|---|
| Data shared across **every device/computer** | ✅ Yes (real server) | ❌ No (static, per-browser) |
| Data survives until **Reset** | ✅ Yes (saved in `data/hazard-data.json`) | ✅ Yes (per browser) |
| Edits from one device appear on others | ✅ Yes (auto-sync) | ❌ No |
| Cost | Free tier hosts available | Free |

> 🎯 **You asked for "real & update global" → use Option A.** One server URL,
> open it from any phone / laptop / desktop, and everyone sees and edits the
> same live document.

---

## ✅ Option A — Deploy the shared-data server (real & global)

The repo includes `server.js` (zero dependencies), a `Dockerfile`, a
`render.yaml` blueprint and a `Procfile`, so it deploys anywhere in minutes.

### A1. Easiest — Render (free)

1. Push this repo to **your GitHub account** (any repo name).
2. Go to [render.com](https://render.com) → **New +** → **Blueprint**.
3. Connect the repo. Render auto-detects `render.yaml` and creates the service.
4. Wait ~2 minutes. You get a live URL like
   `https://hazard-map-dashboard.onrender.com`.
5. Open that URL on **any device** — everyone now shares the same data.

> Free Render services sleep after inactivity; the first open after sleep can
> take ~30–60s to wake. Upgrade to a paid plan (or use Railway/Fly/Koyeb) to
> keep it always-on.

### A2. Railway / Fly.io / Koyeb / any Node host

- **Start command:** `node server.js` (or `npm start`)
- **Port:** `8080` (or set `PORT`)
- **Health check:** `GET /api/health`
- Optional: set `SYNC_TOKEN` and enter the same token in the app's
  **⚙️ Settings → Access Token** so only authorized devices can edit.

### A3. Run it on your own server / PC (LAN or intranet)

```bash
node server.js
# → http://localhost:8080
```

Devices on the same network open `http://<this-pc-ip>:8080` and share data.
To expose it to the whole internet you can use a tunnel (e.g. Cloudflare
Tunnel, ngrok) or host on any of the platforms above.

### A4. Hosting the app and the server separately

If you host `index.html` somewhere (e.g. GitHub Pages) and the data server
somewhere else, open the app → **⚙️ Settings → Shared Data Server URL** and
paste the server URL (e.g. `https://your-service.onrender.com`). The server
already sends CORS headers, so cross-origin sync works out of the box.

---

## 🔄 How the global sync works (what you can expect)

- **Auto-save:** every entry/edit is written to the server ~1s after you stop
  typing (plus an instant local copy). Data **never vanishes** on its own.
- **Auto-refresh:** every device checks the server every 6 seconds; if another
  device changed something, this device updates automatically. It never
  overwrites while you are actively typing.
- **Reset:** the password-protected **↺ Reset** clears the data on the shared
  server too — so it resets for **everyone**.
- **First run:** if the server has no data yet, the first device to open the
  app seeds it with the built-in sample areas.

---

## Option B — GitHub Pages (static only, no cross-device sync)

If you only need a hosted page (no shared data), the existing workflow still
works. **This does NOT sync across devices** — data stays in each browser.

```bash
cd hazard-mapping
git init
git add .
git commit -m "Initial release"
git branch -M main
git remote add origin https://github.com/<your-username>/tata-hazard-map.git
git push -u origin main
```

Then **Settings → Pages → Branch: `main` → folder `/ (root)` → Save**.

> ⚠️ If you want cross-device sync on Pages, combine it with Option A4 above
> (point the app's "Shared Data Server URL" at your server).

---

## 🔐 Optional write protection (SYNC_TOKEN)

1. Start the server with: `SYNC_TOKEN=my-secret node server.js`
   (PowerShell: `$env:SYNC_TOKEN="my-secret"; node server.js`)
2. In the app → **⚙️ Settings → Access Token** → enter `my-secret` → **Save Sync Settings**.

Without a token anyone who can reach the URL can edit. With a token, only
devices that know it can edit (viewing still works for everyone).

---

## ❓ Troubleshooting

| Problem | Fix |
|---|---|
| "No shared server found" in Settings | You're using the static page without the server. Run `node server.js` or deploy Option A, then paste its URL in Settings → Sync Now. |
| Devices don't see each other's edits | They must all open the **same server URL**. Check Settings → Sync Now shows "✓ Connected". |
| Free host sleeps | First open after idle may be slow to wake (Render). Use a paid plan for always-on. |
| Page loads but Excel/PPT don't work | `xlsx.full.min.js` / `pptxgen.bundle.js` missing — keep them next to `index.html`. |
| Old version still showing | Hard refresh: `Ctrl+Shift+R` (Win) / `Cmd+Shift+R` (Mac). |

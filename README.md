# Hazard Map Dashboard – Emvess Infraventures Pvt Ltd

A **Hazard Map Dashboard** web app — HTML/CSS/JavaScript with an optional
zero-dependency Node server for **shared, cross-device data**.

---

## ✨ Features

- 🗺️ Hazard map table builder with live preview
- 📄 **Document header** shows **Document No.** (`EIPL/SMP/HM/01`) and a
  **Rev. No.** that you can change on every edit (select 00–20)
- ☁️ **Shared data** — every entry/edit is saved on a shared server, so any
  device / computer that opens the site sees the **same data** (not local).
  Data **never vanishes** unless someone presses **Reset**.
- 🔄 Auto-refresh from the server every few seconds + a **Sync Now** button
- 🖨️ Print / Save as PDF
- 📊 Export to Excel (`.xlsx` via [SheetJS](https://sheetjs.com))
- 📽️ Export to PowerPoint (`.pptx` via [PptxGenJS](https://github.com/gitbrent/PptxGenJS))
- 🔍 Filter view by location + column show/hide controls
- ➕ Add / 🗑 delete hazard areas
- 🔒 Password-protected builder, reset & unlock actions
- ⛶ Zoom controls and risk-level legend

---

## 📁 Project structure

```
hazard-mapping/
├── index.html            # The entire app (HTML + CSS + JS, inline)
├── server.js             # Shared-data server (Node, zero dependencies)
├── package.json          # "npm start" → node server.js
├── xlsx.full.min.js      # SheetJS – Excel export library
├── pptxgen.bundle.js     # PptxGenJS – PowerPoint export library
├── data/                 # created at runtime — holds the shared data JSON
├── README.md
└── DEPLOY-GUIDE.md
```

---

## 🚀 Run with shared data (recommended)

This makes the **same data appear on every device/computer** — changes from one
device are saved on the server and picked up everywhere else.

You need [Node.js](https://nodejs.org) (v14 or newer):

```bash
node server.js
# open http://localhost:8080
```

Any device on the same network (or, once deployed, any device in the world)
opens the same URL and sees the same data. The data is stored in
`data/hazard-data.json` on the server and is only cleared when someone presses
**Reset** (which clears it everywhere).

To protect writes, optionally start the server with a token and paste the same
token in the app's **⚙️ Settings → Access Token**:

```bash
SYNC_TOKEN=my-secret node server.js
# Windows (PowerShell): $env:SYNC_TOKEN="my-secret"; node server.js
```

---

## ☁️ Deploy the shared-data server

Host `server.js` on any Node host (Render, Railway, Fly.io, a VPS, etc.):

1. Push this folder to a repository.
2. Create a **Web Service** with:
   - Build command: *(none)*
   - Start command: `npm start` (or `node server.js`)
   - Env var `PORT` (most hosts set this automatically)
   - Optional env var `SYNC_TOKEN` to protect writes
3. Open the service URL — every device hitting that URL shares the same data.

> The app auto-detects the server it is hosted on. If you host `index.html`
> somewhere else (e.g. GitHub Pages) and the data server separately, open the
> app's **⚙️ Settings → Shared Data Server URL** and enter your server URL
> (e.g. `https://your-service.onrender.com`). The server sends CORS headers, so
> cross-origin syncing works out of the box.

---

## 🧪 Static-only usage (no server)

If you just open `index.html` directly (or host it on GitHub Pages) **without**
the server, the app still works — data is kept safely in that browser
(`localStorage`) and does **not** vanish until you press **Reset**. It just
won't sync across devices. Running `server.js` adds the cross-device sync.

---

## 🔁 How shared sync behaves

- **Auto-save:** every change is written to the server ~1 second after you stop
  typing (plus an instant local copy).
- **Auto-refresh:** the app checks the server every 6 seconds; if another
  device changed something, this device updates automatically. It never
  overwrites while you are actively typing.
- **Reset:** the **↺ Reset** action (password-protected) clears the data on the
  shared server too — so it resets for everyone.
- **First run:** if the server has no data yet, the first device to open the
  app seeds it with the built-in sample areas.

---

## 📄 License / Ownership

All source files in this repository belong to **Emvess Infraventures Pvt Ltd**.

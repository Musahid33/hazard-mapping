# 🚀 Deploy Guide — Put This Site on GitHub Pages (Free, Your Ownership)

GitHub Pages gives you **free hosting** for static sites, fully under **your** GitHub
account. Once deployed your site lives at:

```
https://<your-username>.github.io/tata-hazard-map/
```

You only do the setup **once** — after that, updating the site is one drag-and-drop
or one `git push`.

---

## ✅ Before you start

You need these **3 files/folder** (already prepared):

```
index.html
libs/  (contains xlsx.full.min.js and pptxgen.bundle.js)
```

> ⚠️ Keep `index.html` and the `libs/` folder **as-is** — `index.html` loads the
> two libraries with relative paths (`libs/...`), so the folder structure must stay the same.

---

## 🅰️ Option A — Upload through the browser (easiest, no tools needed)

### Step 1 — Create the repository
1. Log in to [github.com](https://github.com) (create a free account if needed).
2. Click the **+** (top-right) → **New repository**.
3. Repository name: `tata-hazard-map`
4. Choose **Public** (required for free GitHub Pages on old free accounts;
   Private also works on the current free tier).
5. **Do NOT** tick "Add a README" — you already have one.
6. Click **Create repository**.

### Step 2 — Upload the files
1. On the new empty repo page, click the link **"uploading an existing file"**.
2. Open the `tata-hazard-map` folder on your computer and **drag all of its
   contents** (`index.html`, `libs/`, `README.md`, `DEPLOY-GUIDE.md`, `.gitignore`)
   into the browser window.
   - Make sure `libs/` uploads **as a folder** with both `.js` files inside it.
3. Click **Commit changes**.

### Step 3 — Turn on GitHub Pages
1. In your repository, go to **Settings** → **Pages** (left sidebar).
2. Under **Build and deployment**:
   - **Source:** `Deploy from a branch`
   - **Branch:** `main`  |  **Folder:** `/ (root)`
   - Click **Save**.
3. Wait **1–3 minutes**, then refresh the Pages screen — it will show:
   `Your site is live at https://<your-username>.github.io/tata-hazard-map/`

🎉 Done — the site is now yours, hosted under your own GitHub account.

---

## 🅱️ Option B — Using Git from the command line

```bash
cd tata-hazard-map

git init
git add .
git commit -m "Hazard Map Dashboard – initial release"
git branch -M main
git remote add origin https://github.com/<your-username>/tata-hazard-map.git
git push -u origin main
```

Then do **Step 3** above (Settings → Pages → Branch: `main` → folder `/ (root)` → Save).

---

## 🔄 How to update the site later

**Browser:** open the repo → click the ✏️ (pencil) on `index.html` → edit → **Commit changes**.
The site redeploys automatically in 1–2 minutes.

**Git:**
```bash
git add .
git commit -m "Describe your change"
git push
```

---

## 🌐 Optional: your own domain (e.g. `hazardmap.yourcompany.com`)

1. **Settings → Pages → Custom domain** → type your domain → Save.
2. At your domain registrar, add a `CNAME` record pointing to
   `<your-username>.github.io`.
3. Tick **Enforce HTTPS** once the domain check passes.

GitHub still hosts it free — the domain is just a name on top.

---

## ❓ Troubleshooting

| Problem | Fix |
|---|---|
| Site shows 404 | Wait 1–3 min after enabling Pages; check branch = `main`, folder = `/ (root)` |
| Page loads but buttons "Excel/PPT" don't work | `libs/` folder or its `.js` files were not uploaded — re-upload them |
| Old version still showing | Hard-refresh the browser: `Ctrl + Shift + R` (Windows) / `Cmd + Shift + R` (Mac) |

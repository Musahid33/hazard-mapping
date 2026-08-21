# Hazard Map Dashboard – Emvess Infraventures Pvt Ltd

A self-contained, static **Hazard Map Dashboard** web app. No build step, no server, no database — just plain HTML/CSS/JavaScript that runs entirely in the browser.

**Live site (GitHub Pages):** `https://<your-username>.github.io/tata-hazard-map/` *(update this line after deploying)*

---

## ✨ Features

- 🗺️ Hazard map table builder with live preview
- 🖨️ Print / Save as PDF
- 📊 Export to Excel (`.xlsx` via [SheetJS](https://sheetjs.com))
- 📽️ Export to PowerPoint (`.pptx` via [PptxGenJS](https://github.com/gitbrent/PptxGenJS))
- 🔍 Filter view by location + column show/hide controls
- ➕ Add / 🗑 delete hazard areas
- 🔒 Password-protected sample data, reset & unlock actions
- ⛶ Zoom controls and risk-level legend

## 📁 Project structure

```
tata-hazard-map/
├── index.html                  # The entire app (HTML + CSS + JS, inline)
├── libs/
│   ├── xlsx.full.min.js        # SheetJS – Excel export library
│   └── pptxgen.bundle.js       # PptxGenJS – PowerPoint export library
├── .github/workflows/
│   └── deploy.yml              # Auto-deploy to GitHub Pages on every push
├── README.md
└── DEPLOY-GUIDE.md             # How to publish on GitHub Pages
```

## 🚀 Run locally

No install needed. Either:

- Double-click `index.html`, **or**
- Serve it (recommended, mirrors real hosting):
  ```bash
  python3 -m http.server 8080
  # open http://localhost:8080
  ```

## ☁️ Deploy

This is a 100% static site, so it works on any static host. See **[DEPLOY-GUIDE.md](DEPLOY-GUIDE.md)** for step-by-step GitHub Pages instructions (free hosting, your ownership).

## 📄 License / Ownership

All source files in this repository belong to **Emvess Infraventures Pvt Ltd**. Hosting on GitHub Pages keeps full ownership and control with the repository owner.

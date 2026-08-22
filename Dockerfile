# Hazard Map Dashboard — container image for the shared-data server with Supabase
# Build + deploy this anywhere (Render, Railway, Fly.io, Koyeb, any VPS, etc.)
# and every device that opens the app URL shares the SAME data via Supabase.

FROM node:20-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package.json ./
RUN npm install --production --no-audit --no-fund || npm install --production

# Copy rest of the app
COPY . .

ENV NODE_ENV=production
ENV PORT=8080
ENV GITHUB_REPO_URL=https://github.com/Musahid33/hazard-mapping

# Supabase env vars are expected to be set at runtime:
# - SUPABASE_URL
# - SUPABASE_SECRET_KEY (preferred) or a supported legacy/public key
# - SUPABASE_TABLE (default: hazard_data)
# Optional:
# - SYNC_TOKEN
# - LIVE_URL

EXPOSE 8080

# Health check for orchestrators
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:${PORT:-8080}/api/health || exit 1

CMD ["node", "server.js"]

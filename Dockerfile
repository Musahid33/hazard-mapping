# Hazard Map Dashboard — container image for the shared-data server
# Build + deploy this anywhere (Render, Railway, Fly.io, Koyeb, any VPS, etc.)
# and every device that opens the app URL shares the SAME data.

FROM node:20-alpine

WORKDIR /app

COPY . .

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# Optional write-protection: set SYNC_TOKEN (matching the app's ⚙️ Settings →
# Access Token) so only authorized devices can update the shared data.
# ENV SYNC_TOKEN=change-me

CMD ["node", "server.js"]

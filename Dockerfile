# ---------- Stage 1: install production dependencies ----------
FROM node:20-alpine AS deps
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --omit=dev

# ---------- Stage 2: final small runtime image ----------
FROM node:20-alpine
WORKDIR /usr/src/app
ENV NODE_ENV=production PORT=3000

COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY package*.json ./
COPY app.js server.js ./
COPY public ./public

# Run as non-root user (security best practice)
USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "server.js"]

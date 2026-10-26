# syntax=docker/dockerfile:1

# --- deps: dependencias completas (dev + prod), reaproveitadas por test e build ---
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# --- test: roda typecheck, lint e a suite com cobertura (docker compose run --rm test) ---
FROM deps AS test
ENV NODE_ENV=test
COPY . .
CMD ["sh", "-c", "npm run typecheck && npm run lint && npm run test:coverage"]

# --- build: compila TypeScript para dist/ ---
FROM deps AS build
COPY . .
RUN npm run build

# --- runtime: imagem enxuta, apenas dependencias de producao, usuario nao-root ---
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
USER node
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=3s --retries=5 \
  CMD node -e "require('http').get('http://localhost:'+(process.env.PORT||3000)+'/health', r => process.exit(r.statusCode===200?0:1)).on('error', () => process.exit(1))"
CMD ["node", "dist/server.js"]

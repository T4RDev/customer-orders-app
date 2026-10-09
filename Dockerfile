# Multi-stage build for TypeScript NodeJS + Angular Customer Orders Application
FROM node:24-alpine AS builder

WORKDIR /app

# Build Angular Frontend
COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm ci

COPY frontend/ ./
RUN npm run build

# Build Backend (TypeScript)
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci

COPY backend/ ./
RUN npx tsc
RUN cp src/db/schema.sql dist/db/schema.sql 2>/dev/null || true

COPY docs/ /app/docs/

# Final Production Stage
FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/backend/package*.json ./backend/
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/src/db/schema.sql ./backend/src/db/schema.sql
COPY --from=builder /app/backend/node_modules ./backend/node_modules
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY --from=builder /app/docs ./docs

EXPOSE 3000

CMD ["node", "backend/dist/server.js"]

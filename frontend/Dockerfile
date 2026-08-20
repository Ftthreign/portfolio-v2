# Build Stage
FROM oven/bun:alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package.json bun.lockb* bun.lock* ./

# Install dependencies
RUN bun install --frozen-lockfile || bun install

# Copy source code
COPY . .

# Build Astro SSR app
RUN bun run build

# Production Stage
FROM oven/bun:alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 4321

CMD ["bun", "./dist/server/entry.mjs"]

FROM oven/bun:1.3-alpine

WORKDIR /app

# Install deps
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Copy source
COPY . .

# Run migrations then start
CMD ["sh", "-c", "bunx drizzle-kit push && bun run src/index.ts"]

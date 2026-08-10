# Multi-stage build for the Quantint Next.js app.
#   builder  — installs deps, generates the Prisma client, builds standalone.
#              Also used by the one-shot `migrate` compose service (has the
#              prisma CLI + migration files).
#   runner   — minimal production image from the standalone output.

FROM node:24-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
# postinstall runs `prisma generate`, which needs the schema (copied above).
RUN npm ci

COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Build-time placeholder: every page is dynamic (force-dynamic), so the build
# never queries the database — but module init still wants a URL shape.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"
RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0

CMD ["node", "server.js"]

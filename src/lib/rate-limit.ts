import 'server-only';

import { createHmac } from 'node:crypto';
import { prisma } from './db';

type LimitOptions = {
  namespace: string;
  identifier: string;
  limit: number;
  windowMs: number;
};

export type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

let lastCleanupAt = 0;

async function cleanupExpiredBuckets(now: Date) {
  if (now.getTime() - lastCleanupAt < 60 * 60_000) return;
  lastCleanupAt = now.getTime();
  await prisma.rateLimitBucket.deleteMany({ where: { resetAt: { lte: now } } });
}

/** Prefer proxy-provided client IPs; local requests share a stable fallback. */
export function getClientAddress(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const address = forwarded || headers.get('x-real-ip')?.trim() || 'local';
  return address.slice(0, 128);
}

function bucketKey(namespace: string, identifier: string): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('AUTH_SECRET is required for rate-limit keys.');
  return createHmac('sha256', secret)
    .update(`${namespace}\0${identifier}`)
    .digest('hex');
}

/**
 * Atomic fixed-window limiter shared by every app process. An upsert resets an
 * expired window or increments the current one in a single PostgreSQL query.
 */
export async function consumeRateLimit({
  namespace,
  identifier,
  limit,
  windowMs,
}: LimitOptions): Promise<RateLimitResult> {
  const key = bucketKey(namespace, identifier);
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMs);
  await cleanupExpiredBuckets(now);
  const rows = await prisma.$queryRaw<Array<{ count: number; resetAt: Date }>>`
    INSERT INTO "RateLimitBucket" ("key", "count", "resetAt")
    VALUES (${key}, 1, ${resetAt})
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE
        WHEN "RateLimitBucket"."resetAt" <= NOW() THEN 1
        ELSE "RateLimitBucket"."count" + 1
      END,
      "resetAt" = CASE
        WHEN "RateLimitBucket"."resetAt" <= NOW() THEN EXCLUDED."resetAt"
        ELSE "RateLimitBucket"."resetAt"
      END
    RETURNING "count", "resetAt"
  `;

  const bucket = rows[0];
  return {
    allowed: bucket.count <= limit,
    retryAfterSeconds: Math.max(
      0,
      Math.ceil((bucket.resetAt.getTime() - Date.now()) / 1000),
    ),
  };
}

export async function checkLoginRateLimit(
  email: string,
  headers: Headers,
): Promise<boolean> {
  const ip = getClientAddress(headers);
  const network = await consumeRateLimit({
    namespace: 'login-ip',
    identifier: ip,
    limit: 30,
    windowMs: 15 * 60_000,
  });
  if (!network.allowed) return false;

  const account = await consumeRateLimit({
    namespace: 'login-account',
    identifier: email,
    limit: 10,
    windowMs: 15 * 60_000,
  });
  return account.allowed;
}

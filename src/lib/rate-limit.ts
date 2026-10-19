/**
 * In-memory fixed-window rate limiter.
 *
 * Good enough to stop form and chat abuse from a single origin on a single
 * instance. It does NOT survive cold starts or coordinate across serverless
 * instances — move to Upstash Redis or Vercel KV before the site sees real
 * traffic volume. Flagged in DEPLOYMENT.md.
 */

const buckets = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.reset) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    if (buckets.size > 10_000) sweep(now);
    return true;
  }

  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

function sweep(now: number) {
  for (const [k, v] of buckets) if (now > v.reset) buckets.delete(k);
}

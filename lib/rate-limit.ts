import { kv } from '@vercel/kv'

export interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

const DEFAULTS: RateLimitConfig = {
  windowMs: 60 * 1000,
  maxRequests: 5,
}

export async function checkRateLimit(
  key: string,
  config?: Partial<RateLimitConfig>,
): Promise<{
  success: boolean
  remaining: number
  resetIn: number
}> {
  const { windowMs, maxRequests } = { ...DEFAULTS, ...config }
  const now = Date.now()
  const windowKey = `ratelimit:${key}:${Math.floor(now / windowMs)}`

  const count = await kv.incr(windowKey)
  if (count === 1) {
    // First request in this window — set TTL
    await kv.expire(windowKey, Math.ceil(windowMs / 1000))
  }

  const ttl = await kv.ttl(windowKey)
  return {
    success: count <= maxRequests,
    remaining: Math.max(0, maxRequests - count),
    resetIn: ttl > 0 ? ttl * 1000 : 0,
  }
}

export function getRateLimitKey(identifier: string, action: string): string {
  return `${action}:${identifier}`
}

export async function rateLimitMiddleware(
  identifier: string,
  action: string,
  config?: Partial<RateLimitConfig>,
): Promise<{ success: boolean; remaining: number; resetIn: number }> {
  const key = getRateLimitKey(identifier, action)
  return checkRateLimit(key, config)
}

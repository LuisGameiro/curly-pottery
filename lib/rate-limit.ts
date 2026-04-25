const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

const WINDOW_MS = 60 * 1000
const MAX_REQUESTS = 5

export function checkRateLimit(key: string): { success: boolean; remaining: number; resetIn: number } {
  const now = Date.now()
  const record = rateLimitStore.get(key)

  if (!record || now > record.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return { success: true, remaining: MAX_REQUESTS - 1, resetIn: WINDOW_MS }
  }

  if (record.count >= MAX_REQUESTS) {
    return { success: false, remaining: 0, resetIn: record.resetAt - now }
  }

  record.count++
  return { success: true, remaining: MAX_REQUESTS - record.count, resetIn: record.resetAt - now }
}

export function getRateLimitKey(identifier: string, action: string): string {
  return `${action}:${identifier}`
}

export async function rateLimitMiddleware(
  identifier: string,
  action: string,
  onRateLimited?: () => void
): Promise<boolean> {
  const key = getRateLimitKey(identifier, action)
  const result = checkRateLimit(key)

  if (!result.success && onRateLimited) {
    onRateLimited()
  }

  return result.success
}
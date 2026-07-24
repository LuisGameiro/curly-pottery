jest.mock('@vercel/kv', () => ({
  kv: {
    incr: jest.fn(),
    expire: jest.fn(),
    ttl: jest.fn(),
  },
}))

import { kv } from '@vercel/kv'
import {
  checkRateLimit,
  getRateLimitKey,
  rateLimitMiddleware,
} from './rate-limit'

beforeEach(() => {
  jest.clearAllMocks()
})

describe('getRateLimitKey', () => {
  it('should return `${action}:${identifier}`', () => {
    expect(getRateLimitKey('user_123', 'login')).toBe('login:user_123')
  })

  it('should handle empty strings', () => {
    expect(getRateLimitKey('', '')).toBe(':')
  })
})

describe('checkRateLimit', () => {
  it('should set TTL and return success on first request', async () => {
    ;(kv.incr as jest.Mock).mockResolvedValue(1)
    ;(kv.ttl as jest.Mock).mockResolvedValue(60)

    const result = await checkRateLimit('test-key')

    expect(kv.incr).toHaveBeenCalledWith(expect.stringContaining('test-key'))
    expect(kv.expire).toHaveBeenCalledWith(expect.any(String), 60)
    expect(result).toEqual({
      success: true,
      remaining: 4,
      resetIn: 60000,
    })
  })

  it('should return success when count is within limit', async () => {
    ;(kv.incr as jest.Mock).mockResolvedValue(3)
    ;(kv.ttl as jest.Mock).mockResolvedValue(30)

    const result = await checkRateLimit('test-key', { maxRequests: 5 })

    expect(kv.expire).not.toHaveBeenCalled()
    expect(result).toEqual({
      success: true,
      remaining: 2,
      resetIn: 30000,
    })
  })

  it('should return failure when count exceeds limit', async () => {
    ;(kv.incr as jest.Mock).mockResolvedValue(6)
    ;(kv.ttl as jest.Mock).mockResolvedValue(10)

    const result = await checkRateLimit('test-key', { maxRequests: 5 })

    expect(result).toEqual({
      success: false,
      remaining: 0,
      resetIn: 10000,
    })
  })

  it('should use default config when no config is provided', async () => {
    ;(kv.incr as jest.Mock).mockResolvedValue(1)
    ;(kv.ttl as jest.Mock).mockResolvedValue(60)

    const result = await checkRateLimit('test-key')

    expect(result.success).toBe(true)
    // Default maxRequests is 5, so remaining = 5 - 1 = 4
    expect(result.remaining).toBe(4)
    // Default windowMs is 60000, so TTL is 60s => resetIn = 60000
    expect(result.resetIn).toBe(60000)
  })

  it('should set resetIn to 0 when ttl is 0 or negative', async () => {
    ;(kv.incr as jest.Mock).mockResolvedValue(2)
    ;(kv.ttl as jest.Mock).mockResolvedValue(0)

    const result = await checkRateLimit('test-key')

    expect(result.resetIn).toBe(0)
  })
})

describe('rateLimitMiddleware', () => {
  it('should compose getRateLimitKey and checkRateLimit', async () => {
    ;(kv.incr as jest.Mock).mockResolvedValue(1)
    ;(kv.ttl as jest.Mock).mockResolvedValue(60)

    const result = await rateLimitMiddleware('user_123', 'login')

    // Should have called incr with a key containing "login:user_123"
    const incrCall = (kv.incr as jest.Mock).mock.calls[0][0]
    expect(incrCall).toContain('login:user_123')
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(4)
  })

  it('should pass custom config to checkRateLimit', async () => {
    ;(kv.incr as jest.Mock).mockResolvedValue(5)
    ;(kv.ttl as jest.Mock).mockResolvedValue(10)

    const result = await rateLimitMiddleware('api_key', 'fetch', {
      maxRequests: 5,
      windowMs: 30000,
    })

    // count <= maxRequests, so success should be true
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(0)
  })
})

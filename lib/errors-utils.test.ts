jest.mock('prisma/prisma', () => ({
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  prisma: require('jest-mock-extended').mockDeep(),
}))

import { prisma } from 'prisma/prisma'
import {
  withDatabase,
  withFetch,
  handleStockError,
  handleNotFound,
} from './errors-utils'
import { AppError, DatabaseError, NetworkError } from './errors'

describe('withDatabase', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return success when transaction completes', async () => {
    const mockResult = { id: '1', name: 'Test' }
    ;(prisma.$transaction as jest.Mock).mockImplementation(
      async (fn: (tx: typeof prisma) => Promise<typeof mockResult>) => {
        return fn(prisma)
      },
    )

    const fn = jest.fn().mockResolvedValue(mockResult)
    const result = await withDatabase('createProduct', fn)

    expect(result).toEqual({
      success: true,
      message: 'Operation successful',
      data: mockResult,
    })
    expect(prisma.$transaction).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(prisma)
  })

  it('should return AppError when operation throws an AppError', async () => {
    const appError = new AppError('Product not found', 'NOT_FOUND', 404)
    ;(prisma.$transaction as jest.Mock).mockRejectedValue(appError)

    const fn = jest.fn()
    const result = await withDatabase('findProduct', fn)

    expect(result).toEqual({
      success: false,
      message: 'Product not found',
      errors: appError,
    })
  })

  it('should wrap generic errors in DatabaseError', async () => {
    const genericError = new Error('Connection lost')
    ;(prisma.$transaction as jest.Mock).mockRejectedValue(genericError)

    const fn = jest.fn()
    const result = await withDatabase('queryProducts', fn)

    expect(result.success).toBe(false)
    expect(result.message).toBe('Connection lost')
    expect(result.errors).toBeInstanceOf(DatabaseError)
    expect((result.errors as DatabaseError).operation).toBe('queryProducts')
  })
})

describe('withFetch', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return data on successful fetch', async () => {
    const responseData = { id: 1, name: 'test' }
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue(responseData),
    }
    global.fetch = jest.fn().mockResolvedValue(mockResponse)

    const result = await withFetch<typeof responseData>(
      'https://api.example.com/data',
    )

    expect(result).toEqual({
      success: true,
      message: 'Fetch successful',
      data: responseData,
    })
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/data',
      expect.objectContaining({
        signal: expect.any(AbortSignal),
      }),
    )
  })

  it('should return NetworkError on HTTP error response', async () => {
    const mockResponse = {
      ok: false,
      status: 404,
      json: jest.fn().mockResolvedValue({ message: 'Not found' }),
    }
    global.fetch = jest.fn().mockResolvedValue(mockResponse)

    const result = await withFetch('https://api.example.com/data')

    expect(result.success).toBe(false)
    expect(result.message).toBe('Not found')
    expect(result.errors).toBeInstanceOf(NetworkError)
    expect((result.errors as NetworkError).message).toBe('Not found')
  })

  it('should handle abort/timeout', async () => {
    const abortError = new DOMException(
      'The operation was aborted',
      'AbortError',
    )
    global.fetch = jest.fn().mockRejectedValue(abortError)

    const result = await withFetch('https://api.example.com/data', {
      timeout: 100,
    })

    expect(result.success).toBe(false)
    expect(result.message).toBe('Request timed out')
    expect(result.errors).toBeInstanceOf(NetworkError)
  })

  it('should handle general network error', async () => {
    const networkError = new Error('ENOTFOUND')
    global.fetch = jest.fn().mockRejectedValue(networkError)

    const result = await withFetch('https://api.example.com/data')

    expect(result.success).toBe(false)
    expect(result.message).toBe('ENOTFOUND')
    expect(result.errors).toBeInstanceOf(NetworkError)
  })
})

describe('handleStockError', () => {
  it('should return correct error structure', () => {
    const result = handleStockError('Vase', 10, 3)

    expect(result.success).toBe(false)
    expect(result.message).toBe(
      'Insufficient stock for Vase. Requested: 10, Available: 3',
    )
    expect(result.errors).toBeInstanceOf(AppError)
    expect(result.errors.message).toBe(
      'Insufficient stock for Vase. Requested: 10, Available: 3',
    )
    expect(result.errors.code).toBe('INSUFFICIENT_STOCK')
  })
})

describe('handleNotFound', () => {
  it('should return correct error structure', () => {
    const result = handleNotFound('Product')

    expect(result.success).toBe(false)
    expect(result.message).toBe('Product not found')
    expect(result.errors).toBeInstanceOf(AppError)
    expect(result.errors.message).toBe('Product not found')
    expect(result.errors.code).toBe('NOT_FOUND')
  })

  it('should include id when provided', () => {
    const result = handleNotFound('Product', 'abc-123')

    expect(result.message).toBe('Product with ID: abc-123 not found')
    expect(result.errors.message).toBe('Product with ID: abc-123 not found')
  })
})

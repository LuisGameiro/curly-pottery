import { getVercelDataUsage } from './vercelData.actions'
import { list } from '@vercel/blob'
import { kv } from '@vercel/kv'
import { auth } from '@/auth'
import { prisma } from 'prisma/prisma'

jest.mock('@vercel/blob', () => ({ list: jest.fn() }))

jest.mock('@vercel/kv', () => ({
  kv: { dbsize: jest.fn() },
}))

jest.mock('prisma/prisma', () => ({
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  prisma: require('jest-mock-extended').mockDeep(),
}))

jest.mock('@sentry/nextjs', () => ({ captureException: jest.fn() }))

const mockList = list as jest.Mock
const mockDbsize = kv.dbsize as jest.Mock
const mockAuth = auth as jest.Mock
const mockQueryRaw = prisma.$queryRaw as jest.Mock

const ORIGINAL_ENV = process.env

describe('getVercelDataUsage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env = { ...ORIGINAL_ENV }
    delete process.env.NEON_API_KEY
    delete process.env.NEON_PROJECT_ID
    delete process.env.VERCEL_ENV
    delete process.env.NEXT_PUBLIC_VERCEL_ENV
    delete process.env.VERCEL_REGION
    delete process.env.VERCEL_PROJECT_ID
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
    mockAuth.mockResolvedValue({ user: { id: 'admin-1', role: 'ADMIN' } })
  })

  afterAll(() => {
    process.env = ORIGINAL_ENV
  })

  it('should reject non-admin users', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1', role: 'USER' } })
    const result = await getVercelDataUsage()
    expect(result).toEqual({
      success: false,
      message: 'Unauthorized: Administrative privileges required.',
    })
  })

  it('should return blob usage', async () => {
    mockList.mockResolvedValue({
      blobs: [{ size: 1024 }, { size: 2048 }],
      hasMore: false,
    })
    const result = await getVercelDataUsage()
    expect(result).toMatchObject({
      success: true,
      data: { blob: { usedBytes: 3072, blobCount: 2, truncated: false } },
    })
  })

  it('should flag truncated blob results', async () => {
    mockList.mockResolvedValue({ blobs: [{ size: 1 }], hasMore: true })
    const result = await getVercelDataUsage()
    expect(result.success && result.data.blob?.truncated).toBe(true)
  })

  it('should return null blob usage when the blob fetch fails', async () => {
    mockList.mockRejectedValue(new Error('blob down'))
    const spy = jest.spyOn(console, 'error').mockImplementation()
    const result = await getVercelDataUsage()
    expect(result.success && result.data.blob).toBeNull()
    spy.mockRestore()
  })

  it('should return database size and table count', async () => {
    mockQueryRaw
      .mockResolvedValueOnce([{ bytes: 12345678n }])
      .mockResolvedValueOnce([{ count: 12 }])
    const result = await getVercelDataUsage()
    expect(result).toMatchObject({
      success: true,
      data: { database: { usedBytes: 12345678, tableCount: 12 } },
    })
  })

  it('should return null database usage when the query fails', async () => {
    mockQueryRaw.mockRejectedValue(new Error('db down'))
    const spy = jest.spyOn(console, 'error').mockImplementation()
    const result = await getVercelDataUsage()
    expect(result.success && result.data.database).toBeNull()
    spy.mockRestore()
  })

  it('should fetch Neon project info when env is configured', async () => {
    process.env.NEON_API_KEY = 'test-key'
    process.env.NEON_PROJECT_ID = 'project-1'
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        project: {
          name: 'curly-pottery',
          region_id: 'aws-eu-west-1',
          pg_version: 16,
          data_storage_bytes_hourly_average: 555,
          branch_logical_size_limit: 1048576,
        },
      }),
    }) as unknown as typeof fetch

    const result = await getVercelDataUsage()
    expect(result.success && result.data.neon).toEqual({
      name: 'curly-pottery',
      region: 'aws-eu-west-1',
      pgVersion: 16,
      dataSizeBytes: 555,
      limitBytes: 1048576,
    })
  })

  it('should skip Neon info when env is missing', async () => {
    global.fetch = jest.fn()
    const result = await getVercelDataUsage()
    expect(result.success && result.data.neon).toBeNull()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('should return KV key count', async () => {
    mockDbsize.mockResolvedValue(42)
    const result = await getVercelDataUsage()
    expect(result.success && result.data.kv).toEqual({ keyCount: 42 })
  })

  it('should return null KV usage when dbsize fails', async () => {
    mockDbsize.mockRejectedValue(new Error('kv down'))
    const spy = jest.spyOn(console, 'error').mockImplementation()
    const result = await getVercelDataUsage()
    expect(result.success && result.data.kv).toBeNull()
    spy.mockRestore()
  })

  it('should return runtime info from env vars', async () => {
    process.env.VERCEL_ENV = 'production'
    process.env.VERCEL_REGION = 'iad1'
    process.env.VERCEL_PROJECT_ID = 'prj_123'
    const result = await getVercelDataUsage()
    expect(result.success && result.data.runtime).toEqual({
      environment: 'production',
      region: 'iad1',
      projectId: 'prj_123',
      appUrl: 'http://localhost:3000',
    })
  })
})

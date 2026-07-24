jest.mock('@lib/newsletter/service', () => ({
  subscribeEmailToNewsletter: jest.fn(),
  unsubscribeNewsletterByToken: jest.fn(),
  getNewsletterAdminOverviewData: jest.fn(),
  createNewsletterCampaign: jest.fn(),
  queueNewsletterCampaignById: jest.fn(),
  dispatchQueuedNewsletterBatch: jest.fn(),
  syncOptedInUsersToNewsletter: jest.fn(),
}))
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))
jest.mock('@lib/rate-limit', () => ({
  checkRateLimit: jest
    .fn()
    .mockResolvedValue({ success: true, remaining: 999, resetIn: 0 }),
  getRateLimitKey: jest.fn().mockReturnValue('test-key'),
}))
jest.mock('next/headers', () => ({
  headers: jest.fn(),
}))

import { auth } from '@/auth'
import { headers } from 'next/headers'
import { checkRateLimit, getRateLimitKey } from '@lib/rate-limit'
import {
  subscribeEmailToNewsletter,
  unsubscribeNewsletterByToken,
  getNewsletterAdminOverviewData,
  createNewsletterCampaign,
  queueNewsletterCampaignById,
  dispatchQueuedNewsletterBatch,
  syncOptedInUsersToNewsletter,
} from '@lib/newsletter/service'
import {
  createNewsletterCampaignAction,
  getNewsletterAdminOverview,
  queueNewsletterCampaignAction,
  runNewsletterDispatchAction,
  subscribeToNewsletter,
  syncNewsletterSubscribersAction,
  unsubscribeNewsletter,
} from './newsletter.actions'

const adminSession = { user: { id: 'admin-1', role: 'ADMIN' } }
const nonAdminSession = { user: { id: 'user-1' } }

beforeEach(() => {
  jest.clearAllMocks()
  ;(checkRateLimit as jest.Mock).mockResolvedValue({
    success: true,
    remaining: 999,
    resetIn: 0,
  })
  ;(getRateLimitKey as jest.Mock).mockReturnValue('test-key')
  ;(headers as jest.Mock).mockResolvedValue({
    get: jest.fn().mockReturnValue(null),
  })
})

describe('subscribeToNewsletter', () => {
  const validInput = { email: 'test@example.com' }

  it('calls service.subscribeEmailToNewsletter and returns success', async () => {
    ;(subscribeEmailToNewsletter as jest.Mock).mockResolvedValue({
      email: 'test@example.com',
    })

    const result = await subscribeToNewsletter(validInput)

    expect(result).toEqual({
      success: true,
      message: 'You are subscribed to the newsletter.',
      data: { email: 'test@example.com' },
    })
    expect(subscribeEmailToNewsletter).toHaveBeenCalledWith(validInput)
  })

  it('returns validation error for invalid email', async () => {
    const result = await subscribeToNewsletter({ email: 'not-an-email' })

    expect(result.success).toBe(false)
    expect(result.message).toBe('Validation error')
    expect(subscribeEmailToNewsletter).not.toHaveBeenCalled()
  })

  it('returns validation error for missing email', async () => {
    const result = await subscribeToNewsletter({})

    expect(result.success).toBe(false)
    expect(result.message).toBe('Validation error')
    expect(subscribeEmailToNewsletter).not.toHaveBeenCalled()
  })

  it('returns rate limit error when checkRateLimit returns false', async () => {
    ;(checkRateLimit as jest.Mock).mockResolvedValue({
      success: false,
      remaining: 0,
      resetIn: 30000,
    })

    const result = await subscribeToNewsletter(validInput)

    expect(result).toEqual({
      success: false,
      message: 'Too many requests. Please try again later.',
    })
    expect(subscribeEmailToNewsletter).not.toHaveBeenCalled()
  })

  it('uses x-forwarded-for header for rate limit key', async () => {
    ;(headers as jest.Mock).mockResolvedValue({
      get: jest.fn((name: string) => {
        if (name === 'x-forwarded-for') return '192.168.1.1'
        return null
      }),
    })
    ;(subscribeEmailToNewsletter as jest.Mock).mockResolvedValue({
      email: 'test@example.com',
    })

    await subscribeToNewsletter(validInput)

    expect(getRateLimitKey).toHaveBeenCalledWith('192.168.1.1', 'subscribe')
  })

  it('falls back to unknown ip when no headers present', async () => {
    await subscribeToNewsletter(validInput)

    expect(getRateLimitKey).toHaveBeenCalledWith('unknown', 'subscribe')
  })

  it('returns error when service throws', async () => {
    ;(subscribeEmailToNewsletter as jest.Mock).mockRejectedValue(
      new Error('Service error'),
    )

    const result = await subscribeToNewsletter(validInput)

    expect(result.success).toBe(false)
    expect(result.message).toBe('Service error')
  })
})

describe('unsubscribeNewsletter', () => {
  const validInput = { token: 'unsub-token-123' }

  it('calls service.unsubscribeNewsletterByToken and returns success', async () => {
    ;(unsubscribeNewsletterByToken as jest.Mock).mockResolvedValue({
      email: 'test@example.com',
    })

    const result = await unsubscribeNewsletter(validInput)

    expect(result).toEqual({
      success: true,
      message: 'You have been unsubscribed from Curly Pottery newsletters.',
      data: { email: 'test@example.com' },
    })
    expect(unsubscribeNewsletterByToken).toHaveBeenCalledWith('unsub-token-123')
  })

  it('handles subscriber without email field', async () => {
    ;(unsubscribeNewsletterByToken as jest.Mock).mockResolvedValue(undefined)

    const result = await unsubscribeNewsletter(validInput)

    expect(result.success).toBe(true)
    expect(result.data).toEqual({ email: '' })
  })

  it('returns validation error for empty token', async () => {
    const result = await unsubscribeNewsletter({ token: '' })

    expect(result.success).toBe(false)
    expect(result.message).toBe('Validation error')
    expect(unsubscribeNewsletterByToken).not.toHaveBeenCalled()
  })

  it('returns error when service throws', async () => {
    ;(unsubscribeNewsletterByToken as jest.Mock).mockRejectedValue(
      new Error('Token not found'),
    )

    const result = await unsubscribeNewsletter(validInput)

    expect(result.success).toBe(false)
    expect(result.message).toBe('Token not found')
  })
})

describe('getNewsletterAdminOverview', () => {
  it('admin user returns overview data', async () => {
    ;(auth as jest.Mock).mockResolvedValue(adminSession)
    const mockOverview = {
      subscriberStats: {
        total: 100,
        active: 80,
        unsubscribed: 20,
        registered: 60,
        guests: 40,
      },
      campaignStats: { total: 10, drafts: 3, queued: 2, completed: 5 },
      subscribers: [],
      campaigns: [],
    }
    ;(getNewsletterAdminOverviewData as jest.Mock).mockResolvedValue(
      mockOverview,
    )

    const result = await getNewsletterAdminOverview()

    expect(result).toEqual({
      success: true,
      message: 'Fetched newsletter overview successfully',
      data: mockOverview,
    })
  })

  it('non-admin user returns unauthorized error', async () => {
    ;(auth as jest.Mock).mockResolvedValue(nonAdminSession)

    const result = await getNewsletterAdminOverview()

    expect(result).toEqual({
      success: false,
      message: 'Unauthorized: Administrative privileges required.',
    })
    expect(getNewsletterAdminOverviewData).not.toHaveBeenCalled()
  })

  it('returns error when service throws', async () => {
    ;(auth as jest.Mock).mockResolvedValue(adminSession)
    ;(getNewsletterAdminOverviewData as jest.Mock).mockRejectedValue(
      new Error('Failed to load'),
    )

    const result = await getNewsletterAdminOverview()

    expect(result.success).toBe(false)
    expect(result.message).toBe('Failed to load')
  })
})

describe('createNewsletterCampaignAction', () => {
  const validInput = {
    name: 'Summer Sale',
    subject: 'Check out our summer deals!',
    heading: 'Summer Sale',
    message:
      'We have amazing deals this summer on all our pottery collections.',
    productIds: ['prod-1', 'prod-2'],
    dailySendLimit: 50,
  }

  it('admin valid input calls service.createNewsletterCampaign', async () => {
    ;(auth as jest.Mock).mockResolvedValue(adminSession)
    ;(createNewsletterCampaign as jest.Mock).mockResolvedValue({
      id: 'campaign-1',
    })

    const result = await createNewsletterCampaignAction(validInput)

    expect(result).toEqual({
      success: true,
      message: 'Newsletter campaign created successfully.',
      data: { id: 'campaign-1' },
    })
    expect(createNewsletterCampaign).toHaveBeenCalledWith(validInput)
  })

  it('non-admin returns unauthorized error', async () => {
    ;(auth as jest.Mock).mockResolvedValue(nonAdminSession)

    const result = await createNewsletterCampaignAction(validInput)

    expect(result).toEqual({
      success: false,
      message: 'Unauthorized: Administrative privileges required.',
    })
    expect(createNewsletterCampaign).not.toHaveBeenCalled()
  })

  it('invalid input returns validation error', async () => {
    ;(auth as jest.Mock).mockResolvedValue(adminSession)

    const result = await createNewsletterCampaignAction({
      name: 'X',
      subject: '',
      heading: '',
      message: '',
      productIds: [],
      dailySendLimit: 0,
    })

    expect(result.success).toBe(false)
    expect(result.message).toBe('Validation error')
    expect(createNewsletterCampaign).not.toHaveBeenCalled()
  })

  it('returns error when service throws', async () => {
    ;(auth as jest.Mock).mockResolvedValue(adminSession)
    ;(createNewsletterCampaign as jest.Mock).mockRejectedValue(
      new Error('Product not found'),
    )

    const result = await createNewsletterCampaignAction(validInput)

    expect(result.success).toBe(false)
    expect(result.message).toBe('Product not found')
  })
})

describe('queueNewsletterCampaignAction', () => {
  const validInput = { campaignId: 'campaign-1' }

  it('admin calls service.queueNewsletterCampaignById', async () => {
    ;(auth as jest.Mock).mockResolvedValue(adminSession)
    ;(queueNewsletterCampaignById as jest.Mock).mockResolvedValue(150)

    const result = await queueNewsletterCampaignAction(validInput)

    expect(result).toEqual({
      success: true,
      message: 'Campaign queued for 150 subscribers.',
      data: { recipients: 150 },
    })
    expect(queueNewsletterCampaignById).toHaveBeenCalledWith('campaign-1')
  })

  it('non-admin returns unauthorized error', async () => {
    ;(auth as jest.Mock).mockResolvedValue(nonAdminSession)

    const result = await queueNewsletterCampaignAction(validInput)

    expect(result).toEqual({
      success: false,
      message: 'Unauthorized: Administrative privileges required.',
    })
    expect(queueNewsletterCampaignById).not.toHaveBeenCalled()
  })

  it('invalid campaignId returns validation error', async () => {
    ;(auth as jest.Mock).mockResolvedValue(adminSession)

    const result = await queueNewsletterCampaignAction({ campaignId: '' })

    expect(result.success).toBe(false)
    expect(result.message).toBe('Validation error')
    expect(queueNewsletterCampaignById).not.toHaveBeenCalled()
  })

  it('returns error when service throws', async () => {
    ;(auth as jest.Mock).mockResolvedValue(adminSession)
    ;(queueNewsletterCampaignById as jest.Mock).mockRejectedValue(
      new Error('Campaign not found'),
    )

    const result = await queueNewsletterCampaignAction(validInput)

    expect(result.success).toBe(false)
    expect(result.message).toBe('Campaign not found')
  })
})

describe('runNewsletterDispatchAction', () => {
  it('admin calls service.dispatchQueuedNewsletterBatch', async () => {
    ;(auth as jest.Mock).mockResolvedValue(adminSession)
    const mockResult = { processed: 10, sent: 8, failed: 2, remaining: 40 }
    ;(dispatchQueuedNewsletterBatch as jest.Mock).mockResolvedValue(mockResult)

    const result = await runNewsletterDispatchAction()

    expect(result).toEqual({
      success: true,
      message: 'Newsletter batch processed successfully.',
      data: mockResult,
    })
    expect(dispatchQueuedNewsletterBatch).toHaveBeenCalledTimes(1)
  })

  it('non-admin returns unauthorized error', async () => {
    ;(auth as jest.Mock).mockResolvedValue(nonAdminSession)

    const result = await runNewsletterDispatchAction()

    expect(result).toEqual({
      success: false,
      message: 'Unauthorized: Administrative privileges required.',
    })
    expect(dispatchQueuedNewsletterBatch).not.toHaveBeenCalled()
  })

  it('returns error when service throws', async () => {
    ;(auth as jest.Mock).mockResolvedValue(adminSession)
    ;(dispatchQueuedNewsletterBatch as jest.Mock).mockRejectedValue(
      new Error('Dispatch failed'),
    )

    const result = await runNewsletterDispatchAction()

    expect(result.success).toBe(false)
    expect(result.message).toBe('Dispatch failed')
  })
})

describe('syncNewsletterSubscribersAction', () => {
  it('admin calls service.syncOptedInUsersToNewsletter', async () => {
    ;(auth as jest.Mock).mockResolvedValue(adminSession)
    ;(syncOptedInUsersToNewsletter as jest.Mock).mockResolvedValue(42)

    const result = await syncNewsletterSubscribersAction()

    expect(result).toEqual({
      success: true,
      message: 'Synced 42 opted-in users into the newsletter list.',
      data: { synced: 42 },
    })
    expect(syncOptedInUsersToNewsletter).toHaveBeenCalledTimes(1)
  })

  it('non-admin returns unauthorized error', async () => {
    ;(auth as jest.Mock).mockResolvedValue(nonAdminSession)

    const result = await syncNewsletterSubscribersAction()

    expect(result).toEqual({
      success: false,
      message: 'Unauthorized: Administrative privileges required.',
    })
    expect(syncOptedInUsersToNewsletter).not.toHaveBeenCalled()
  })

  it('returns error when service throws', async () => {
    ;(auth as jest.Mock).mockResolvedValue(adminSession)
    ;(syncOptedInUsersToNewsletter as jest.Mock).mockRejectedValue(
      new Error('Sync failed'),
    )

    const result = await syncNewsletterSubscribersAction()

    expect(result.success).toBe(false)
    expect(result.message).toBe('Sync failed')
  })
})

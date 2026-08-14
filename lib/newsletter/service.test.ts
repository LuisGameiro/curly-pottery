jest.mock('prisma/prisma', () => ({
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  prisma: require('jest-mock-extended').mockDeep(),
}))

jest.mock('resend', () => {
  const mockResendInstance = {
    emails: {
      send: jest.fn(),
    },
  }

  return {
    Resend: jest.fn(() => mockResendInstance),
  }
})

jest.mock('@lib/site-url', () => ({
  getAppUrl: () => 'https://example.com',
  resolveSiteUrl: (url: string) =>
    new URL(url, 'https://example.com').toString(),
}))

jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  verifyTrackedNewsletterSignature: jest.fn(),
  normalizeNewsletterEmail:
    jest.requireActual('./utils').normalizeNewsletterEmail,
  buildNewsletterClickUrl:
    jest.requireActual('./utils').buildNewsletterClickUrl,
  buildNewsletterOpenUrl: jest.requireActual('./utils').buildNewsletterOpenUrl,
  buildNewsletterUnsubscribeUrl:
    jest.requireActual('./utils').buildNewsletterUnsubscribeUrl,
  NEWSLETTER_DEFAULT_DAILY_LIMIT:
    jest.requireActual('./utils').NEWSLETTER_DEFAULT_DAILY_LIMIT,
}))

import {
  createNewsletterCampaign,
  dispatchQueuedNewsletterBatch,
  getNewsletterAdminOverviewData,
  queueNewsletterCampaignById,
  recordNewsletterClick,
  recordNewsletterOpen,
  subscribeEmailToNewsletter,
  syncOptedInUsersToNewsletter,
  unsubscribeNewsletterByToken,
} from './service'
import { prisma } from 'prisma/prisma'
import {
  NewsletterCampaignStatus,
  NewsletterSubscriberSource,
  NewsletterSubscriberStatus,
} from '@lib/types/types'
import { verifyTrackedNewsletterSignature } from './utils'

describe('newsletter service', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Resend } = require('resend')
  const mockResend = new Resend()

  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(prisma.$transaction).mockImplementation(async (operations) => {
      if (typeof operations === 'function') {
        return operations(prisma)
      }

      return operations as never
    })
  })

  it('subscribes an email and links an existing customer account', async () => {
    jest.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-1',
      email: 'jane@example.com',
      firstName: 'Jane',
      lastName: 'Doe',
    } as never)
    jest.mocked(prisma.newsletterSubscriber.upsert).mockResolvedValue({
      id: 'subscriber-1',
      email: 'jane@example.com',
    } as never)
    jest.mocked(prisma.user.update).mockResolvedValue({} as never)

    const subscriber = await subscribeEmailToNewsletter({
      email: '  JANE@example.com ',
      source: NewsletterSubscriberSource.GUEST,
    })

    expect(prisma.newsletterSubscriber.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { email: 'jane@example.com' },
        create: expect.objectContaining({
          email: 'jane@example.com',
          userId: 'user-1',
        }),
        update: expect.objectContaining({
          status: NewsletterSubscriberStatus.SUBSCRIBED,
          userId: 'user-1',
        }),
      }),
    )
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { acceptsMarketing: true },
    })
    expect(subscriber.email).toBe('jane@example.com')
  })

  it('queues a draft campaign for all subscribed recipients', async () => {
    jest.mocked(prisma.newsletterCampaign.findUnique).mockResolvedValue({
      id: 'campaign-1',
      status: NewsletterCampaignStatus.DRAFT,
    } as never)
    jest
      .mocked(prisma.newsletterSubscriber.findMany)
      .mockResolvedValue([
        { id: 'subscriber-1' },
        { id: 'subscriber-2' },
      ] as never)
    jest.mocked(prisma.newsletterDelivery.createMany).mockResolvedValue({
      count: 2,
    } as never)
    jest.mocked(prisma.newsletterCampaign.update).mockResolvedValue({
      id: 'campaign-1',
    } as never)

    const recipients = await queueNewsletterCampaignById('campaign-1')

    expect(recipients).toBe(2)
    expect(prisma.newsletterDelivery.createMany).toHaveBeenCalledWith({
      data: [
        { campaignId: 'campaign-1', subscriberId: 'subscriber-1' },
        { campaignId: 'campaign-1', subscriberId: 'subscriber-2' },
      ],
      skipDuplicates: true,
    })
    expect(prisma.newsletterCampaign.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'campaign-1' },
        data: expect.objectContaining({
          status: NewsletterCampaignStatus.QUEUED,
          recipientCount: 2,
        }),
      }),
    )
  })

  it('dispatches a queued newsletter batch and records a successful send', async () => {
    jest.mocked(prisma.newsletterCampaign.findMany).mockResolvedValue([
      {
        id: 'campaign-1',
        name: 'April launch',
        subject: 'Fresh studio drop',
        previewText: 'New mugs and bowls are live.',
        heading: 'Fresh from the kiln',
        message: 'A new studio batch is ready to browse.',
        ctaLabel: 'Shop the drop',
        ctaUrl: '/shop',
        status: NewsletterCampaignStatus.QUEUED,
        dailySendLimit: 50,
        recipientCount: 1,
        sentCount: 0,
        failedCount: 0,
        openedCount: 0,
        clickedCount: 0,
        queuedAt: new Date(),
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        products: [
          {
            id: 'campaign-product-1',
            campaignId: 'campaign-1',
            productId: 'product-1',
            sortOrder: 0,
            createdAt: new Date(),
            product: {
              id: 'product-1',
              name: 'Studio Mug',
              slug: 'studio-mug',
              description: 'Wheel-thrown mug',
              hide: false,
              images: ['https://example.com/mug.jpg'],
              requiresShipping: true,
              createdAt: new Date(),
              updatedAt: new Date(),
              categories: [],
              variants: [
                {
                  id: 'variant-1',
                  productId: 'product-1',
                  sku: 'MUG-001',
                  price: 24,
                  currency: 'GBP',
                  stock: 3,
                  availableForSale: true,
                  images: [],
                  sizeName: 'One Size',
                  colorName: 'Sand',
                  colorHex: '#f0e3d4',
                  details: null,
                  discounts: null,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
              ],
            },
          },
        ],
      },
    ] as never)
    jest.mocked(prisma.$queryRaw).mockResolvedValue([{ id: 'delivery-1' }])
    jest.mocked(prisma.newsletterDelivery.updateMany).mockResolvedValue({
      count: 1,
    } as never)
    jest.mocked(prisma.newsletterDelivery.findMany).mockResolvedValue([
      {
        id: 'delivery-1',
        campaignId: 'campaign-1',
        subscriberId: 'subscriber-1',
        status: 'PENDING',
        providerMessageId: null,
        errorMessage: null,
        trackingToken: 'track-1',
        sentAt: null,
        openedAt: null,
        openCount: 0,
        clickedCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        subscriber: {
          id: 'subscriber-1',
          email: 'collector@example.com',
          firstName: 'Collector',
          lastName: 'One',
          status: NewsletterSubscriberStatus.SUBSCRIBED,
          source: NewsletterSubscriberSource.GUEST,
          unsubscribeToken: 'unsubscribe-1',
          subscribedAt: new Date(),
          unsubscribedAt: null,
          userId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    ] as never)
    mockResend.emails.send.mockResolvedValue({
      data: { id: 'email-1' },
      error: null,
    })
    jest.mocked(prisma.newsletterDelivery.update).mockResolvedValue({
      id: 'delivery-1',
    } as never)
    jest.mocked(prisma.newsletterCampaign.update).mockResolvedValue({
      id: 'campaign-1',
    } as never)
    jest.mocked(prisma.newsletterDelivery.count).mockResolvedValue(0)

    const result = await dispatchQueuedNewsletterBatch()

    expect(result).toEqual({
      processed: 1,
      sent: 1,
      failed: 0,
      remaining: 0,
    })
    expect(mockResend.emails.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'collector@example.com',
        subject: 'Fresh studio drop',
      }),
    )
    expect(prisma.newsletterDelivery.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'delivery-1' },
        data: expect.objectContaining({
          status: 'SENT',
          providerMessageId: 'email-1',
        }),
      }),
    )
  })

  it('unsubscribes a subscriber and skips pending deliveries', async () => {
    jest
      .mocked(prisma.newsletterSubscriber.findUnique)
      .mockResolvedValueOnce({
        id: 'subscriber-1',
        email: 'collector@example.com',
        status: NewsletterSubscriberStatus.SUBSCRIBED,
        userId: 'user-1',
      } as never)
      .mockResolvedValueOnce({
        id: 'subscriber-1',
        email: 'collector@example.com',
        status: NewsletterSubscriberStatus.UNSUBSCRIBED,
      } as never)
    jest
      .mocked(prisma.newsletterDelivery.findMany)
      .mockResolvedValue([{ campaignId: 'campaign-1' }] as never)
    jest.mocked(prisma.newsletterSubscriber.update).mockResolvedValue({
      id: 'subscriber-1',
    } as never)
    jest.mocked(prisma.newsletterDelivery.updateMany).mockResolvedValue({
      count: 1,
    } as never)
    jest.mocked(prisma.user.update).mockResolvedValue({ id: 'user-1' } as never)
    jest.mocked(prisma.newsletterCampaign.update).mockResolvedValue({
      id: 'campaign-1',
    } as never)
    jest.mocked(prisma.newsletterDelivery.count).mockResolvedValue(0)

    const subscriber = await unsubscribeNewsletterByToken('unsubscribe-1')

    expect(prisma.newsletterDelivery.updateMany).toHaveBeenCalledWith({
      where: {
        subscriberId: 'subscriber-1',
        status: 'PENDING',
      },
      data: {
        status: 'SKIPPED',
        errorMessage: 'Subscriber unsubscribed before send.',
      },
    })
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { acceptsMarketing: false },
    })
    expect(subscriber?.status).toBe(NewsletterSubscriberStatus.UNSUBSCRIBED)
  })
})

describe('createNewsletterCampaign', () => {
  it('creates campaign with valid product IDs, verifies prisma calls', async () => {
    jest
      .mocked(prisma.product.findMany)
      .mockResolvedValue([{ id: 'product-1' }, { id: 'product-2' }] as never)

    const mockCampaign = {
      id: 'campaign-1',
      name: 'Spring Collection',
      subject: 'New spring arrivals',
      previewText: 'Warm tones and fresh glazes',
      heading: 'Spring is here',
      message: 'Check out our latest studio batch with warm spring tones.',
      ctaLabel: 'Shop Now',
      ctaUrl: '/shop',
      status: NewsletterCampaignStatus.DRAFT,
      dailySendLimit: 50,
      recipientCount: 0,
      sentCount: 0,
      failedCount: 0,
      openedCount: 0,
      clickedCount: 0,
      queuedAt: null,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      products: [],
    }

    jest
      .mocked(prisma.newsletterCampaign.create)
      .mockResolvedValue(mockCampaign as never)

    const result = await createNewsletterCampaign({
      name: '  Spring Collection  ',
      subject: 'New spring arrivals',
      previewText: 'Warm tones and fresh glazes',
      heading: 'Spring is here',
      message: 'Check out our latest studio batch with warm spring tones.',
      ctaLabel: 'Shop Now',
      ctaUrl: '/shop',
      productIds: ['product-1', 'product-2'],
      dailySendLimit: 50,
    })

    expect(prisma.product.findMany).toHaveBeenCalledWith({
      where: { id: { in: ['product-1', 'product-2'] } },
      select: { id: true },
    })
    expect(prisma.newsletterCampaign.create).toHaveBeenCalled()
    expect(result.id).toBe('campaign-1')
    expect(result.name).toBe('Spring Collection')
  })

  it('throws when one or more products not found', async () => {
    jest
      .mocked(prisma.product.findMany)
      .mockResolvedValue([{ id: 'product-1' }] as never)

    await expect(
      createNewsletterCampaign({
        name: 'Spring Collection',
        subject: 'New spring arrivals',
        heading: 'Spring is here',
        message: 'Check out our latest studio batch with warm spring tones.',
        productIds: ['product-1', 'product-2', 'product-3'],
        dailySendLimit: 50,
      }),
    ).rejects.toThrow('One or more selected products could not be found.')
  })
})

describe('syncOptedInUsersToNewsletter', () => {
  it('finds opted-in users and subscribes them', async () => {
    jest.mocked(prisma.user.findMany).mockResolvedValue([
      {
        id: 'user-1',
        email: 'optedin@example.com',
        firstName: 'Opted',
        lastName: 'In',
      },
      {
        id: 'user-2',
        email: 'alsosubscribed@example.com',
        firstName: 'Also',
        lastName: 'Subscribed',
      },
    ] as never)
    jest.mocked(prisma.user.findUnique).mockResolvedValue({} as never)
    jest
      .mocked(prisma.newsletterSubscriber.upsert)
      .mockResolvedValue({ id: 'sub-' } as never)
    jest.mocked(prisma.user.update).mockResolvedValue({} as never)

    const result = await syncOptedInUsersToNewsletter()

    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { acceptsMarketing: true },
      }),
    )
    expect(result).toBe(2)
  })

  it('returns correct count for single user', async () => {
    jest
      .mocked(prisma.user.findMany)
      .mockResolvedValue([
        { id: 'user-1', email: 'a@example.com', firstName: 'A', lastName: 'B' },
      ] as never)
    jest.mocked(prisma.user.findUnique).mockResolvedValue({} as never)
    jest
      .mocked(prisma.newsletterSubscriber.upsert)
      .mockResolvedValue({ id: 'sub-1' } as never)
    jest.mocked(prisma.user.update).mockResolvedValue({} as never)

    const result = await syncOptedInUsersToNewsletter()

    expect(result).toBe(1)
  })
})

describe('getNewsletterAdminOverviewData', () => {
  it('calls all the count aggregations and returns the correct stats shape', async () => {
    jest
      .mocked(prisma.newsletterSubscriber.count)
      .mockResolvedValueOnce(150)
      .mockResolvedValueOnce(100)
      .mockResolvedValueOnce(40)
      .mockResolvedValueOnce(80)
      .mockResolvedValueOnce(70)
    jest
      .mocked(prisma.newsletterCampaign.count)
      .mockResolvedValueOnce(20)
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(12)
    jest
      .mocked(prisma.newsletterSubscriber.findMany)
      .mockResolvedValueOnce([{ id: 'sub-1', email: 'a@example.com' }] as never)
    jest
      .mocked(prisma.newsletterCampaign.findMany)
      .mockResolvedValueOnce([{ id: 'camp-1', name: 'Campaign' }] as never)

    const result = await getNewsletterAdminOverviewData()

    expect(result).toEqual({
      subscriberStats: {
        total: 150,
        active: 100,
        unsubscribed: 40,
        registered: 80,
        guests: 70,
      },
      campaignStats: {
        total: 20,
        drafts: 5,
        queued: 3,
        completed: 12,
      },
      subscribers: [{ id: 'sub-1', email: 'a@example.com' }],
      campaigns: [{ id: 'camp-1', name: 'Campaign' }],
    })
  })
})

describe('queueNewsletterCampaignById edge cases', () => {
  it('campaign not found throws Campaign not found.', async () => {
    jest.mocked(prisma.newsletterCampaign.findUnique).mockResolvedValue(null)

    await expect(queueNewsletterCampaignById('missing-id')).rejects.toThrow(
      'Campaign not found.',
    )
  })

  it('campaign not draft throws Only draft campaigns can be queued.', async () => {
    jest.mocked(prisma.newsletterCampaign.findUnique).mockResolvedValue({
      id: 'campaign-1',
      status: NewsletterCampaignStatus.QUEUED,
    } as never)

    await expect(queueNewsletterCampaignById('campaign-1')).rejects.toThrow(
      'Only draft campaigns can be queued.',
    )
  })

  it('no subscribed subscribers throws appropriate error', async () => {
    jest.mocked(prisma.newsletterCampaign.findUnique).mockResolvedValue({
      id: 'campaign-1',
      status: NewsletterCampaignStatus.DRAFT,
    } as never)
    jest.mocked(prisma.newsletterSubscriber.findMany).mockResolvedValue([])

    await expect(queueNewsletterCampaignById('campaign-1')).rejects.toThrow(
      'There are no subscribed recipients for this campaign.',
    )
  })
})

describe('dispatchQueuedNewsletterBatch edge cases', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Resend } = require('resend')
  const mockResend = new Resend()

  it('no queued campaigns returns zero summary', async () => {
    jest.mocked(prisma.newsletterCampaign.findMany).mockResolvedValue([])
    jest.mocked(prisma.newsletterDelivery.count).mockResolvedValue(0)

    const result = await dispatchQueuedNewsletterBatch()

    expect(result).toEqual({ processed: 0, sent: 0, failed: 0, remaining: 0 })
  })

  it('remainingLimit reaches zero with globalLimit=0', async () => {
    jest
      .mocked(prisma.newsletterCampaign.findMany)
      .mockResolvedValue([{ id: 'campaign-1' }] as never)
    jest.mocked(prisma.newsletterDelivery.count).mockResolvedValue(0)

    const result = await dispatchQueuedNewsletterBatch(0)

    expect(result).toEqual({ processed: 0, sent: 0, failed: 0, remaining: 0 })
  })

  it('handles resend API error response', async () => {
    jest.mocked(prisma.newsletterCampaign.findMany).mockResolvedValue([
      {
        id: 'campaign-error-1',
        name: 'Error campaign',
        subject: 'Error test',
        previewText: 'Testing error handling',
        heading: 'Error Handling',
        message: 'Testing error path.',
        ctaLabel: null,
        ctaUrl: null,
        status: NewsletterCampaignStatus.QUEUED,
        dailySendLimit: 50,
        recipientCount: 1,
        sentCount: 0,
        failedCount: 0,
        openedCount: 0,
        clickedCount: 0,
        queuedAt: new Date(),
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        products: [],
      },
    ] as never)
    jest
      .mocked(prisma.$queryRaw)
      .mockResolvedValue([{ id: 'delivery-error-1' }])
    jest.mocked(prisma.newsletterDelivery.updateMany).mockResolvedValue({
      count: 1,
    } as never)
    jest.mocked(prisma.newsletterDelivery.findMany).mockResolvedValue([
      {
        id: 'delivery-error-1',
        campaignId: 'campaign-error-1',
        subscriberId: 'subscriber-err',
        status: 'PENDING',
        providerMessageId: null,
        errorMessage: null,
        trackingToken: 'track-error-1',
        sentAt: null,
        openedAt: null,
        openCount: 0,
        clickedCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        subscriber: {
          id: 'subscriber-err',
          email: 'error@example.com',
          firstName: 'Error',
          lastName: 'User',
          status: NewsletterSubscriberStatus.SUBSCRIBED,
          source: NewsletterSubscriberSource.GUEST,
          unsubscribeToken: 'unsubscribe-error-1',
          subscribedAt: new Date(),
          unsubscribedAt: null,
          userId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    ] as never)
    mockResend.emails.send.mockResolvedValue({
      data: null,
      error: { message: 'Daily quota exceeded' },
    })
    jest.mocked(prisma.newsletterDelivery.update).mockResolvedValue({} as never)
    jest.mocked(prisma.newsletterCampaign.update).mockResolvedValue({} as never)
    jest.mocked(prisma.newsletterDelivery.count).mockResolvedValue(0)

    const result = await dispatchQueuedNewsletterBatch()

    expect(result).toEqual({ processed: 1, sent: 0, failed: 1, remaining: 0 })
    expect(prisma.newsletterDelivery.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'delivery-error-1' },
        data: expect.objectContaining({
          status: 'FAILED',
          errorMessage: 'Daily quota exceeded',
        }),
      }),
    )
    expect(prisma.newsletterCampaign.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'campaign-error-1' },
        data: expect.objectContaining({
          failedCount: { increment: 1 },
        }),
      }),
    )
  })

  it('handles resend thrown Error exception', async () => {
    jest.mocked(prisma.newsletterCampaign.findMany).mockResolvedValue([
      {
        id: 'campaign-catch-1',
        name: 'Catch campaign',
        subject: 'Catch test',
        previewText: 'Testing catch handling',
        heading: 'Catch Handling',
        message: 'Testing catch path.',
        ctaLabel: null,
        ctaUrl: null,
        status: NewsletterCampaignStatus.QUEUED,
        dailySendLimit: 50,
        recipientCount: 1,
        sentCount: 0,
        failedCount: 0,
        openedCount: 0,
        clickedCount: 0,
        queuedAt: new Date(),
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        products: [],
      },
    ] as never)
    jest
      .mocked(prisma.$queryRaw)
      .mockResolvedValue([{ id: 'delivery-catch-1' }])
    jest.mocked(prisma.newsletterDelivery.updateMany).mockResolvedValue({
      count: 1,
    } as never)
    jest.mocked(prisma.newsletterDelivery.findMany).mockResolvedValue([
      {
        id: 'delivery-catch-1',
        campaignId: 'campaign-catch-1',
        subscriberId: 'subscriber-catch',
        status: 'PENDING',
        providerMessageId: null,
        errorMessage: null,
        trackingToken: 'track-catch-1',
        sentAt: null,
        openedAt: null,
        openCount: 0,
        clickedCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        subscriber: {
          id: 'subscriber-catch',
          email: 'catch@example.com',
          firstName: 'Catch',
          lastName: 'User',
          status: NewsletterSubscriberStatus.SUBSCRIBED,
          source: NewsletterSubscriberSource.GUEST,
          unsubscribeToken: 'unsubscribe-catch-1',
          subscribedAt: new Date(),
          unsubscribedAt: null,
          userId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    ] as never)
    mockResend.emails.send.mockRejectedValue(new Error('Connection timeout'))
    jest.mocked(prisma.newsletterDelivery.update).mockResolvedValue({} as never)
    jest.mocked(prisma.newsletterCampaign.update).mockResolvedValue({} as never)
    jest.mocked(prisma.newsletterDelivery.count).mockResolvedValue(0)

    const result = await dispatchQueuedNewsletterBatch()

    expect(result).toEqual({ processed: 1, sent: 0, failed: 1, remaining: 0 })
    expect(prisma.newsletterDelivery.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'delivery-catch-1' },
        data: expect.objectContaining({
          status: 'FAILED',
          errorMessage: 'Connection timeout',
        }),
      }),
    )
  })

  it('handles resend thrown non-Error exception', async () => {
    jest.mocked(prisma.newsletterCampaign.findMany).mockResolvedValue([
      {
        id: 'campaign-string-1',
        name: 'String campaign',
        subject: 'String test',
        previewText: 'Testing string exception',
        heading: 'String Exception',
        message: 'Testing string catch path.',
        ctaLabel: null,
        ctaUrl: null,
        status: NewsletterCampaignStatus.QUEUED,
        dailySendLimit: 50,
        recipientCount: 1,
        sentCount: 0,
        failedCount: 0,
        openedCount: 0,
        clickedCount: 0,
        queuedAt: new Date(),
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        products: [],
      },
    ] as never)
    jest
      .mocked(prisma.$queryRaw)
      .mockResolvedValue([{ id: 'delivery-string-1' }])
    jest.mocked(prisma.newsletterDelivery.updateMany).mockResolvedValue({
      count: 1,
    } as never)
    jest.mocked(prisma.newsletterDelivery.findMany).mockResolvedValue([
      {
        id: 'delivery-string-1',
        campaignId: 'campaign-string-1',
        subscriberId: 'subscriber-string',
        status: 'PENDING',
        providerMessageId: null,
        errorMessage: null,
        trackingToken: 'track-string-1',
        sentAt: null,
        openedAt: null,
        openCount: 0,
        clickedCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        subscriber: {
          id: 'subscriber-string',
          email: 'string@example.com',
          firstName: 'String',
          lastName: 'User',
          status: NewsletterSubscriberStatus.SUBSCRIBED,
          source: NewsletterSubscriberSource.GUEST,
          unsubscribeToken: 'unsubscribe-string-1',
          subscribedAt: new Date(),
          unsubscribedAt: null,
          userId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    ] as never)
    mockResend.emails.send.mockRejectedValue('Network error string')
    jest.mocked(prisma.newsletterDelivery.update).mockResolvedValue({} as never)
    jest.mocked(prisma.newsletterCampaign.update).mockResolvedValue({} as never)
    jest.mocked(prisma.newsletterDelivery.count).mockResolvedValue(0)

    const result = await dispatchQueuedNewsletterBatch()

    expect(result).toEqual({ processed: 1, sent: 0, failed: 1, remaining: 0 })
    expect(prisma.newsletterDelivery.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'delivery-string-1' },
        data: expect.objectContaining({
          status: 'FAILED',
          errorMessage: 'Unexpected newsletter error',
        }),
      }),
    )
  })

  it('breaks inner loop when remainingLimit reaches zero', async () => {
    jest.mocked(prisma.newsletterCampaign.findMany).mockResolvedValue([
      {
        id: 'campaign-limit-1',
        name: 'Limit campaign',
        subject: 'Limit test',
        previewText: 'Testing inner loop break',
        heading: 'Inner Loop Break',
        message: 'Testing limit break.',
        ctaLabel: null,
        ctaUrl: null,
        status: NewsletterCampaignStatus.QUEUED,
        dailySendLimit: 50,
        recipientCount: 3,
        sentCount: 0,
        failedCount: 0,
        openedCount: 0,
        clickedCount: 0,
        queuedAt: new Date(),
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        products: [],
      },
    ] as never)
    jest
      .mocked(prisma.$queryRaw)
      .mockResolvedValue([
        { id: 'delivery-limit-1' },
        { id: 'delivery-limit-2' },
      ])
    jest.mocked(prisma.newsletterDelivery.updateMany).mockResolvedValue({
      count: 2,
    } as never)
    jest.mocked(prisma.newsletterDelivery.findMany).mockResolvedValue([
      {
        id: 'delivery-limit-1',
        campaignId: 'campaign-limit-1',
        subscriberId: 'sub-limit-1',
        status: 'PENDING',
        providerMessageId: null,
        errorMessage: null,
        trackingToken: 'track-limit-1',
        sentAt: null,
        openedAt: null,
        openCount: 0,
        clickedCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        subscriber: {
          id: 'sub-limit-1',
          email: 'limit1@example.com',
          firstName: 'Limit',
          lastName: 'One',
          status: NewsletterSubscriberStatus.SUBSCRIBED,
          source: NewsletterSubscriberSource.GUEST,
          unsubscribeToken: 'unsub-limit-1',
          subscribedAt: new Date(),
          unsubscribedAt: null,
          userId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      {
        id: 'delivery-limit-2',
        campaignId: 'campaign-limit-1',
        subscriberId: 'sub-limit-2',
        status: 'PENDING',
        providerMessageId: null,
        errorMessage: null,
        trackingToken: 'track-limit-2',
        sentAt: null,
        openedAt: null,
        openCount: 0,
        clickedCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        subscriber: {
          id: 'sub-limit-2',
          email: 'limit2@example.com',
          firstName: 'Limit',
          lastName: 'Two',
          status: NewsletterSubscriberStatus.SUBSCRIBED,
          source: NewsletterSubscriberSource.GUEST,
          unsubscribeToken: 'unsub-limit-2',
          subscribedAt: new Date(),
          unsubscribedAt: null,
          userId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    ] as never)
    mockResend.emails.send.mockResolvedValue({
      data: { id: 'email-limit' },
      error: null,
    })
    jest.mocked(prisma.newsletterDelivery.update).mockResolvedValue({} as never)
    jest.mocked(prisma.newsletterCampaign.update).mockResolvedValue({} as never)
    jest.mocked(prisma.newsletterDelivery.count).mockResolvedValue(0)

    const result = await dispatchQueuedNewsletterBatch(2)

    expect(result).toEqual({ processed: 2, sent: 2, failed: 0, remaining: 0 })
  })
})

describe('unsubscribeNewsletterByToken edge cases', () => {
  it('throws when subscriber not found', async () => {
    jest.mocked(prisma.newsletterSubscriber.findUnique).mockResolvedValue(null)

    await expect(
      unsubscribeNewsletterByToken('nonexistent-token'),
    ).rejects.toThrow('We could not find that newsletter subscription.')
  })

  it('returns early when subscriber is already unsubscribed', async () => {
    jest.mocked(prisma.newsletterSubscriber.findUnique).mockResolvedValue({
      id: 'sub-already-unsub',
      email: 'already@example.com',
      status: NewsletterSubscriberStatus.UNSUBSCRIBED,
    } as never)

    const result = await unsubscribeNewsletterByToken('already-unsub-token')

    expect(result).toBeDefined()
    expect(result!.status).toBe(NewsletterSubscriberStatus.UNSUBSCRIBED)
  })
})

describe('recordNewsletterOpen', () => {
  it('delivery not found returns false', async () => {
    jest.mocked(prisma.newsletterDelivery.findUnique).mockResolvedValue(null)

    const result = await recordNewsletterOpen('unknown-token')

    expect(result).toBe(false)
  })

  it('first open sets openedAt and increments campaign openedCount', async () => {
    jest.mocked(prisma.newsletterDelivery.findUnique).mockResolvedValue({
      id: 'delivery-1',
      campaignId: 'campaign-1',
      openedAt: null,
      openCount: 0,
    } as never)
    jest.mocked(prisma.newsletterDelivery.update).mockResolvedValue({} as never)
    jest.mocked(prisma.newsletterCampaign.update).mockResolvedValue({} as never)

    const result = await recordNewsletterOpen('token-1')

    expect(result).toBe(true)
    expect(prisma.newsletterDelivery.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'delivery-1' },
        data: expect.objectContaining({
          openedAt: expect.any(Date),
          openCount: { increment: 1 },
        }),
      }),
    )
    expect(prisma.newsletterCampaign.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'campaign-1' },
        data: { openedCount: { increment: 1 } },
      }),
    )
  })

  it('subsequent open only increments openCount', async () => {
    jest.mocked(prisma.newsletterDelivery.findUnique).mockResolvedValue({
      id: 'delivery-1',
      campaignId: 'campaign-1',
      openedAt: new Date('2025-01-01'),
      openCount: 1,
    } as never)
    jest.mocked(prisma.newsletterDelivery.update).mockResolvedValue({} as never)

    const result = await recordNewsletterOpen('token-1')

    expect(result).toBe(true)
    expect(prisma.newsletterDelivery.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'delivery-1' },
        data: { openCount: { increment: 1 } },
      }),
    )
  })
})

describe('recordNewsletterClick', () => {
  beforeEach(() => {
    jest.mocked(verifyTrackedNewsletterSignature).mockReset()
  })

  it('invalid signature throws error', async () => {
    jest.mocked(verifyTrackedNewsletterSignature).mockReturnValue(false)

    await expect(
      recordNewsletterClick({
        token: 'token-1',
        url: '/shop/mug',
        signature: 'bad-sig',
      }),
    ).rejects.toThrow('Invalid newsletter tracking signature.')
  })

  it('delivery not found throws error', async () => {
    jest.mocked(verifyTrackedNewsletterSignature).mockReturnValue(true)
    jest.mocked(prisma.newsletterDelivery.findUnique).mockResolvedValue(null)

    await expect(
      recordNewsletterClick({
        token: 'token-1',
        url: '/shop/mug',
        signature: 'valid-sig',
      }),
    ).rejects.toThrow('Newsletter delivery not found.')
  })

  it('successful click creates click record and updates counts', async () => {
    jest.mocked(verifyTrackedNewsletterSignature).mockReturnValue(true)
    jest.mocked(prisma.newsletterDelivery.findUnique).mockResolvedValue({
      id: 'delivery-1',
      campaignId: 'campaign-1',
      subscriberId: 'subscriber-1',
    } as never)
    jest
      .mocked(prisma.newsletterLinkClick.create)
      .mockResolvedValue({} as never)
    jest.mocked(prisma.newsletterDelivery.update).mockResolvedValue({} as never)
    jest.mocked(prisma.newsletterCampaign.update).mockResolvedValue({} as never)

    const result = await recordNewsletterClick({
      token: 'token-1',
      url: '/shop/mug',
      signature: 'valid-sig',
      label: 'product:studio-mug',
      productId: 'product-1',
    })

    expect(result).toBe('https://example.com/shop/mug')
    expect(prisma.newsletterLinkClick.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          deliveryId: 'delivery-1',
          campaignId: 'campaign-1',
          subscriberId: 'subscriber-1',
          productId: 'product-1',
          label: 'product:studio-mug',
          url: 'https://example.com/shop/mug',
        }),
      }),
    )
    expect(prisma.newsletterDelivery.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'delivery-1' },
        data: { clickedCount: { increment: 1 } },
      }),
    )
    expect(prisma.newsletterCampaign.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'campaign-1' },
        data: { clickedCount: { increment: 1 } },
      }),
    )
  })
})

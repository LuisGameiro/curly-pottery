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

import {
  dispatchQueuedNewsletterBatch,
  queueNewsletterCampaignById,
  subscribeEmailToNewsletter,
  unsubscribeNewsletterByToken,
} from './service'
import { prisma } from 'prisma/prisma'
import {
  NewsletterCampaignStatus,
  NewsletterSubscriberSource,
  NewsletterSubscriberStatus,
} from '@lib/types/types'

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
    jest.mocked(prisma.newsletterSubscriber.findMany).mockResolvedValue([
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
    jest
      .mocked(prisma.newsletterDelivery.count)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0)

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
    jest.mocked(prisma.newsletterDelivery.findMany).mockResolvedValue([
      { campaignId: 'campaign-1' },
    ] as never)
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
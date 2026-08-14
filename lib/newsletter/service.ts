import NewsletterEmail, {
  NewsletterEmailProduct,
} from '@lib/emails/NewsletterEmail'
import {
  NewsletterCampaignInput,
  NewsletterSubscriptionInput,
} from '@lib/form-validator'
import {
  NewsletterAdminOverview,
  NewsletterCampaignStatus,
  NewsletterCampaignWithProducts,
  NewsletterDispatchSummary,
  NewsletterSubscriberSource,
  NewsletterSubscriberStatus,
} from '@lib/types/types'
import { Prisma } from 'prisma/generated/prisma/client'
import { prisma } from 'prisma/prisma'
import { Resend } from 'resend'
import {
  NEWSLETTER_DEFAULT_DAILY_LIMIT,
  buildNewsletterClickUrl,
  buildNewsletterOpenUrl,
  buildNewsletterUnsubscribeUrl,
  normalizeNewsletterEmail,
  resolveSiteUrl,
  verifyTrackedNewsletterSignature,
} from './utils'

const resend = new Resend(process.env.RESEND_API_KEY)

const NEWSLETTER_FROM_EMAIL =
  process.env.NEWSLETTER_FROM_EMAIL ||
  'Curly Pottery <noreply@curlypottery.com>'

/** Failed deliveries are re-queued up to this many times before giving up. */
const NEWSLETTER_MAX_RETRIES = 3

const emptyToNull = (value?: string | null) => {
  const normalized = value?.trim()
  return normalized || null
}

const formatCurrency = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${currency} ${amount.toFixed(2)}`
  }
}

const getProductPriceLabel = (
  product: NewsletterCampaignWithProducts['products'][number]['product'],
) => {
  if (!product.variants.length) {
    return null
  }

  const lowestPriceVariant = [...product.variants].sort(
    (left, right) => Number(left.price) - Number(right.price),
  )[0]

  return `From ${formatCurrency(
    Number(lowestPriceVariant.price),
    lowestPriceVariant.currency,
  )}`
}

const getProductImage = (
  product: NewsletterCampaignWithProducts['products'][number]['product'],
) => product.images[0] || product.variants[0]?.images?.[0] || null

const buildTrackedProducts = (
  campaign: NewsletterCampaignWithProducts,
  trackingToken: string,
): NewsletterEmailProduct[] =>
  campaign.products.map(({ product }) => ({
    id: product.id,
    name: product.name,
    href: buildNewsletterClickUrl({
      token: trackingToken,
      url: `/shop/${product.slug}`,
      label: `product:${product.slug}`,
      productId: product.id,
    }),
    imageUrl: getProductImage(product),
    priceLabel: getProductPriceLabel(product),
  }))

const buildNewsletterEmailPayload = ({
  campaign,
  trackingToken,
  unsubscribeToken,
}: {
  campaign: NewsletterCampaignWithProducts
  trackingToken: string
  unsubscribeToken: string
}) => ({
  previewText: campaign.previewText,
  heading: campaign.heading,
  message: campaign.message,
  products: buildTrackedProducts(campaign, trackingToken),
  ctaLabel: campaign.ctaLabel,
  ctaHref: campaign.ctaUrl
    ? buildNewsletterClickUrl({
        token: trackingToken,
        url: campaign.ctaUrl,
        label: 'campaign-cta',
      })
    : null,
  unsubscribeUrl: buildNewsletterUnsubscribeUrl(unsubscribeToken),
  openTrackingUrl: buildNewsletterOpenUrl(trackingToken),
})

export async function subscribeEmailToNewsletter(
  input: NewsletterSubscriptionInput & {
    source?: NewsletterSubscriberSource
    userId?: string | null
  },
) {
  const email = normalizeNewsletterEmail(input.email)
  const existingUser = input.userId
    ? await prisma.user.findUnique({ where: { id: input.userId } })
    : await prisma.user.findUnique({ where: { email } })

  const firstName = emptyToNull(input.firstName) || existingUser?.firstName
  const lastName = emptyToNull(input.lastName) || existingUser?.lastName
  const userId = existingUser?.id || input.userId || null

  const subscriber = await prisma.newsletterSubscriber.upsert({
    where: { email },
    update: {
      firstName,
      lastName,
      status: NewsletterSubscriberStatus.SUBSCRIBED,
      source: input.source || NewsletterSubscriberSource.GUEST,
      subscribedAt: new Date(),
      unsubscribedAt: null,
      ...(userId ? { userId } : {}),
    },
    create: {
      email,
      firstName,
      lastName,
      status: NewsletterSubscriberStatus.SUBSCRIBED,
      source: input.source || NewsletterSubscriberSource.GUEST,
      subscribedAt: new Date(),
      ...(userId ? { userId } : {}),
    },
  })

  if (userId) {
    await prisma.user.update({
      where: { id: userId },
      data: { acceptsMarketing: true },
    })
  }

  return subscriber
}

export async function syncOptedInUsersToNewsletter() {
  const users = await prisma.user.findMany({
    where: { acceptsMarketing: true },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
    },
  })

  let synced = 0

  for (const user of users) {
    await subscribeEmailToNewsletter({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      source: NewsletterSubscriberSource.ADMIN_SYNC,
      userId: user.id,
    })
    synced += 1
  }

  return synced
}

export async function createNewsletterCampaign(input: NewsletterCampaignInput) {
  const uniqueProductIds = [...new Set(input.productIds)]
  const products = await prisma.product.findMany({
    where: {
      id: {
        in: uniqueProductIds,
      },
    },
    select: { id: true },
  })

  if (products.length !== uniqueProductIds.length) {
    throw new Error('One or more selected products could not be found.')
  }

  return prisma.newsletterCampaign.create({
    data: {
      name: input.name.trim(),
      subject: input.subject.trim(),
      previewText: emptyToNull(input.previewText),
      heading: input.heading.trim(),
      message: input.message.trim(),
      ctaLabel: emptyToNull(input.ctaLabel),
      ctaUrl: emptyToNull(input.ctaUrl),
      dailySendLimit: input.dailySendLimit || NEWSLETTER_DEFAULT_DAILY_LIMIT,
      products: {
        create: uniqueProductIds.map((productId, index) => ({
          productId,
          sortOrder: index,
        })),
      },
    },
    include: {
      products: {
        include: {
          product: {
            include: {
              variants: true,
              categories: true,
            },
          },
        },
        orderBy: {
          sortOrder: 'asc',
        },
      },
    },
  })
}

export async function getNewsletterAdminOverviewData(): Promise<NewsletterAdminOverview> {
  const [
    totalSubscribers,
    activeSubscribers,
    unsubscribedSubscribers,
    registeredSubscribers,
    guestSubscribers,
    totalCampaigns,
    draftCampaigns,
    queuedCampaigns,
    completedCampaigns,
    subscribers,
    campaigns,
  ] = await Promise.all([
    prisma.newsletterSubscriber.count(),
    prisma.newsletterSubscriber.count({
      where: { status: NewsletterSubscriberStatus.SUBSCRIBED },
    }),
    prisma.newsletterSubscriber.count({
      where: { status: NewsletterSubscriberStatus.UNSUBSCRIBED },
    }),
    prisma.newsletterSubscriber.count({
      where: { userId: { not: null } },
    }),
    prisma.newsletterSubscriber.count({
      where: { userId: null },
    }),
    prisma.newsletterCampaign.count(),
    prisma.newsletterCampaign.count({
      where: { status: NewsletterCampaignStatus.DRAFT },
    }),
    prisma.newsletterCampaign.count({
      where: { status: NewsletterCampaignStatus.QUEUED },
    }),
    prisma.newsletterCampaign.count({
      where: { status: NewsletterCampaignStatus.COMPLETED },
    }),
    prisma.newsletterSubscriber.findMany({
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    }),
    prisma.newsletterCampaign.findMany({
      include: {
        products: {
          include: {
            product: {
              include: {
                variants: true,
                categories: true,
              },
            },
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    }),
  ])

  return {
    subscriberStats: {
      total: totalSubscribers,
      active: activeSubscribers,
      unsubscribed: unsubscribedSubscribers,
      registered: registeredSubscribers,
      guests: guestSubscribers,
    },
    campaignStats: {
      total: totalCampaigns,
      drafts: draftCampaigns,
      queued: queuedCampaigns,
      completed: completedCampaigns,
    },
    subscribers,
    campaigns,
  }
}

export async function queueNewsletterCampaignById(campaignId: string) {
  const campaign = await prisma.newsletterCampaign.findUnique({
    where: { id: campaignId },
    select: { id: true, status: true },
  })

  if (!campaign) {
    throw new Error('Campaign not found.')
  }

  if (campaign.status !== NewsletterCampaignStatus.DRAFT) {
    throw new Error('Only draft campaigns can be queued.')
  }

  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: { status: NewsletterSubscriberStatus.SUBSCRIBED },
    select: { id: true },
  })

  if (!subscribers.length) {
    throw new Error('There are no subscribed recipients for this campaign.')
  }

  const now = new Date()

  await prisma.$transaction([
    prisma.newsletterDelivery.createMany({
      data: subscribers.map((subscriber) => ({
        campaignId,
        subscriberId: subscriber.id,
      })),
      skipDuplicates: true,
    }),
    prisma.newsletterCampaign.update({
      where: { id: campaignId },
      data: {
        status: NewsletterCampaignStatus.QUEUED,
        queuedAt: now,
        completedAt: null,
        recipientCount: subscribers.length,
        sentCount: 0,
        failedCount: 0,
        openedCount: 0,
        clickedCount: 0,
      },
    }),
  ])

  return subscribers.length
}

async function markCampaignCompleteIfDone(campaignId: string) {
  const pendingDeliveries = await prisma.newsletterDelivery.count({
    where: {
      campaignId,
      status: 'PENDING',
    },
  })

  if (pendingDeliveries === 0) {
    await prisma.newsletterCampaign.update({
      where: { id: campaignId },
      data: {
        status: NewsletterCampaignStatus.COMPLETED,
        completedAt: new Date(),
      },
    })
  }
}

type DeliveryWithSubscriber = Prisma.NewsletterDeliveryGetPayload<{
  include: { subscriber: true }
}>

async function deliverNewsletterEmail({
  campaign,
  delivery,
}: {
  campaign: NewsletterCampaignWithProducts
  delivery: DeliveryWithSubscriber
}) {
  const emailPayload = buildNewsletterEmailPayload({
    campaign,
    trackingToken: delivery.trackingToken,
    unsubscribeToken: delivery.subscriber.unsubscribeToken,
  })

  try {
    const { data, error } = await resend.emails.send({
      from: NEWSLETTER_FROM_EMAIL,
      to: delivery.subscriber.email,
      subject: campaign.subject,
      react: NewsletterEmail(emailPayload),
    })

    if (error) {
      await prisma.$transaction([
        prisma.newsletterDelivery.update({
          where: { id: delivery.id },
          data: {
            status: 'FAILED',
            errorMessage: error.message,
            retryCount: { increment: 1 },
          },
        }),
        prisma.newsletterCampaign.update({
          where: { id: campaign.id },
          data: {
            failedCount: { increment: 1 },
          },
        }),
      ])

      return false
    }

    await prisma.$transaction([
      prisma.newsletterDelivery.update({
        where: { id: delivery.id },
        data: {
          status: 'SENT',
          providerMessageId: data?.id || null,
          sentAt: new Date(),
          errorMessage: null,
        },
      }),
      prisma.newsletterCampaign.update({
        where: { id: campaign.id },
        data: {
          sentCount: { increment: 1 },
        },
      }),
    ])

    return true
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unexpected newsletter error'

    await prisma.$transaction([
      prisma.newsletterDelivery.update({
        where: { id: delivery.id },
        data: {
          status: 'FAILED',
          errorMessage,
          retryCount: { increment: 1 },
        },
      }),
      prisma.newsletterCampaign.update({
        where: { id: campaign.id },
        data: {
          failedCount: { increment: 1 },
        },
      }),
    ])

    return false
  }
}

export async function dispatchQueuedNewsletterBatch(
  globalLimit = NEWSLETTER_DEFAULT_DAILY_LIMIT,
): Promise<NewsletterDispatchSummary> {
  // Re-queue PROCESSING rows left behind by crashed runs (> 30 min old).
  const staleCutoff = new Date(Date.now() - 30 * 60 * 1000)
  await prisma.newsletterDelivery.updateMany({
    where: { status: 'PROCESSING', updatedAt: { lt: staleCutoff } },
    data: { status: 'PENDING' },
  })

  // Retry queue: FAILED deliveries with retries left go back to PENDING.
  await prisma.newsletterDelivery.updateMany({
    where: { status: 'FAILED', retryCount: { lt: NEWSLETTER_MAX_RETRIES } },
    data: { status: 'PENDING' },
  })

  const campaigns = await prisma.newsletterCampaign.findMany({
    where: {
      status: NewsletterCampaignStatus.QUEUED,
    },
    include: {
      products: {
        include: {
          product: {
            include: {
              variants: true,
              categories: true,
            },
          },
        },
        orderBy: {
          sortOrder: 'asc',
        },
      },
    },
    orderBy: [{ queuedAt: 'asc' }, { createdAt: 'asc' }],
  })

  let processed = 0
  let sent = 0
  let failed = 0
  let remainingLimit = globalLimit

  for (const campaign of campaigns) {
    if (remainingLimit <= 0) {
      break
    }

    // Enforce the per-day limit: only today's sends count against
    // dailySendLimit, so an hourly cron can't send 24x the configured limit.
    const startOfToday = new Date()
    startOfToday.setUTCHours(0, 0, 0, 0)
    const todaySent = await prisma.newsletterDelivery.count({
      where: {
        campaignId: campaign.id,
        status: 'SENT',
        sentAt: { gte: startOfToday },
      },
    })
    const campaignDailyLimit =
      campaign.dailySendLimit || NEWSLETTER_DEFAULT_DAILY_LIMIT
    const campaignLimit = Math.max(
      0,
      Math.min(remainingLimit, campaignDailyLimit - todaySent),
    )
    if (campaignLimit <= 0) {
      continue
    }

    // Atomically claim PENDING deliveries with FOR UPDATE SKIP LOCKED so two
    // concurrent dispatch runs (cron + admin button) never double-send.
    const claimed = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT "NewsletterDelivery".id
      FROM "NewsletterDelivery"
      JOIN "NewsletterSubscriber" s ON s.id = "NewsletterDelivery"."subscriberId"
      WHERE "NewsletterDelivery"."campaignId" = ${campaign.id}
        AND "NewsletterDelivery".status = 'PENDING'
        AND s.status = 'SUBSCRIBED'
      ORDER BY "NewsletterDelivery"."createdAt" ASC
      LIMIT ${campaignLimit}
      FOR UPDATE SKIP LOCKED
    `

    if (claimed.length === 0) {
      await markCampaignCompleteIfDone(campaign.id)
      continue
    }

    const claimIds = claimed.map((row) => row.id)
    await prisma.newsletterDelivery.updateMany({
      where: { id: { in: claimIds }, status: 'PENDING' },
      data: { status: 'PROCESSING' },
    })

    const deliveries = await prisma.newsletterDelivery.findMany({
      where: { id: { in: claimIds } },
      include: {
        subscriber: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    for (const delivery of deliveries) {
      const wasSent = await deliverNewsletterEmail({
        campaign,
        delivery,
      })

      processed += 1
      remainingLimit -= 1

      if (wasSent) {
        sent += 1
      } else {
        failed += 1
      }

      if (remainingLimit <= 0) {
        break
      }
    }

    await markCampaignCompleteIfDone(campaign.id)
  }

  const remaining = await prisma.newsletterDelivery.count({
    where: {
      status: 'PENDING',
      campaign: {
        status: NewsletterCampaignStatus.QUEUED,
      },
    },
  })

  return {
    processed,
    sent,
    failed,
    remaining,
  }
}

export async function unsubscribeNewsletterByToken(token: string) {
  const subscriber = await prisma.newsletterSubscriber.findUnique({
    where: { unsubscribeToken: token },
  })

  if (!subscriber) {
    throw new Error('We could not find that newsletter subscription.')
  }

  if (subscriber.status === NewsletterSubscriberStatus.UNSUBSCRIBED) {
    return subscriber
  }

  const pendingDeliveries = await prisma.newsletterDelivery.findMany({
    where: {
      subscriberId: subscriber.id,
      status: 'PENDING',
    },
    select: {
      campaignId: true,
    },
  })

  await prisma.$transaction([
    prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: {
        status: NewsletterSubscriberStatus.UNSUBSCRIBED,
        unsubscribedAt: new Date(),
      },
    }),
    prisma.newsletterDelivery.updateMany({
      where: {
        subscriberId: subscriber.id,
        status: 'PENDING',
      },
      data: {
        status: 'SKIPPED',
        errorMessage: 'Subscriber unsubscribed before send.',
      },
    }),
    ...(subscriber.userId
      ? [
          prisma.user.update({
            where: { id: subscriber.userId },
            data: { acceptsMarketing: false },
          }),
        ]
      : []),
  ])

  const affectedCampaignIds = [
    ...new Set(pendingDeliveries.map((item) => item.campaignId)),
  ]

  for (const campaignId of affectedCampaignIds) {
    await markCampaignCompleteIfDone(campaignId)
  }

  return prisma.newsletterSubscriber.findUnique({
    where: { id: subscriber.id },
  })
}

export async function recordNewsletterOpen(token: string) {
  const delivery = await prisma.newsletterDelivery.findUnique({
    where: { trackingToken: token },
    select: {
      id: true,
      campaignId: true,
      openedAt: true,
      openCount: true,
    },
  })

  if (!delivery) {
    return false
  }

  if (delivery.openedAt) {
    await prisma.newsletterDelivery.update({
      where: { id: delivery.id },
      data: {
        openCount: {
          increment: 1,
        },
      },
    })

    return true
  }

  await prisma.$transaction([
    prisma.newsletterDelivery.update({
      where: { id: delivery.id },
      data: {
        openedAt: new Date(),
        openCount: {
          increment: 1,
        },
      },
    }),
    prisma.newsletterCampaign.update({
      where: { id: delivery.campaignId },
      data: {
        openedCount: {
          increment: 1,
        },
      },
    }),
  ])

  return true
}

export async function recordNewsletterClick({
  token,
  url,
  signature,
  label,
  productId,
}: {
  token: string
  url: string
  signature: string
  label?: string | null
  productId?: string | null
}) {
  const normalizedUrl = resolveSiteUrl(url)

  if (
    !verifyTrackedNewsletterSignature({
      token,
      url: normalizedUrl,
      signature,
      label,
      productId,
    })
  ) {
    throw new Error('Invalid newsletter tracking signature.')
  }

  const delivery = await prisma.newsletterDelivery.findUnique({
    where: { trackingToken: token },
    select: {
      id: true,
      campaignId: true,
      subscriberId: true,
    },
  })

  if (!delivery) {
    throw new Error('Newsletter delivery not found.')
  }

  await prisma.$transaction([
    prisma.newsletterLinkClick.create({
      data: {
        deliveryId: delivery.id,
        campaignId: delivery.campaignId,
        subscriberId: delivery.subscriberId,
        productId: emptyToNull(productId),
        label: emptyToNull(label),
        url: normalizedUrl,
      },
    }),
    prisma.newsletterDelivery.update({
      where: { id: delivery.id },
      data: {
        clickedCount: {
          increment: 1,
        },
      },
    }),
    prisma.newsletterCampaign.update({
      where: { id: delivery.campaignId },
      data: {
        clickedCount: {
          increment: 1,
        },
      },
    }),
  ])

  return normalizedUrl
}

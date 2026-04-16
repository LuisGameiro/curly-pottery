'use server'

import {
  newsletterCampaignIdSchema,
  newsletterCampaignSchema,
  newsletterSubscriptionSchema,
  newsletterTokenSchema,
} from '@lib/form-validator'
import { authOptions } from '@lib/auth/authOptions'
import { ActionResponse, NewsletterAdminOverview } from '@lib/types/types'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import {
  createNewsletterCampaign,
  dispatchQueuedNewsletterBatch,
  getNewsletterAdminOverviewData,
  queueNewsletterCampaignById,
  subscribeEmailToNewsletter,
  syncOptedInUsersToNewsletter,
  unsubscribeNewsletterByToken,
} from '@lib/newsletter/service'

async function assertAdminAccess() {
  const session = await getServerSession(authOptions)

  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Unauthorized: Administrative privileges required.')
  }

  return session
}

export async function subscribeToNewsletter(
  rawInput: unknown,
): Promise<ActionResponse<{ email: string }>> {
  const validation = newsletterSubscriptionSchema.safeParse(rawInput)

  if (!validation.success) {
    return {
      success: false,
      message: 'Validation error',
      errors: z.flattenError(validation.error),
    }
  }

  try {
    const subscriber = await subscribeEmailToNewsletter(validation.data)

    return {
      success: true,
      message: 'You are subscribed to the newsletter.',
      data: {
        email: subscriber.email,
      },
    }
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Failed to subscribe email',
      errors: error,
    }
  }
}

export async function unsubscribeNewsletter(
  rawInput: unknown,
): Promise<ActionResponse<{ email: string }>> {
  const validation = newsletterTokenSchema.safeParse(rawInput)

  if (!validation.success) {
    return {
      success: false,
      message: 'Validation error',
      errors: z.flattenError(validation.error),
    }
  }

  try {
    const subscriber = await unsubscribeNewsletterByToken(validation.data.token)

    return {
      success: true,
      message: 'You have been unsubscribed from Curly Pottery newsletters.',
      data: {
        email: subscriber?.email || '',
      },
    }
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Failed to unsubscribe email',
      errors: error,
    }
  }
}

export async function getNewsletterAdminOverview(): Promise<
  ActionResponse<NewsletterAdminOverview>
> {
  try {
    await assertAdminAccess()

    const overview = await getNewsletterAdminOverviewData()

    return {
      success: true,
      message: 'Fetched newsletter overview successfully',
      data: overview,
    }
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Failed to load newsletter',
      errors: error,
    }
  }
}

export async function createNewsletterCampaignAction(
  rawInput: unknown,
): Promise<ActionResponse<{ id: string }>> {
  const validation = newsletterCampaignSchema.safeParse(rawInput)

  if (!validation.success) {
    return {
      success: false,
      message: 'Validation error',
      errors: z.flattenError(validation.error),
    }
  }

  try {
    await assertAdminAccess()
    const campaign = await createNewsletterCampaign(validation.data)

    revalidatePath('/admin/newsletter')

    return {
      success: true,
      message: 'Newsletter campaign created successfully.',
      data: { id: campaign.id },
    }
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Failed to create campaign',
      errors: error,
    }
  }
}

export async function queueNewsletterCampaignAction(
  rawInput: unknown,
): Promise<ActionResponse<{ recipients: number }>> {
  const validation = newsletterCampaignIdSchema.safeParse(rawInput)

  if (!validation.success) {
    return {
      success: false,
      message: 'Validation error',
      errors: z.flattenError(validation.error),
    }
  }

  try {
    await assertAdminAccess()
    const recipients = await queueNewsletterCampaignById(
      validation.data.campaignId,
    )

    revalidatePath('/admin/newsletter')

    return {
      success: true,
      message: `Campaign queued for ${recipients} subscribers.`,
      data: { recipients },
    }
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Failed to queue campaign',
      errors: error,
    }
  }
}

export async function runNewsletterDispatchAction(): Promise<
  ActionResponse<{
    processed: number
    sent: number
    failed: number
    remaining: number
  }>
> {
  try {
    await assertAdminAccess()
    const result = await dispatchQueuedNewsletterBatch()

    revalidatePath('/admin/newsletter')

    return {
      success: true,
      message: 'Newsletter batch processed successfully.',
      data: result,
    }
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Failed to dispatch batch',
      errors: error,
    }
  }
}

export async function syncNewsletterSubscribersAction(): Promise<
  ActionResponse<{ synced: number }>
> {
  try {
    await assertAdminAccess()
    const synced = await syncOptedInUsersToNewsletter()

    revalidatePath('/admin/newsletter')

    return {
      success: true,
      message: `Synced ${synced} opted-in users into the newsletter list.`,
      data: { synced },
    }
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Failed to sync subscribers',
      errors: error,
    }
  }
}

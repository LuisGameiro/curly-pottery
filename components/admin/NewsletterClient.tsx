'use client'

import { StatCard } from '@components/admin/StatCard'
import {
  Button,
  Container,
  Input,
  InputSearch,
  InputTextArea,
  Text,
} from '@components/ui'
import DataTable from '@components/ui/Table/DataTable'
import {
  createNewsletterCampaignAction,
  queueNewsletterCampaignAction,
  runNewsletterDispatchAction,
  syncNewsletterSubscribersAction,
} from '@actions/newsletter.actions'
import {
  NewsletterAdminOverview,
  ProductWithVariantsCategories,
} from '@lib/types/types'
import { PaginatedResult } from '@lib/pagination'
import {
  CheckCircle2,
  Clock3,
  Mail,
  MousePointerClick,
  RefreshCcw,
  Send,
  Sparkles,
  Users,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { type ComponentProps, useMemo, useState, useTransition } from 'react'
import { toast } from 'sonner'

type ComposerState = {
  name: string
  subject: string
  previewText: string
  heading: string
  message: string
  ctaLabel: string
  ctaUrl: string
  dailySendLimit: string
  productIds: string[]
}

const initialComposerState: ComposerState = {
  name: '',
  subject: '',
  previewText: '',
  heading: '',
  message: '',
  ctaLabel: '',
  ctaUrl: '',
  dailySendLimit: '50',
  productIds: [],
}

const formatDate = (value: Date | string | null | undefined) => {
  if (!value) {
    return 'Not scheduled'
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

const getFieldErrors = (errors: unknown) => {
  if (
    errors &&
    typeof errors === 'object' &&
    'fieldErrors' in errors &&
    typeof errors.fieldErrors === 'object'
  ) {
    return errors.fieldErrors as Record<string, string[] | undefined>
  }

  return {}
}

export default function NewsletterClient({
  overview,
  products,
}: Readonly<{
  overview: NewsletterAdminOverview
  products: PaginatedResult<ProductWithVariantsCategories>
}>) {
  const router = useRouter()
  const [subscriberSearch, setSubscriberSearch] = useState('')
  const [composer, setComposer] = useState<ComposerState>(initialComposerState)
  const [composerErrors, setComposerErrors] = useState<
    Record<string, string[] | undefined>
  >({})
  const [isPending, startTransition] = useTransition()

  const filteredSubscribers = useMemo(() => {
    if (!subscriberSearch.trim()) {
      return overview.subscribers
    }

    const searchValue = subscriberSearch.toLowerCase()

    return overview.subscribers.filter((subscriber) => {
      const fullName =
        `${subscriber.firstName || ''} ${subscriber.lastName || ''}`
          .trim()
          .toLowerCase()

      return (
        subscriber.email.toLowerCase().includes(searchValue) ||
        fullName.includes(searchValue)
      )
    })
  }, [overview.subscribers, subscriberSearch])

  const totalSentEmails = useMemo(
    () =>
      overview.campaigns.reduce(
        (total, campaign) => total + campaign.sentCount,
        0,
      ),
    [overview.campaigns],
  )

  const totalClicks = useMemo(
    () =>
      overview.campaigns.reduce(
        (total, campaign) => total + campaign.clickedCount,
        0,
      ),
    [overview.campaigns],
  )

  const handleComposerChange = (
    key: keyof ComposerState,
    value: string | string[],
  ) => {
    setComposer((current) => ({
      ...current,
      [key]: value,
    }))
  }

  const handleProductToggle = (productId: string) => {
    setComposer((current) => ({
      ...current,
      productIds: current.productIds.includes(productId)
        ? current.productIds.filter((id) => id !== productId)
        : [...current.productIds, productId],
    }))
  }

  const refreshWithToast = (message: string) => {
    toast(message)
    router.refresh()
  }

  const handleCreateCampaign = (
    event: Parameters<NonNullable<ComponentProps<'form'>['onSubmit']>>[0],
  ) => {
    event.preventDefault()

    setComposerErrors({})

    startTransition(async () => {
      const response = await createNewsletterCampaignAction({
        ...composer,
        dailySendLimit: Number(composer.dailySendLimit),
      })

      if (!response.success) {
        setComposerErrors(getFieldErrors(response.errors))
        toast(response.message)
        return
      }

      setComposer(initialComposerState)
      refreshWithToast(response.message)
    })
  }

  const handleQueueCampaign = (campaignId: string) => {
    startTransition(async () => {
      const response = await queueNewsletterCampaignAction({ campaignId })

      if (!response.success) {
        toast(response.message)
        return
      }

      refreshWithToast(response.message)
    })
  }

  const handleRunDispatch = () => {
    startTransition(async () => {
      const response = await runNewsletterDispatchAction()

      if (!response.success) {
        toast(response.message)
        return
      }

      refreshWithToast(
        `${response.message} Sent ${response.data.sent}, failed ${response.data.failed}, remaining ${response.data.remaining}.`,
      )
    })
  }

  const handleSyncSubscribers = () => {
    startTransition(async () => {
      const response = await syncNewsletterSubscribersAction()

      if (!response.success) {
        toast(response.message)
        return
      }

      refreshWithToast(response.message)
    })
  }

  const campaignColumns = [
    {
      header: 'Campaign',
      render: (campaign: NewsletterAdminOverview['campaigns'][number]) => (
        <div className="text-left">
          <div className="font-semibold">{campaign.name}</div>
          <div className="text-xs text-muted">{campaign.subject}</div>
        </div>
      ),
    },
    {
      header: 'Status',
      render: (campaign: NewsletterAdminOverview['campaigns'][number]) => (
        <span className="inline-flex rounded-full border border-border px-3 py-1 text-xs font-semibold">
          {campaign.status}
        </span>
      ),
    },
    {
      header: 'Products',
      render: (campaign: NewsletterAdminOverview['campaigns'][number]) =>
        campaign.products.length,
    },
    {
      header: 'Progress',
      render: (campaign: NewsletterAdminOverview['campaigns'][number]) => (
        <div className="text-sm">
          <div>
            {campaign.sentCount}/{campaign.recipientCount || 0} sent
          </div>
          <div className="text-xs text-muted">
            {campaign.openedCount} opens, {campaign.clickedCount} clicks
          </div>
        </div>
      ),
    },
    {
      header: 'Queued',
      render: (campaign: NewsletterAdminOverview['campaigns'][number]) =>
        formatDate(campaign.queuedAt),
    },
    {
      header: '@actions',
      render: (campaign: NewsletterAdminOverview['campaigns'][number]) => (
        <div className="flex justify-center">
          {campaign.status === 'DRAFT' ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleQueueCampaign(campaign.id)}
              disabled={isPending}
            >
              Queue
            </Button>
          ) : (
            <span className="text-xs text-muted">No action</span>
          )}
        </div>
      ),
    },
  ]

  const subscriberColumns = [
    {
      header: 'Subscriber',
      render: (subscriber: NewsletterAdminOverview['subscribers'][number]) => (
        <div className="text-left">
          <div className="font-semibold">{subscriber.email}</div>
          <div className="text-xs text-muted">
            {[subscriber.firstName, subscriber.lastName]
              .filter(Boolean)
              .join(' ') || 'Guest signup'}
          </div>
        </div>
      ),
    },
    {
      header: 'Source',
      render: (subscriber: NewsletterAdminOverview['subscribers'][number]) =>
        subscriber.source,
    },
    {
      header: 'Status',
      render: (subscriber: NewsletterAdminOverview['subscribers'][number]) =>
        subscriber.status,
    },
    {
      header: 'Linked account',
      render: (subscriber: NewsletterAdminOverview['subscribers'][number]) =>
        subscriber.user ? 'Registered user' : 'Guest',
    },
    {
      header: 'Subscribed',
      render: (subscriber: NewsletterAdminOverview['subscribers'][number]) =>
        formatDate(subscriber.subscribedAt),
    },
  ]

  return (
    <Container className="space-y-8">
      <header className="space-y-3">
        <Text variant="heading">Newsletter</Text>
        <Text variant="subHeading">
          Collect subscribers, compose product launches, and queue batched sends
          without leaving the admin.
        </Text>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="secondary"
            onClick={handleSyncSubscribers}
            disabled={isPending}
          >
            <RefreshCcw size={16} className="mr-2" /> Sync opted-in users
          </Button>
          <Button onClick={handleRunDispatch} disabled={isPending}>
            <Send size={16} className="mr-2" /> Run daily batch now
          </Button>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          label="Active Subscribers"
          value={overview.subscriberStats.active}
          icon={<Users className="text-secondary" size={20} />}
        />
        <StatCard
          label="Queued Campaigns"
          value={overview.campaignStats.queued}
          icon={<Clock3 className="text-amber" size={20} />}
        />
        <StatCard
          label="Emails Sent"
          value={totalSentEmails}
          icon={<Mail className="text-green" size={20} />}
        />
        <StatCard
          label="Tracked Clicks"
          value={totalClicks}
          icon={<MousePointerClick className="text-red" size={20} />}
        />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <Container variant="box" className="xl:col-span-3 space-y-5">
          <div>
            <Text variant="sectionHeading">Compose Campaign</Text>
            <Text variant="subHeading">
              Build a structured product newsletter and queue it when it is
              ready.
            </Text>
          </div>

          <form onSubmit={handleCreateCampaign} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Internal campaign name"
                value={composer.name}
                onChange={(event) =>
                  handleComposerChange('name', event.target.value)
                }
                error={composerErrors.name?.[0]}
              />
              <Input
                label="Email subject"
                value={composer.subject}
                onChange={(event) =>
                  handleComposerChange('subject', event.target.value)
                }
                error={composerErrors.subject?.[0]}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Preview text"
                value={composer.previewText}
                onChange={(event) =>
                  handleComposerChange('previewText', event.target.value)
                }
                error={composerErrors.previewText?.[0]}
              />
              <Input
                label="Headline"
                value={composer.heading}
                onChange={(event) =>
                  handleComposerChange('heading', event.target.value)
                }
                error={composerErrors.heading?.[0]}
              />
            </div>

            <InputTextArea
              label="Intro message"
              rows={7}
              value={composer.message}
              onChange={(event) =>
                handleComposerChange('message', event.target.value)
              }
              error={composerErrors.message?.[0]}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="CTA label"
                value={composer.ctaLabel}
                onChange={(event) =>
                  handleComposerChange('ctaLabel', event.target.value)
                }
                error={composerErrors.ctaLabel?.[0]}
              />
              <Input
                label="CTA URL or path"
                value={composer.ctaUrl}
                onChange={(event) =>
                  handleComposerChange('ctaUrl', event.target.value)
                }
                error={composerErrors.ctaUrl?.[0]}
              />
              <Input
                label="Daily send limit"
                type="number"
                min={1}
                max={500}
                value={composer.dailySendLimit}
                onChange={(event) =>
                  handleComposerChange('dailySendLimit', event.target.value)
                }
                error={composerErrors.dailySendLimit?.[0]}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Text variant="bold">Featured products</Text>
                <Text className="text-sm text-muted">
                  {composer.productIds.length} selected
                </Text>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-80 overflow-y-auto rounded-xl border border-border p-3">
                {products.items.map((product) => (
                  <label
                    key={product.id}
                    className="flex items-start gap-3 rounded-xl border border-border px-3 py-3 text-sm hover:bg-accent-2 transition-colors"
                  >
                    <input
                      type="checkbox"
                      aria-label={`Select ${product.name}`}
                      checked={composer.productIds.includes(product.id)}
                      onChange={() => handleProductToggle(product.id)}
                      className="mt-1 h-4 w-4"
                    />
                    <span>
                      <span className="block font-semibold">
                        {product.name}
                      </span>
                      <span className="block text-xs text-muted">
                        {product.slug}
                        {product.hide ? ' • hidden' : ''}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
              {composerErrors.productIds?.[0] ? (
                <Text variant="error">{composerErrors.productIds[0]}</Text>
              ) : null}
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isPending}>
                <Sparkles size={16} className="mr-2" />
                {isPending ? 'Creating...' : 'Create draft'}
              </Button>
            </div>
          </form>
        </Container>

        <Container variant="box" className="xl:col-span-2 space-y-4">
          <Text variant="sectionHeading">List Health</Text>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
              <span>Subscribed</span>
              <strong>{overview.subscriberStats.active}</strong>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
              <span>Unsubscribed</span>
              <strong>{overview.subscriberStats.unsubscribed}</strong>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
              <span>Registered customers</span>
              <strong>{overview.subscriberStats.registered}</strong>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
              <span>Guest signups</span>
              <strong>{overview.subscriberStats.guests}</strong>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-accent-2 p-4 text-sm leading-6 text-muted">
            <CheckCircle2 size={18} className="mb-3 text-green" />
            Queueing a campaign creates delivery rows for the current subscribed
            list. The daily batch runner then sends the next slice without going
            over the configured limit.
          </div>
        </Container>
      </section>

      <section className="space-y-4">
        <div>
          <Text variant="sectionHeading">Campaign History</Text>
          <Text variant="subHeading">
            Drafts can be queued. Queued campaigns keep sending through the
            capped batch runner until they complete.
          </Text>
        </div>
        <DataTable data={overview.campaigns} columns={campaignColumns} />
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <Text variant="sectionHeading">Subscribers</Text>
            <Text variant="subHeading">
              Showing {filteredSubscribers.length} of{' '}
              {overview.subscriberStats.active} active subscribers
            </Text>
          </div>
          <InputSearch
            placeholder="Search subscribers..."
            value={subscriberSearch}
            onValueChange={setSubscriberSearch}
          />
        </div>
        <DataTable data={filteredSubscribers} columns={subscriberColumns} />
      </section>
    </Container>
  )
}

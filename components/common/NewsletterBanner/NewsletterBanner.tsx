'use client'

import { subscribeToNewsletter } from '@actions/newsletter.actions'
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
} from 'react'
import { toast } from 'sonner'
import { X } from 'lucide-react'
import { useUser } from '@lib/hooks/useUser'
import { usePathname } from 'next/navigation'

const DISMISSAL_WINDOW_MS = 30 * 24 * 60 * 60 * 1000 // 30 days
const SUCCESS_DURATION_MS = 4000

const STORAGE_KEYS = {
  dismissedAt: 'newsletter-banner.dismissedAt',
  subscribedAt: 'newsletter-banner.subscribedAt',
} as const

type BannerState = 'signup' | 'success' | 'dismissed'

// Cached snapshot so useSyncExternalStore sees a stable value between renders.
// Invalidated when another tab changes storage, or on unmount (so SPA
// navigation re-reads the latest persisted state).
let cachedStoredState: BannerState | null = null

const readStoredState = (): BannerState => {
  if (cachedStoredState) return cachedStoredState
  if (typeof window === 'undefined') return 'signup'

  try {
    const subscribedAt =
      Number(window.localStorage.getItem(STORAGE_KEYS.subscribedAt)) || 0
    const dismissedAt =
      Number(window.localStorage.getItem(STORAGE_KEYS.dismissedAt)) || 0

    if (subscribedAt > 0) {
      cachedStoredState = 'dismissed'
    } else if (
      dismissedAt > 0 &&
      Date.now() - dismissedAt < DISMISSAL_WINDOW_MS
    ) {
      cachedStoredState = 'dismissed'
    } else {
      cachedStoredState = 'signup'
    }
  } catch {
    // Storage unavailable (e.g. private mode) - just show the banner
    cachedStoredState = 'signup'
  }

  return cachedStoredState
}

const subscribeToStorage = (callback: () => void) => {
  const onStorage = () => {
    cachedStoredState = null
    callback()
  }
  window.addEventListener('storage', onStorage)
  return () => window.removeEventListener('storage', onStorage)
}

const NewsletterBanner = () => {
  const pathname = usePathname()
  const { isAuthenticated, isLoading } = useUser()
  const [email, setEmail] = useState('')
  const [isPending, startTransition] = useTransition()
  const [state, setState] = useState<BannerState>('signup')
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Reads localStorage without hydration mismatches or a flash of the banner
  // for returning visitors (useSyncExternalStore re-renders before paint).
  const storedState = useSyncExternalStore(
    subscribeToStorage,
    readStoredState,
    () => 'signup',
  )
  const isDismissed = state === 'dismissed' || storedState === 'dismissed'

  useEffect(() => {
    return () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current)
      // Re-read persisted state if this component mounts again (SPA navigation
      // keeps modules alive, so the cached snapshot would otherwise go stale).
      cachedStoredState = null
    }
  }, [])

  const storeTimestamp = (key: string) => {
    try {
      window.localStorage.setItem(key, String(Date.now()))
    } catch {
      // Storage unavailable - the banner will simply show again next visit
    }
  }

  const stopDismissTimer = () => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current)
      dismissTimerRef.current = null
    }
  }

  const startDismissTimer = () => {
    stopDismissTimer()
    dismissTimerRef.current = setTimeout(
      () => setState('dismissed'),
      SUCCESS_DURATION_MS,
    )
  }

  const handleDismiss = () => {
    storeTimestamp(STORAGE_KEYS.dismissedAt)
    stopDismissTimer()
    setState('dismissed')
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    startTransition(async () => {
      const response = await subscribeToNewsletter({ email })

      if (!response.success) {
        toast.error(
          response.message === 'Validation error'
            ? 'Please enter a valid email address.'
            : response.message,
        )
        return
      }

      // Persist immediately so the banner never nags an existing subscriber,
      // even if they navigate away during the success state.
      storeTimestamp(STORAGE_KEYS.subscribedAt)
      setEmail('')
      setState('success')
      startDismissTimer()
    })
  }

  if (isLoading) return null
  if (isAuthenticated) return null
  if (pathname?.startsWith('/about') || pathname?.startsWith('/checkout')) {
    return null
  }
  if (isDismissed) return null

  if (state === 'success') {
    return (
      <section
        className="flex flex-row bg-secondary/10 border-b border-secondary/20 px-2"
        aria-label="Newsletter signup confirmation"
        onMouseEnter={stopDismissTimer}
        onMouseLeave={startDismissTimer}
      >
        <div className="relative w-full py-4 px-4 lg:px-8 flex flex-row items-center justify-center">
          <p role="status" className="text-sm font-medium text-center">
            Thanks for subscribing! Stay tuned for new pieces.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section
      className="relative bg-secondary/10 border-b border-secondary/20"
      aria-label="Newsletter"
      data-testid="newsletter-banner"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1.5 md:gap-6 py-2 md:py-2.5 pl-3 pr-12 sm:pl-4 md:pl-6 md:pr-16">
        <div className="flex items-center gap-2 min-w-0">
          <p
            id="newsletter-banner-heading"
            className="font-bold text-sm whitespace-nowrap shrink-0"
          >
            Be the first to know
          </p>
          <p className="hidden sm:block text-xs text-secondary/80">
            New pieces are on the way — get notified when they drop.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          aria-labelledby="newsletter-banner-heading"
          aria-busy={isPending}
          className="flex items-center gap-2 w-full md:w-auto"
        >
          <input
            id="newsletter-banner-email"
            type="email"
            name="email"
            required
            autoComplete="email"
            enterKeyHint="go"
            aria-label="Email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email"
            disabled={isPending}
            className="flex-1 min-w-0 h-10 md:w-44 md:flex-none px-3 text-base md:text-sm bg-background rounded-md focus:outline-hidden focus:ring-1 focus:ring-secondary"
            data-testid="newsletter-banner-email-input"
          />
          <button
            type="submit"
            disabled={isPending}
            className="h-10 px-4 shrink-0 text-sm bg-secondary text-background font-medium rounded-md hover:bg-secondary/90 transition-colors disabled:opacity-50 flex items-center justify-center whitespace-nowrap"
            data-testid="newsletter-banner-submit-btn"
          >
            {isPending ? 'Subscribing...' : 'Notify me'}
          </button>
        </form>
      </div>

      <button
        type="button"
        onClick={handleDismiss}
        className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center hover:bg-secondary/10 transition-colors z-50 rounded-md"
        aria-label="Dismiss newsletter banner"
      >
        <X
          size={18}
          className="text-secondary/60 hover:text-secondary transition-colors"
        />
      </button>
    </section>
  )
}

export default NewsletterBanner

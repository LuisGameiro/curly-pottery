'use client'

import { subscribeToNewsletter } from '@actions/newsletter.actions'
import { useState, useTransition, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import { X } from 'lucide-react'
import { useUser } from '@lib/hooks/useUser'
import { usePathname } from 'next/navigation'

const NewsletterBanner = () => {
  const pathname = usePathname()
  const { isAuthenticated, isLoading } = useUser()
  const [email, setEmail] = useState('')
  const [isPending, startTransition] = useTransition()
  const [state, setState] = useState<'signup' | 'success' | 'dismissed'>(
    'signup',
  )
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  if (isLoading) return null
  if (isAuthenticated) return null
  if (pathname?.startsWith('/about')) return null
  if (state === 'dismissed') return null

  if (state === 'success') {
    return (
      <section className="flex flex-row bg-secondary/10 border-b border-secondary/20 px-2">
        <div className="relative w-full py-4 px-4 lg:px-8 flex flex-row items-center justify-center">
          <span className="text-sm font-medium">
            Thanks for subscribing! Stay tuned for new pieces.
          </span>
        </div>
      </section>
    )
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    startTransition(async () => {
      const response = await subscribeToNewsletter({ email })

      if (!response.success) {
        toast(response.message)
        return
      }

      toast('You are on the list. New pieces will land in your inbox.')
      setEmail('')
      setState('success')
      timeoutRef.current = setTimeout(() => setState('dismissed'), 3000)
    })
  }

  return (
    <section
      className="relative bg-secondary/10 border-b border-secondary/20"
      data-testid="newsletter-banner"
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-1 md:gap-2 py-2 pl-2 pr-14 md:pr-14">
        <div className="flex flex-row md:contents items-center justify-around md:justify-normal gap-1 md:gap-2">
          <div className="font-bold text-sm whitespace-nowrap shrink-0 md:order-1">
            Be the first to know
          </div>
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-1 shrink min-w-0 md:order-3"
          >
            <input
              id="newsletter-banner-email"
              type="email"
              name="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              className="w-20 sm:w-28 md:w-34 px-1 sm:px-2 text-sm bg-background rounded-md focus:outline-hidden focus:ring-1 focus:ring-secondary h-8 min-w-0"
              data-testid="newsletter-banner-email-input"
            />
            <button
              type="submit"
              disabled={isPending}
              className="px-2 sm:px-3 text-xs sm:text-sm bg-secondary text-background font-medium rounded-md hover:bg-secondary/90 transition-colors disabled:opacity-50 h-8 flex items-center justify-center whitespace-nowrap shrink-0"
              data-testid="newsletter-banner-submit-btn"
            >
              {isPending ? 'Joining...' : 'Join'}
            </button>
          </form>
        </div>
        <span className="text-xs text-center md:text-left md:order-2">
          I am working on new pieces. Enter your email and I&apos;ll let you
          know when they drop.
        </span>
      </div>

      <button
        onClick={() => setState('dismissed')}
        className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center hover:bg-secondary/10 transition-colors z-50 rounded-md"
        aria-label="Close banner"
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

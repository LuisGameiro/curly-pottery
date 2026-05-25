'use client'

import { subscribeToNewsletter } from 'actions/newsletter.actions'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { X } from 'lucide-react'

const NewsletterBanner = () => {
  const [email, setEmail] = useState('')
  const [isPending, startTransition] = useTransition()
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

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
      setIsVisible(false)
    })
  }

  return (
    <section className="flex flex-row bg-secondary/10 border-b border-secondary/20 px-2">
      <div className="relative w-full py-1 px-4 lg:px-8 flex flex-row items-center justify-center gap-4">
        <div className="flex flex-col lg:flex-row items-center md:gap-2">
          <span className="font-bold text-sm">
            Be the first to know
          </span>
          <span className="text-xs">
I am working on new pieces. Enter your email and I&apos;ll let you know when they drop.
          </span>
        </div>

        <div className="flex items-center gap-4">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              id="newsletter-banner-email"
              type="email"
              name="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-2 text-sm w-34 bg-background rounded-md focus:outline-hidden focus:ring-1 focus:ring-secondary h-8"
            />
            <button
              type="submit"
              disabled={isPending}
              className="px-4 text-sm bg-secondary text-background font-medium rounded-md hover:bg-secondary/90 transition-colors disabled:opacity-50 h-8 flex items-center justify-center whitespace-nowrap"
            >
              {isPending ? 'Joining...' : 'Join'}
            </button>
          </form>


        </div>
      </div>

      <button
        onClick={() => setIsVisible(false)}
        className="md:right-1 hover:bg-secondary/10 transition-colors z-50 mb-4"
        aria-label="Close banner"
      >
        <X size={18} className="text-secondary/60 hover:text-secondary transition-colors" />
      </button>

    </section>
  )
}

export default NewsletterBanner

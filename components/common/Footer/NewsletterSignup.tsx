'use client'

import { subscribeToNewsletter } from '@actions/newsletter.actions'
import { Button, Text } from '@components/ui'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

const NewsletterSignup = () => {
  const [email, setEmail] = useState('')
  const [isPending, startTransition] = useTransition()

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
    })
  }

  return (
    <section className="rounded-3xl border border-on-primary/20 bg-white/8 p-5 backdrop-blur-sm">
      <Text className="text-on-primary font-bold text-lg">
        Pottery release notes
      </Text>
      <Text className="text-on-primary/80 mt-2 text-sm leading-6">
        Get first notice of new collections, glaze drops, and small-batch
        restocks.
      </Text>

      <form
        onSubmit={handleSubmit}
        className="mt-4 flex flex-col gap-3 sm:flex-row"
      >
        <label className="sr-only" htmlFor="newsletter-email">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          name="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="min-w-0 flex-1 rounded-full border border-on-primary/30 bg-white/10 px-4 py-3 text-sm text-on-primary outline-none transition focus:border-on-primary focus:bg-white/15 placeholder:text-on-primary/55"
        />
        <Button
          type="submit"
          variant="secondary"
          className="whitespace-nowrap"
          disabled={isPending}
        >
          {isPending ? 'Joining...' : 'Join newsletter'}
        </Button>
      </form>
    </section>
  )
}

export default NewsletterSignup

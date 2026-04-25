'use client'

import { subscribeToNewsletter } from 'actions/newsletter.actions'
import { Button, Text } from '@components/ui'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import s from './NewsletterBanner.module.css'

const NewsletterBanner = () => {
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
    <section className={s.banner}>
      <div className={s.content}>
        <div className={s.text}>
          <Text variant="sectionHeading" className={s.heading}>
            Be the first to know
          </Text>
          <Text className={s.subtitle}>
            I am working on new pieces. Enter your email below and stay close.
          </Text>
        </div>

        <form
          onSubmit={handleSubmit}
          className={s.form}
        >
          <label className="sr-only" htmlFor="newsletter-banner-email">
            Email address
          </label>
          <input
            id="newsletter-banner-email"
            type="email"
            name="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email"
            className={s.input}
          />
          <Button
            type="submit"
            variant="secondary"
            disabled={isPending}
          >
            {isPending ? 'Joining...' : 'Join'}
          </Button>
        </form>
      </div>
    </section>
  )
}

export default NewsletterBanner
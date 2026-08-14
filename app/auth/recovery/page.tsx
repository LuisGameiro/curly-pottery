'use client'

import { useState } from 'react'
import { Container, Text, Button, Input } from '@components/ui'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { sendResetEmail } from '@actions/email.actions'
import { z } from 'zod'

export default function RecoveryForm() {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email')

    const emailValidation = z.string().email().safeParse(email)
    if (!emailValidation.success) {
      toast.error('Please enter a valid email address.')
      setLoading(false)
      return
    }
    try {
      const result = await sendResetEmail(emailValidation.data)
      if (!result.success) {
        toast.error(result.message)
        setLoading(false)
        return
      }

      setSubmitted(true)
      toast.success('Reset link sent to your email')
    } catch {
      console.error('Error sending reset email')
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container className="px-4 py-6 sm:px-10 sm:py-10">
      <header className="text-center mb-8 justify-center">
        <Text variant="heading">Reset Password</Text>
        <Text variant="subHeading">
          Enter your email and we will send you a link to get back into your
          account.
        </Text>
      </header>

      <main className="md:max-w-lg mx-auto">
        {!submitted ? (
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
            data-testid="recovery-form"
          >
            <Input
              name="email"
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              required
              data-testid="recovery-email-input"
            />
            <Button
              className="mt-12"
              type="submit"
              width="100%"
              loading={loading}
              data-testid="recovery-submit-btn"
            >
              Send Reset Link
            </Button>
          </form>
        ) : (
          <div
            className="text-center p-6 border rounded-xl bg-accent-1"
            data-testid="recovery-success-message"
          >
            <Text className="mb-4">
              If an account exists for that email, you will receive a reset link
              shortly.
            </Text>
            <Button variant="secondary" onClick={() => setSubmitted(false)}>
              Try a different email
            </Button>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            href="/auth/login"
            className="text-sm font-bold text-secondary hover:underline inline-flex items-center"
            data-testid="recovery-back-link"
          >
            <ArrowLeft size={16} className="mr-2" /> Back to Login
          </Link>
        </div>
      </main>
    </Container>
  )
}

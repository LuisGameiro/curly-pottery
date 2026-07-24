'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Container, Text, Button, Input } from '@components/ui'
import { CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { resetPassword } from '@actions/email.actions'

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()

  const token = searchParams.get('token')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const password = watch('password')

  const onSubmit = async (data: {
    password: string
    confirmPassword: string
  }) => {
    if (!token) {
      toast.error('Missing reset token.')
      return
    }

    setLoading(true)
    try {
      const result = await resetPassword({
        token: token,
        newPassword: data.password,
      })

      if (result.success) {
        setIsSuccess(true)
        toast.success('Password updated successfully!')
        setTimeout(() => router.push('/auth/login'), 3000)
      } else {
        toast.error(result.message || 'Invalid or expired token.')
      }
    } catch {
      toast.error('An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  if (!token)
    return (
      <div data-testid="reset-password-invalid-token">
        <Container className="px-4 py-6 sm:px-10 sm:py-10 text-center">
          <Text variant="heading">Invalid Link</Text>
          <Text>This password reset link is invalid or has expired.</Text>
        </Container>
      </div>
    )

  if (isSuccess)
    return (
      <div data-testid="reset-password-success-message">
        <Container className="px-4 py-6 sm:px-10 sm:py-10 text-center space-y-4">
          <div className="flex justify-center text-green">
            <CheckCircle2 size={48} />
          </div>
          <Text variant="heading">Password Changed!</Text>
          <Text>
            Your password has been updated. Redirecting you to login...
          </Text>
          <Button onClick={() => router.push('/auth/login')}>
            Go to Login
          </Button>
        </Container>
      </div>
    )

  return (
    <Container className="px-4 py-6 sm:px-10 sm:py-10 max-w-lg mx-auto">
      <header className="mb-8 text-center">
        <Text variant="heading">Set New Password</Text>
        <Text variant="subHeading">
          Choose a strong password for your account.
        </Text>
      </header>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
        data-testid="reset-password-form"
      >
        <Input
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 8, message: 'Minimum 8 characters' },
          })}
          label="New Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          data-testid="reset-password-new-input"
        />

        <Input
          {...register('confirmPassword', {
            validate: (value) => value === password || 'Passwords do not match',
          })}
          label="Confirm New Password"
          type="password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          data-testid="reset-password-confirm-input"
        />

        <Button
          type="submit"
          width="100%"
          loading={loading}
          data-testid="reset-password-submit-btn"
        >
          Update Password
        </Button>
      </form>
    </Container>
  )
}

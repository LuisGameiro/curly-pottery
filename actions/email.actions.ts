'use server'

import { hashPassword } from '@lib/auth/password'
import { z } from 'zod'

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Za-z]/, 'Password must contain at least one letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
import { headers } from 'next/headers'
import { checkRateLimit, getRateLimitKey } from '@lib/rate-limit'
import ResetPasswordEmail from '@lib/emails/ResetPasswordEmail'
import { ActionResponse } from '@lib/types/types'
import { prisma } from 'prisma/prisma'
import { ReactNode } from 'react'
import { CreateEmailResponseSuccess, Resend } from 'resend'
import * as Sentry from '@sentry/nextjs'
import { toClientMessage } from '@lib/errors'

const sendEmailSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1).max(200),
  body: z.any(),
})

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail({
  to,
  subject,
  body,
}: {
  to: string
  subject: string
  body: ReactNode
}): Promise<ActionResponse<CreateEmailResponseSuccess>> {
  const validation = sendEmailSchema.safeParse({ to, subject, body })
  if (!validation.success) {
    return {
      success: false,
      message: 'Validation error',
      errors: z.flattenError(validation.error),
    }
  }

  // Transactional email relay (checkout confirmations, contact form) is
  // intentionally NOT admin-only, so it must be rate-limited per IP and use a
  // fixed sender to prevent it becoming a spam relay.
  const headersList = await headers()
  const ip =
    headersList.get('x-forwarded-for')?.split(',')[0] ??
    headersList.get('x-real-ip') ??
    'unknown'
  try {
    const rateResult = await checkRateLimit(
      getRateLimitKey(ip, 'transactional-email'),
      { windowMs: 60 * 1000, maxRequests: 10 },
    )
    if (!rateResult.success) {
      return {
        success: false,
        message: 'Too many requests. Please try again later.',
      }
    }
  } catch {
    return {
      success: false,
      message: 'Email service temporarily unavailable.',
    }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Curly Pottery <noreply@curlypottery.com>',
      to: validation.data.to,
      subject: validation.data.subject,
      react: body,
    })

    if (error) {
      return { success: false, message: error.message }
    }

    return {
      success: true,
      message: 'Email sent successfully!',
      data: data,
    }
  } catch (error) {
    console.error('sendEmail_ERROR:', error)
    Sentry.captureException(error)
    return {
      success: false,
      message: 'Failed to send email',
      errors: error,
    }
  }
}
export async function sendResetEmail(
  email: string,
): Promise<ActionResponse<null>> {
  const headersList = await headers()
  const ip =
    headersList.get('x-forwarded-for')?.split(',')[0] ??
    headersList.get('x-real-ip') ??
    'unknown'
  let rateResult: { success: boolean; remaining: number; resetIn: number }
  try {
    rateResult = await checkRateLimit(getRateLimitKey(ip, 'password-reset'), {
      windowMs: 60 * 1000,
      maxRequests: 2,
    })
  } catch {
    // Fail closed: if the rate limiter is unavailable, don't process.
    return {
      success: false,
      message: 'Service temporarily unavailable. Please try again later.',
    }
  }
  if (!rateResult.success) {
    return {
      success: false,
      message: 'Too many requests. Please try again later.',
    }
  }

  const emailValidation = z.string().email().safeParse(email)
  if (!emailValidation.success) {
    return {
      success: false,
      message: 'Invalid email address',
    }
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user)
      return {
        success: false,
        message:
          'If an account with that email exists, a password reset link has been sent.',
      }

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    if (user.resetTokenExpiry && user.resetTokenExpiry > fiveMinutesAgo) {
      return {
        success: false,
        message: 'Please wait a few minutes before requesting another link.',
      }
    }

    const token = crypto.randomUUID()
    const expires = new Date(Date.now() + 3600000)

    await prisma.user.update({
      where: { email },
      data: {
        resetToken: token,
        resetTokenExpiry: expires,
      },
    })

    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`

    await resend.emails.send({
      from: 'Curly Pottery <noreply@curlypottery.com>',
      to: email,
      subject: 'Reset your password',
      react: ResetPasswordEmail({
        userFirstName: user.firstName,
        resetPasswordLink: resetLink,
      }),
    })
    return {
      success: true,
      message: 'Email sent successfully!',
      data: null,
    }
  } catch (error) {
    return { success: false, message: 'Failed to send email', errors: error }
  }
}

export async function resetPassword({
  token,
  newPassword,
}: {
  token: string
  newPassword: string
}): Promise<ActionResponse<null>> {
  const headersList = await headers()
  const ip =
    headersList.get('x-forwarded-for')?.split(',')[0] ??
    headersList.get('x-real-ip') ??
    'unknown'
  let rateResult: { success: boolean; remaining: number; resetIn: number }
  try {
    rateResult = await checkRateLimit(getRateLimitKey(ip, 'reset-password'), {
      windowMs: 60 * 1000,
      maxRequests: 5,
    })
  } catch {
    // Fail closed: if the rate limiter is unavailable, don't process.
    return {
      success: false,
      message: 'Service temporarily unavailable. Please try again later.',
    }
  }
  if (!rateResult.success) {
    return {
      success: false,
      message: 'Too many requests. Please try again later.',
    }
  }

  if (!token || typeof token !== 'string' || token.length < 10) {
    return { success: false, message: 'Invalid reset token' }
  }

  try {
    const passwordValidation = passwordSchema.safeParse(newPassword)
    if (!passwordValidation.success) {
      return {
        success: false,
        message:
          passwordValidation.error.issues[0]?.message || 'Invalid password',
      }
    }

    const hashedPassword = await hashPassword(newPassword)

    const updatedUser = await prisma.user.updateMany({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    })
    if (updatedUser.count === 0) {
      return {
        success: false,
        message: 'Invalid or expired reset token.',
        errors: null,
      }
    }

    return {
      success: true,
      message: 'Password reset successfully',
      data: null,
    }
  } catch (error) {
    return {
      success: false,
      message: toClientMessage(error, 'A database error occurred'),
      errors: error,
    }
  }
}

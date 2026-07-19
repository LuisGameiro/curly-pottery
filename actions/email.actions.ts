'use server'

import { hashPassword } from '@lib/auth/password'
import { getServerSession } from 'next-auth'
import { authOptions } from '@lib/auth/authOptions'
import { z } from 'zod'

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Za-z]/, 'Password must contain at least one letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
import ResetPasswordEmail from '@lib/emails/ResetPasswordEmail'
import { ActionResponse } from '@lib/types/types'
import { prisma } from 'prisma/prisma'
import { ReactNode } from 'react'
import { CreateEmailResponseSuccess, Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail({
  to,
  subject,
  body,
  from = 'onboarding@resend.dev',
}: {
  to: string
  subject: string
  body: ReactNode
  from?: string
}): Promise<ActionResponse<CreateEmailResponseSuccess>> {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'ADMIN') {
      return {
        success: false,
        message: 'Unauthorized: Administrative privileges required.',
      }
    }

    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
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
    return {
      success: false,
      message: 'Failed to send email',
      errors: error,
    }
  }
}
export async function sendResetEmail(
  email: string,
): Promise<ActionResponse<CreateEmailResponseSuccess>> {
  try {
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user)
      return {
        success: false,
        message: 'User not found',
        errors: new Error('User not found'),
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
      data: { id: token },
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
  try {
    const passwordValidation = passwordSchema.safeParse(newPassword)
    if (!passwordValidation.success) {
      return {
        success: false,
        message: passwordValidation.error.issues[0]?.message || 'Invalid password',
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
      message:
        error instanceof Error ? error.message : 'A database error occurred',
      errors: error,
    }
  }
}

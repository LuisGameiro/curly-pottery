'use server'

import { hashPassword } from '@lib/auth/password'
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
  from = 'noreply@curlypottery.com',
}: {
  to: string
  subject: string
  body: ReactNode
  from?: string
}): Promise<ActionResponse<CreateEmailResponseSuccess>> {
  try {
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
    return {
      success: false,
      message: 'Failed to send email',
      errors: error,
    }
  }
}
export async function sendResetEmail(email: string) {
  const user = await prisma.user.findUnique({ where: { email } })

  if (!user) return { error: 'User not found' }

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

  try {
    await resend.emails.send({
      from: 'Curly Pottery <noreply@curlypottery.com>',
      to: email,
      subject: 'Reset your password',
      react: ResetPasswordEmail({
        userFirstname: user.firstName,
        resetPasswordLink: resetLink,
      }),
    })
    return { success: true }
  } catch {
    return { error: 'Failed to send email' }
  }
}

export async function resetPassword(
  email: string,
  newPassword: string,
): Promise<ActionResponse<null>> {
  try {
    const hashedPassword = await hashPassword(newPassword)

    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    })

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

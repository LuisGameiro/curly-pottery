'use server'

import { z } from 'zod'
import { hashPassword } from '@lib/auth/password'
import { prisma } from 'prisma/prisma'
import { ActionResponse } from '@lib/types/types'

const registerSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  acceptsMarketing: z.boolean().default(false),
})

export async function registerUser(
  formData: FormData,
): Promise<ActionResponse<null>> {
  const rawData = Object.fromEntries(formData.entries())

  const validation = registerSchema.safeParse({
    ...rawData,
    acceptsMarketing: rawData.acceptsMarketing === 'on',
  })

  if (!validation.success) {
    return {
      success: false,
      message: 'Validation error',
      errors: validation.error.message,
    }
  }

  try {
    const { email, password, firstName, lastName, phone, acceptsMarketing } =
      validation.data

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return {
        success: false,
        message: 'User already exists',
        errors: 'User already exists',
      }
    }

    await prisma.user.create({
      data: {
        email,
        password: await hashPassword(password),
        firstName,
        lastName,
        phone,
        acceptsMarketing,
        emailVerified: new Date(),
        role: 'USER',
      },
    })

    return {
      success: true,
      message: 'User registered successfully',
      data: null,
    }
  } catch (error) {
    console.error('Registration error:', error)
    return {
      success: false,
      message: 'Internal server error',
      errors:
        error instanceof Error ? error.message : 'An unknown error occurred',
    }
  }
}

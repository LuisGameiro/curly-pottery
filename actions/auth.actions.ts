'use server'

// TODO : Replace with with promise types

import { z } from 'zod'
import { hashPassword } from '@lib/auth/password'
import { prisma } from 'prisma/prisma'

const registerSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  acceptsMarketing: z.boolean().default(false),
})

export async function registerUser(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries())

  const validation = registerSchema.safeParse({
    ...rawData,
    acceptsMarketing: rawData.acceptsMarketing === 'on',
  })

  if (!validation.success) {
    return { error: validation.error.message }
  }

  try {
    const { email, password, firstName, lastName, phone, acceptsMarketing } =
      validation.data

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return { error: 'User already exists' }
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

    return { success: true }
  } catch (error) {
    console.error('Registration error:', error)
    return { error: 'Internal server error' }
  }
}

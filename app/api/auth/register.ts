import { prisma } from 'prisma/prisma'
import { z } from 'zod'
import { NextApiRequest, NextApiResponse } from 'next'
import { hashPassword } from '@lib/auth/password'
import { checkRateLimit, getRateLimitKey } from '@lib/rate-limit'

const registerSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    password2: z.string(),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phone: z.string().optional(),
    acceptsMarketing: z.boolean().default(false),
  })
  .refine((data) => data.password === data.password2, {
    message: 'Passwords do not match',
    path: ['password2'],
  })
  .transform(({ password2, ...data }) => data)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const clientIp = req.headers['x-forwarded-for']?.toString().split(',')[0] 
    || req.socket?.remoteAddress 
    || 'unknown'
  const rateKey = getRateLimitKey(clientIp, 'register')
  const rateLimit = checkRateLimit(rateKey)

  res.setHeader('X-RateLimit-Limit', '5')
  res.setHeader('X-RateLimit-Remaining', rateLimit.remaining.toString())
  res.setHeader('X-RateLimit-Reset', Math.ceil(rateLimit.resetIn / 1000).toString())

  if (!rateLimit.success) {
    return res.status(429).json({ 
      error: 'Too many registration attempts. Please try again later.',
      retryAfter: Math.ceil(rateLimit.resetIn / 1000)
    })
  }

  try {
    const body = req.body
    const validation = registerSchema.safeParse(body)
    if (!validation.success) {
      return res.status(400).json({
        error: validation.error.message[0],
      })
    }

    const { email, password, firstName, lastName, phone, acceptsMarketing } =
      validation.data

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' })
    }

    const customer = await prisma.user.create({
      data: {
        email,
        password: await hashPassword(password),
        firstName,
        lastName,
        phone,
        acceptsMarketing: !!acceptsMarketing,
        emailVerified: new Date(),
        role: 'USER',
      },
    })

    const { password: _, ...customerWithoutPassword } = customer

    return res.status(201).json({
      message: 'User created successfully',
      user: customerWithoutPassword,
    })
  } catch (error) {
    console.error('Registration error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

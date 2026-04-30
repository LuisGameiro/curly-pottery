import { prisma } from 'prisma/prisma'
import { z } from 'zod'
import { NextResponse } from 'next/server'
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
  .refine((data) => data.password2 === data.password, {
    message: 'Passwords do not match',
    path: ['password2'],
  })
  .transform(({ password2: _password2, ...data }) => data)

export async function POST(req: Request) {
  const clientIp =
    req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'

  const rateKey = getRateLimitKey(clientIp, 'register')
  const rateLimit = checkRateLimit(rateKey)

  const headers = new Headers({
    'X-RateLimit-Limit': '5',
    'X-RateLimit-Remaining': rateLimit.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(rateLimit.resetIn / 1000).toString(),
  })

  if (!rateLimit.success) {
    return NextResponse.json(
      {
        error: 'Too many registration attempts. Please try again later.',
        retryAfter: Math.ceil(rateLimit.resetIn / 1000),
      },
      { status: 429, headers },
    )
  }

  try {
    const body = await req.json()
    const validation = registerSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: validation.error.issues[0]?.message || 'Invalid input',
        },
        { status: 400, headers },
      )
    }

    const { email, password, firstName, lastName, phone, acceptsMarketing } =
      validation.data

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      // Return a generic message to prevent user enumeration
      return NextResponse.json(
        { error: 'If the email is valid, an account has been created' },
        { status: 400, headers },
      )
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

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: customerWithoutPassword,
      },
      { status: 201, headers },
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers },
    )
  }
}

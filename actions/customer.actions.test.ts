import { UserWithOrdersAddress } from '@lib/types/types'
import {
  getAllCustomers,
  registerUser,
  updateNotes,
  updateUser,
} from './customer.actions'
import { prisma } from 'prisma/prisma'

jest.mock('prisma/prisma', () => ({
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  prisma: require('jest-mock-extended').mockDeep(),
}))

import { auth } from '@/auth'

describe('getAllCustomers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(auth as jest.Mock).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    })
  })

  it('should return all customers successfully', async () => {
    const mockUsers = [
      { id: '1', createdAt: new Date(), orders: [] },
      { id: '2', createdAt: new Date(), orders: [] },
    ]

    ;(prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers)

    const result = await getAllCustomers()

    expect(result.success).toBe(true)
    expect(result.message).toBe('Fetched all user successfully')
    expect(result.data).toEqual(mockUsers)
    expect(prisma.user.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: 'desc' },
      include: { orders: true },
    })
  })

  it('should return empty array when no customers exist', async () => {
    ;(prisma.user.findMany as jest.Mock).mockResolvedValue([])

    const result = await getAllCustomers()

    expect(result.success).toBe(true)
    expect(result.data).toEqual([])
  })

  it('should handle database errors', async () => {
    const mockError = new Error('Database connection failed')
    ;(prisma.user.findMany as jest.Mock).mockRejectedValue(mockError)

    const result = await getAllCustomers()

    expect(result.success).toBe(false)
    expect(result.message).toBe('Database connection failed')
    expect(result.errors).toEqual(mockError)
  })

  it('should handle non-Error exceptions', async () => {
    ;(prisma.user.findMany as jest.Mock).mockRejectedValue('Unknown error')

    const result = await getAllCustomers()

    expect(result.success).toBe(false)
    expect(result.message).toBe('A database error occurred')
  })
})

describe('updateNotes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(auth as jest.Mock).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    })
  })

  it('should update user notes successfully', async () => {
    const mockUser = { id: '1', notes: 'Updated notes' }
    ;(prisma.user.update as jest.Mock).mockResolvedValue(mockUser)

    const result = await updateNotes('1', 'Updated notes')

    expect(result.success).toBe(true)
    expect(result.message).toBe('User note updated successfully')
    expect(result.data).toEqual(mockUser)
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { notes: 'Updated notes' },
    })
  })

  it('should handle database errors', async () => {
    const mockError = new Error('Database update failed')
    ;(prisma.user.update as jest.Mock).mockRejectedValue(mockError)

    const result = await updateNotes('1', 'Updated notes')

    expect(result.success).toBe(false)
    expect(result.message).toBe('Database update failed')
    expect(result.errors).toEqual(mockError)
  })

  it('should handle non-Error exceptions', async () => {
    ;(prisma.user.update as jest.Mock).mockRejectedValue('Unknown error')

    const result = await updateNotes('1', 'Updated notes')

    expect(result.success).toBe(false)
    expect(result.message).toBe('A database error occurred')
  })
})
describe('updateUser', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(auth as jest.Mock).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    })
  })

  it('should update user successfully with addresses', async () => {
    const mockUser = { id: '1', firstName: 'John Doe' }
    const mockData = {
      firstName: 'John Doe',
      addresses: [
        {
          address: '123 Main St',
          city: 'London',
          postalCode: 'SW1A 1AA',
          country: 'UK',
        },
      ],
    } as unknown as UserWithOrdersAddress
    ;(prisma.user.update as jest.Mock).mockResolvedValue(mockUser)

    const result = await updateUser({ id: mockUser.id, data: mockData })

    expect(result.success).toBe(true)
    expect(result.message).toBe('User updated successfully')
    expect(result.data).toEqual(mockUser)
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: {
        firstName: 'John Doe',
        addresses: {
          deleteMany: {},
          create: [
            {
              address: '123 Main St',
              city: 'London',
              postalCode: 'SW1A 1AA',
              country: 'UK',
            },
          ],
        },
      },
    })
  })

  it('should default country to United Kingdom when not provided', async () => {
    const mockUser = { id: '1', firstName: 'Jane Doe' }
    const mockData = {
      id: '1',
      firstName: 'Jane Doe',
      orders: [],
      addresses: [
        {
          address: '456 Oak Ave',
          city: 'Manchester',
          postalCode: 'M1 1AA',
          country: null,
        },
      ],
    } as unknown as UserWithOrdersAddress
    ;(prisma.user.update as jest.Mock).mockResolvedValue(mockUser)

    await updateUser({ id: mockData.id, data: mockData })

    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          addresses: expect.objectContaining({
            create: expect.arrayContaining([
              expect.objectContaining({ country: 'United Kingdom' }),
            ]),
          }),
        }),
      }),
    )
  })

  it('should handle database errors', async () => {
    const mockError = new Error('Database update failed')
    ;(prisma.user.update as jest.Mock).mockRejectedValue(mockError)

    const result = await updateUser({
      id: '1',
      data: {
        firstName: 'John Doe',
        orders: [],
        addresses: [],
      } as unknown as UserWithOrdersAddress,
    })

    expect(result.success).toBe(false)
    expect(result.message).toBe('Database update failed')
    expect(result.errors).toEqual(mockError)
  })

  it('should handle non-Error exceptions', async () => {
    ;(prisma.user.update as jest.Mock).mockRejectedValue('Unknown error')

    const result = await updateUser({
      id: '1',
      data: {
        firstName: 'John Doe',
        orders: [],
        addresses: [],
      } as unknown as UserWithOrdersAddress,
    })

    expect(result.success).toBe(false)
    expect(result.message).toBe('A database error occurred')
  })
})

describe('registerUser', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should register a user successfully', async () => {
    const formData = new FormData()
    formData.append('email', 'test@example.com')
    formData.append('password', 'Password123!')
    formData.append('firstName', 'John')
    formData.append('lastName', 'Doe')
    formData.append('phone', '1234567890')
    formData.append('acceptsMarketing', 'on')
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
    ;(prisma.user.create as jest.Mock).mockResolvedValue({
      email: 'test@example.com',
    })

    const result = await registerUser(formData)

    expect(result.success).toBe(true)
    expect(result.message).toBe('User registered successfully')
    expect(result.data).toBeNull()
    expect(prisma.user.create).toHaveBeenCalled()
  })

  it('should return validation error for invalid data', async () => {
    const formData = new FormData()
    formData.append('email', 'invalid-email')
    formData.append('password', '123')

    const result = await registerUser(formData)

    expect(result.success).toBe(false)
    expect(result.message).toBe('Validation error')
  })

  it('should return error if user already exists', async () => {
    const formData = new FormData()
    formData.append('email', 'existing@example.com')
    formData.append('password', 'Password123!')
    formData.append('firstName', 'Jane')
    formData.append('lastName', 'Doe')
    formData.append('phone', '0987654321')
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
      email: 'existing@example.com',
    })

    const result = await registerUser(formData)

    expect(result.success).toBe(false)
    expect(result.message).toBe('User already exists')
    expect(prisma.user.create).not.toHaveBeenCalled()
  })

  it('should handle database errors during user creation', async () => {
    const formData = new FormData()
    formData.append('email', 'test@example.com')
    formData.append('password', 'Password123!')
    formData.append('firstName', 'John')
    formData.append('lastName', 'Doe')
    formData.append('phone', '1234567890')
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
    ;(prisma.user.create as jest.Mock).mockRejectedValue(
      new Error('Database error'),
    )

    const result = await registerUser(formData)

    expect(result.success).toBe(false)
    expect(result.message).toBe('Internal server error')
  })

  it('should handle acceptsMarketing as false when not provided', async () => {
    const formData = new FormData()
    formData.append('email', 'test@example.com')
    formData.append('password', 'Password123!')
    formData.append('firstName', 'John')
    formData.append('lastName', 'Doe')
    formData.append('phone', '1234567890')
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
    ;(prisma.user.create as jest.Mock).mockResolvedValue({})

    await registerUser(formData)

    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ acceptsMarketing: false }),
      }),
    )
  })
})

import { hashPassword, verifyPassword } from './password'
import { compare } from 'bcryptjs'

jest.setTimeout(15000)

describe('hashPassword', () => {
  it('should hash a password', async () => {
    const password = 'testPassword123'
    const hashed = await hashPassword(password)

    expect(hashed).toBeDefined()
    expect(hashed).not.toBe(password)
    expect(typeof hashed).toBe('string')
  })

  it('should produce different hashes for the same password', async () => {
    const password = 'testPassword123'
    const hash1 = await hashPassword(password)
    const hash2 = await hashPassword(password)

    expect(hash1).not.toBe(hash2)
  })

  it('should produce a hash that matches the original password', async () => {
    const password = 'testPassword123'
    const hashed = await hashPassword(password)
    const isValid = await compare(password, hashed)

    expect(isValid).toBe(true)
  })

  it('should handle long passwords', async () => {
    const password = 'a'.repeat(100)
    const hashed = await hashPassword(password)

    expect(hashed).toBeDefined()
    const isValid = await compare(password, hashed)
    expect(isValid).toBe(true)
  })

  it('should handle special characters in passwords', async () => {
    const password = 'P@ssw0rd!#$%^&*()'
    const hashed = await hashPassword(password)

    const isValid = await compare(password, hashed)
    expect(isValid).toBe(true)
  })

  it('should handle empty password', async () => {
    const password = ''
    const hashed = await hashPassword(password)

    expect(hashed).toBeDefined()
    expect(typeof hashed).toBe('string')
    const isValid = await compare(password, hashed)
    expect(isValid).toBe(true)
  })

  it('should handle whitespace-only passwords', async () => {
    const password = '   '
    const hashed = await hashPassword(password)

    expect(hashed).toBeDefined()
    const isValid = await compare(password, hashed)
    expect(isValid).toBe(true)
  })

  it('should return a string with reasonable length', async () => {
    const password = 'testPassword123'
    const hashed = await hashPassword(password)

    expect(hashed.length).toBeGreaterThan(20)
  })

  describe('verifyPassword', () => {
    it('should return true when password matches the hash', async () => {
      const password = 'testPassword123'
      const hashed = await hashPassword(password)
      const isValid = await verifyPassword(password, hashed)

      expect(isValid).toBe(true)
    })

    it('should return false when password does not match the hash', async () => {
      const password = 'testPassword123'
      const hashed = await hashPassword(password)
      const isValid = await verifyPassword('wrongPassword', hashed)

      expect(isValid).toBe(false)
    })

    it('should return false with an empty password against a valid hash', async () => {
      const password = 'testPassword123'
      const hashed = await hashPassword(password)
      const isValid = await verifyPassword('', hashed)

      expect(isValid).toBe(false)
    })

    it('should handle special characters in password verification', async () => {
      const password = 'P@ssw0rd!#$%^&*()'
      const hashed = await hashPassword(password)
      const isValid = await verifyPassword(password, hashed)

      expect(isValid).toBe(true)
    })

    it('should be case sensitive', async () => {
      const password = 'TestPassword123'
      const hashed = await hashPassword(password)
      const isValid = await verifyPassword('testpassword123', hashed)

      expect(isValid).toBe(false)
    })
  })
})

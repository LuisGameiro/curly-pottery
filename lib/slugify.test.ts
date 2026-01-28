import { slugify } from './slugify'

describe('slugify', () => {
  it('should convert text to lowercase', () => {
    expect(slugify('HELLO WORLD')).toBe('hello-world')
  })

  it('should replace spaces with hyphens', () => {
    expect(slugify('hello world')).toBe('hello-world')
  })

  it('should trim whitespace', () => {
    expect(slugify('  hello world  ')).toBe('hello-world')
  })

  it('should remove special characters', () => {
    expect(slugify('hello@world!')).toBe('helloworld')
  })

  it('should replace multiple spaces with single hyphen', () => {
    expect(slugify('hello   world')).toBe('hello-world')
  })

  it('should replace multiple hyphens with single hyphen', () => {
    expect(slugify('hello--world')).toBe('hello-world')
  })

  it('should handle complex strings', () => {
    expect(slugify('The Quick Brown Fox!')).toBe('the-quick-brown-fox')
  })

  it('should handle strings with numbers', () => {
    expect(slugify('Hello 123 World')).toBe('hello-123-world')
  })

  it('should return empty string for empty input', () => {
    expect(slugify('')).toBe('')
  })

  it('should handle underscores', () => {
    expect(slugify('hello_world')).toBe('hello_world')
  })
})

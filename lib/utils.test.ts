import { cn } from './utils'

describe('cn', () => {
  it('should merge class names correctly', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2')
  })

  it('should handle conditional classes (falsy values)', () => {
    expect(cn('base', false && 'hidden', null, undefined, 0)).toBe('base')
  })

  it('should resolve Tailwind conflicts using twMerge', () => {
    // twMerge should keep only the last conflicting utility
    expect(cn('px-4', 'px-6')).toBe('px-6')
  })

  it('should handle clsx array syntax', () => {
    expect(cn(['px-4', 'py-2'], 'mx-auto')).toBe('px-4 py-2 mx-auto')
  })

  it('should handle object syntax', () => {
    expect(cn({ 'text-red-500': true, 'text-blue-500': false })).toBe(
      'text-red-500',
    )
  })
})

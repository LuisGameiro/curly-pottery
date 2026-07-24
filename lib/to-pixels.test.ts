import { toPixels } from './to-pixels'

describe('toPixels', () => {
  it('should convert number to pixel string', () => {
    expect(toPixels(100)).toBe('100px')
  })

  it('should convert zero to 0px', () => {
    expect(toPixels(0)).toBe('0px')
  })

  it('should return string input as-is', () => {
    expect(toPixels('100%')).toBe('100%')
    expect(toPixels('auto')).toBe('auto')
    expect(toPixels('calc(100vh - 50px)')).toBe('calc(100vh - 50px)')
  })

  it('should return empty string unchanged', () => {
    expect(toPixels('')).toBe('')
  })
})

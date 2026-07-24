import { shimmerDataUrl } from './shimmer'

describe('shimmerDataUrl', () => {
  it('should return a string starting with the data URI prefix', () => {
    const result = shimmerDataUrl(640, 480)
    expect(result).toMatch(/^data:image\/svg\+xml;base64,/)
  })

  it('should return valid base64 content after the prefix', () => {
    const result = shimmerDataUrl(640, 480)
    const base64Part = result.replace('data:image/svg+xml;base64,', '')
    // Should be valid base64 (no error when decoding)
    expect(() => Buffer.from(base64Part, 'base64')).not.toThrow()
    const decoded = Buffer.from(base64Part, 'base64').toString('utf-8')
    expect(decoded).toContain('<svg')
    expect(decoded).toContain('</svg>')
  })

  it('should reflect the width and height in the SVG', () => {
    const result1 = shimmerDataUrl(200, 100)
    const base64Part1 = result1.replace('data:image/svg+xml;base64,', '')
    const decoded1 = Buffer.from(base64Part1, 'base64').toString('utf-8')
    expect(decoded1).toContain('width="200"')
    expect(decoded1).toContain('height="100"')

    const result2 = shimmerDataUrl(800, 600)
    const base64Part2 = result2.replace('data:image/svg+xml;base64,', '')
    const decoded2 = Buffer.from(base64Part2, 'base64').toString('utf-8')
    expect(decoded2).toContain('width="800"')
    expect(decoded2).toContain('height="600"')
  })
})

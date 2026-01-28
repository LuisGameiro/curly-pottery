import { skulify } from './skulify'

describe('skulify', () => {
  it('should handle basic name, size, and color', () => {
    expect(
      skulify({ name: 'Blue Vase', sizeName: 'Large', colorName: 'Cobalt' }),
    ).toBe('blu-vas-Large-Cobalt')
  })

  it('should handle single word name', () => {
    expect(skulify({ name: 'Pot', sizeName: 'Medium', colorName: 'Red' })).toBe(
      'pot-Medium-Red',
    )
  })

  it('should handle empty strings', () => {
    expect(skulify({ name: '', sizeName: '', colorName: '' })).toBe('--')
  })

  it('should handle special characters in name', () => {
    expect(skulify({ name: 'Name@#$%', sizeName: 'S', colorName: 'C' })).toBe(
      'nam-S-C',
    )
  })

  it('should handle multiple spaces between words', () => {
    expect(
      skulify({
        name: 'Blue  Ceramic  Pot',
        sizeName: 'XL',
        colorName: 'Green',
      }),
    ).toBe('blu-cer-pot-XL-Green')
  })

  it('should lowercase the output', () => {
    expect(
      skulify({ name: 'BOWL', sizeName: 'LARGE', colorName: 'BLUE' }),
    ).toBe('bow-LARGE-BLUE')
  })

  it('should handle names shorter than 3 characters', () => {
    expect(skulify({ name: 'Mug Cup', sizeName: 'Sm', colorName: 'Wh' })).toBe(
      'mug-cup-Sm-Wh',
    )
  })

  it('should trim whitespace from name part', () => {
    expect(
      skulify({ name: '  Vase  ', sizeName: 'Med', colorName: 'Gold' }),
    ).toBe('vas-Med-Gold')
  })
})

import getSlug from '../../lib/get-slug'

/**
 * Behaviors covered:
 * 1. Removes a single leading slash
 * 2. Removes a single trailing slash
 * 3. Removes both leading and trailing slashes
 * 4. Leaves internal slashes untouched
 * 5. Returns empty string for only slashes
 * 6. Works with empty string input
 * 7. Works with nested paths
 * 8. Is idempotent (calling twice yields same result)
 */

describe('getSlug', () => {
  it('removes a single leading slash', () => {
    expect(getSlug('/product')).toBe('product')
  })

  it('removes a single trailing slash', () => {
    expect(getSlug('product/')).toBe('product')
  })

  it('removes both leading and trailing slashes', () => {
    expect(getSlug('/product/')).toBe('product')
  })

  it('leaves internal slashes untouched', () => {
    expect(getSlug('/category/product/variant')).toBe('category/product/variant')
  })

  it('returns empty string for only slashes', () => {
    expect(getSlug('////')).toBe('')
  })

  it('works with empty string input', () => {
    expect(getSlug('')).toBe('')
  })

  it('works with nested paths', () => {
    expect(getSlug('/a/b/c/')).toBe('a/b/c')
  })

  it('is idempotent', () => {
    const once = getSlug('/a/b/')
    const twice = getSlug(once)
    expect(once).toBe('a/b')
    expect(twice).toBe('a/b')
  })
})
